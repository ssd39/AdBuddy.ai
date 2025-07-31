import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Message } from "../components/ConversationArea";
import ConversationArea from "../components/ConversationArea";
import { CampaignsService } from "../services/api/services/CampaignsService";
import { campaignSpecialistPrompt } from "../services/campaign-specialist";
import type { WebRTCSession } from "../services/webrtc";
import { createWebRTCSession } from "../services/webrtc";

export default function CreateCampaignPage() {
  const navigate = useNavigate();

  // State for recording and chat
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [processing, setProcessing] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [callActive, setCallActive] = useState(false);
  const [userTranscript, setUserTranscript] = useState<string>("");
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sessionRef = useRef<WebRTCSession | null>(null);

  // Handle chat input submit
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: chatMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setChatMessage("");

    // Send message via WebRTC data channel if connected
    if (sessionRef.current && callActive) {
      sessionRef.current.sendText(chatMessage);
    }
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Create attachments array for the message
    const attachments = Array.from(files).map((file) => ({
      name: file.name,
      type: file.type,
      url: URL.createObjectURL(file),
    }));

    // Add message with attachments
    const userMessage: Message = {
      id: Date.now().toString(),
      text: `I've uploaded ${
        files.length > 1 ? "some materials" : "a file"
      } for reference: ${Array.from(files)
        .map((file) => file.name)
        .join(", ")}`,
      sender: "user",
      timestamp: new Date(),
      attachments,
    };

    setMessages((prev) => [...prev, userMessage]);

    // If WebRTC session is active, send a text message about the uploaded files
    if (sessionRef.current && callActive) {
      const fileDescription = `I've uploaded ${files.length} file${
        files.length > 1 ? "s" : ""
      }: ${Array.from(files)
        .map((file) => `${file.name} (${file.type})`)
        .join(", ")}`;

      sessionRef.current.sendText(fileDescription);
    }

    // Reset the file input
    if (e.target) {
      e.target.value = "";
    }
  };

  // Start the voice session
  const startSession = useCallback(async () => {
    try {
      setIsConnecting(true);
      setError(null);

      // Create a new WebRTC session
      const session = createWebRTCSession({
        systemPrompt: campaignSpecialistPrompt,
        voice: "verse", // Using the Verse voice
        initialGreeting:
          "Start the conversation by introducing yourself as an AdBuddy campaign specialist. Explain that you'll be guiding the user through creating an effective ad campaign through this voice conversation. Mention that you'll discuss target audience, business goals, budget, and creative direction. End with a friendly question asking them what kind of campaign they're looking to create today.",
        onTranscript: (text, isFinal) => {
          // For partial transcripts, show the AI is thinking
          if (!isFinal) {
            setIsAiThinking(true);
          }
          // For final transcripts, add them to messages
          else if (text.trim()) {
            setIsAiThinking(false);
            setMessages((prev) => [
              ...prev,
              {
                id: Date.now().toString(),
                text,
                sender: "ai",
                timestamp: new Date(),
              },
            ]);
          }
        },
        onUserTranscript: (text, isFinal) => {
          // For real-time transcription updates
          setUserTranscript(text);
          setIsUserSpeaking(true);

          // Add the final transcript to the messages
          if (isFinal && text.trim()) {
            setIsUserSpeaking(false);
            setUserTranscript("");
            setMessages((prev) => [
              ...prev,
              {
                id: Date.now().toString(),
                text,
                sender: "user",
                timestamp: new Date(),
              },
            ]);
          }
        },
        onConnecting: () => setIsConnecting(true),
        onConnected: () => {
          setIsConnecting(false);
          setCallActive(true);
          setIsRecording(true);
        },
        onError: (error) => {
          setIsConnecting(false);
          setError(error.message);
          setCallActive(false);
        },
        onDisconnect: () => {
          setCallActive(false);
          setIsRecording(false);
          setIsMuted(false);
        },
      });

      // Store the session in ref
      sessionRef.current = session;

      // Connect to OpenAI
      await session.connect();
    } catch (error) {
      console.error("Failed to start session:", error);
      setError("Failed to connect to AI specialist. Please try again.");
      setIsConnecting(false);
    }
  }, []);

  // Handle microphone toggle
  const toggleMicrophone = () => {
    if (callActive) {
      if (isRecording) {
        // Mute microphone
        sessionRef.current?.mute();
        setIsRecording(false);
        setIsMuted(true);
      } else {
        // Unmute microphone
        sessionRef.current?.unmute();
        setIsRecording(true);
        setIsMuted(false);
      }
    } else {
      // Start the session if not active
      startSession();
    }
  };

  // Handle submit conversation
  const handleSubmitConversation = async () => {
    setProcessing(true);
    setError(null);

    // Disconnect WebRTC session
    if (sessionRef.current) {
      sessionRef.current.disconnect();
      sessionRef.current = null;
    }

    // Reset state
    setCallActive(false);
    setIsRecording(false);
    setIsMuted(false);

    try {
      // Format messages for the API request
      const formattedMessages = messages.map((msg) => ({
        text: msg.text,
        sender: msg.sender,
        timestamp:
          msg.timestamp instanceof Date
            ? msg.timestamp.toISOString()
            : msg.timestamp,
      }));

      // Send the transcript to create a campaign
      const response =
        await CampaignsService.createCampaignApiV1CampaignsCreatePost({
          requestBody: {
            messages: formattedMessages,
          },
        });

      console.log("Campaign created:", response);

      // Poll for campaign status before redirecting to dashboard
      await pollCampaignStatus(response.id);
    } catch (error) {
      console.error("Failed to create campaign:", error);
      setError("Failed to create campaign. Please try again.");
      setProcessing(false);
    }
  };

  // Poll campaign status until it's complete or fails
  const pollCampaignStatus = async (campaignId: string) => {
    try {
      // Check campaign status every 2 seconds
      const interval = setInterval(async () => {
        const statusResponse =
          await CampaignsService.getCampaignStatusApiV1CampaignsStatusCampaignIdGet(
            {
              campaignId: campaignId,
            }
          );

        console.log("Campaign status:", statusResponse);

        // If status is no longer "processing", redirect to dashboard
        if (statusResponse.status !== "processing") {
          clearInterval(interval);
          navigate("/dashboard");
        }
      }, 2000);

      // Safety timeout after 30 seconds to prevent infinite polling
      setTimeout(() => {
        clearInterval(interval);
        navigate("/dashboard");
      }, 30000);
    } catch (error) {
      console.error("Error polling campaign status:", error);
      // If polling fails, still redirect to dashboard
      navigate("/dashboard");
    }
  };

  // Start the session automatically when component mounts
  useEffect(() => {
    // Start the WebRTC session after a short delay to ensure component is fully mounted
    const timer = setTimeout(() => {
      startSession();
    }, 800);

    // Clean up WebRTC session when component unmounts
    return () => {
      clearTimeout(timer);
      if (sessionRef.current) {
        sessionRef.current.disconnect();
        sessionRef.current = null;
      }
    };
  }, [startSession]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full overflow-hidden"
    >
      {/* Background gradient decorations - using fixed positioning which is different from absolute */}
      <div className="fixed -z-10 top-0 right-0 w-1/3 h-1/3 bg-gradient-to-br from-blue-200/10 to-blue-300/10 rounded-full blur-3xl dark:from-blue-800/20 dark:to-blue-700/20 pointer-events-none transition-all duration-300"></div>
      <div className="fixed -z-10 bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-gray-200/10 to-blue-300/10 rounded-full blur-3xl dark:from-blue-900/20 dark:to-blue-800/20 pointer-events-none transition-all duration-300"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8  overflow-y-auto h-full flex flex-col">
        <div className="mb-4">
          <Link
            to="/dashboard"
            className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        {/* Page Title */}
        <div className="mb-2">
          <h1 className="text-3xl font-bold text-white">Create Campaign</h1>
          <p className="text-neutral-400 mt-1">
            Talk with our AI campaign specialist to create your perfect ad
            campaign
          </p>
        </div>

        {processing ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="w-40 h-40 mb-6 flex items-center justify-center bg-blue-900/20 rounded-full animate-pulse overflow-hidden">
                <div className="flex items-center justify-center">
                  <svg
                    className="w-20 h-20 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-semibold text-neutral-100 mb-2">
                Creating Your Campaign
              </h2>
              <p className="text-neutral-400 max-w-md text-center mb-8">
                Our AI agents are working hard to create your optimized campaign
                based on our conversation.
              </p>
              <div className="flex space-x-3">
                <div
                  className="h-3 w-3 bg-blue-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="h-3 w-3 bg-blue-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="h-3 w-3 bg-blue-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Conversation Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <ConversationArea
                messages={messages}
                isAiThinking={isAiThinking}
              />

              {/* User speaking transcription indicator */}
              {isUserSpeaking && userTranscript && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-center mt-2 mb-4"
                >
                  <div className="bg-green-900/30 px-4 py-3 rounded-xl shadow-lg border border-green-700/50 max-w-2xl">
                    <div className="flex items-center mb-1">
                      <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                      <span className="text-green-300 text-xs font-medium">
                        Transcribing your speech...
                      </span>
                    </div>
                    <p className="text-white text-sm">{userTranscript}</p>
                  </div>
                </motion.div>
              )}

              {/* Controls Section - With proper positioning */}
              <div className="py-3 px-4 mt-auto flex flex-col space-y-4">
                {/* Hidden file input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  multiple
                />

                {/* Control buttons - Centered at bottom, matching screenshot */}
                <div className="inline-flex justify-center items-center space-x-6 bg-gray-800/50 py-2 px-8 rounded-full border border-gray-700/30 mx-auto">
                  {/* End Call Button */}
                  <button
                    onClick={handleSubmitConversation}
                    className="p-4 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all duration-200"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>

                  {/* Microphone Button */}
                  <button
                    onClick={toggleMicrophone}
                    className={`p-4 rounded-full ${
                      isConnecting
                        ? "bg-gray-600 text-white animate-pulse shadow-lg shadow-gray-900/40"
                        : isRecording
                        ? "bg-red-600 text-white animate-pulse shadow-lg shadow-red-900/40"
                        : isMuted
                        ? "bg-gray-700 text-gray-400"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    } transition-all duration-200 shadow-lg shadow-blue-600/20`}
                    disabled={isConnecting}
                  >
                    {isConnecting ? (
                      <svg
                        className="w-6 h-6 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    ) : isMuted ? (
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 3l18 18"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                        />
                      </svg>
                    )}
                  </button>

                  {/* Chat Button */}
                  <button
                    onClick={() => setShowChat(!showChat)}
                    className="p-4 rounded-full bg-gray-700 text-white hover:bg-gray-600 shadow-lg shadow-gray-700/20 transition-all duration-200"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </button>
                </div>

                {/* Expanding chat input */}
                {showChat && (
                  <motion.form
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleSendMessage}
                    className="flex justify-center px-4"
                  >
                    <div className="w-full max-w-xl flex">
                      <input
                        type="text"
                        placeholder="Type your message..."
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        className="flex-1 py-3.5 px-5 bg-[#1e293b] rounded-l-full text-neutral-100 focus:outline-none border border-r-0 border-gray-700"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="p-2.5 rounded-r-full bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 border border-blue-600"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          />
                        </svg>
                      </button>
                    </div>
                  </motion.form>
                )}

                {/* Status indicators */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-center"
                  >
                    <div className="bg-red-900/50 px-4 py-2 rounded-full shadow-lg flex items-center border border-red-700">
                      <svg
                        className="h-5 w-5 text-red-500 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      <span className="text-red-100 text-sm">{error}</span>
                    </div>
                  </motion.div>
                )}

                {/* Recording indicator */}
                {isRecording && !isUserSpeaking && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-center"
                  >
                    <div className="bg-gray-800 px-4 py-2 rounded-full shadow-lg flex items-center border border-gray-700">
                      <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse mr-2"></div>
                      <span className="text-neutral-100 text-sm">
                        Recording...
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* Connecting indicator */}
                {isConnecting && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-center"
                  >
                    <div className="bg-blue-900/50 px-4 py-2 rounded-full shadow-lg flex items-center border border-blue-700">
                      <div className="h-3 w-3 bg-blue-500 rounded-full animate-pulse mr-2"></div>
                      <span className="text-blue-100 text-sm">
                        Connecting to AI specialist...
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
