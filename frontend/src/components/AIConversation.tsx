import { AnimatePresence, motion } from "framer-motion";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { OpenaiService } from "../services/api";
import { updateOnboardingState } from "../services/authService";
import type { WebRTCSession, WebRTCSessionOptions } from "../services/webrtc";
import { createWebRTCSession } from "../services/webrtc";
import toast from "../utils/toast";

interface AIConversationProps {
  sessionId: string;
  userName?: string;
  userEmail?: string;
}

const AIConversation: React.FC<AIConversationProps> = ({
  sessionId,
  userName,
  userEmail,
}) => {
  const navigate = useNavigate();
  const [isConnecting, setIsConnecting] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [transcriptText, setTranscriptText] = useState("");
  const [finalTranscriptParts, setFinalTranscriptParts] = useState<string[]>(
    []
  );
  const [currentAIText, setCurrentAIText] = useState("");
  const [currentUserText, setCurrentUserText] = useState("");

  // Reference to the WebRTC session
  const sessionRef = useRef<WebRTCSession | null>(null);

  // Track if the conversation is ending/has ended
  const [isEnding, setIsEnding] = useState(false);

  // Function to handle the end of conversation
  const endConversation = useCallback(async () => {
    if (isEnding) return;
    setIsEnding(true);

    try {
      // Disconnect the WebRTC session
      if (sessionRef.current) {
        sessionRef.current.disconnect();
      }

      // Complete onboarding with the transcript
      if (finalTranscriptParts.length > 0) {
        const fullTranscript = finalTranscriptParts.join("\n");

        // Send transcript to backend for processing
        await OpenaiService.onboardingCompleteApiV1OpenaiOnboardingCompletePost(
          {
            requestBody: {
              transcript: fullTranscript,
              conversation_id: sessionId,
            },
          }
        );

        // Update onboarding state
        await updateOnboardingState({
          onboarding_state: "in_lobby",
          conversation_id: sessionId,
        });

        // Clear session data
        localStorage.removeItem("openai_session_id");

        // Redirect to lobby page
        navigate("/onboarding/lobby", {
          state: {
            conversationId: sessionId,
            status: "processing",
          },
          replace: true,
        });

        toast.success(
          "AI conversation completed. Processing your information..."
        );
      } else {
        toast.error("No conversation data to process. Please try again.");
        navigate("/onboarding", { replace: true });
      }
    } catch (error) {
      console.error("Error ending conversation:", error);
      toast.error("An error occurred while ending the conversation.");
      navigate("/onboarding", { replace: true });
    }
  }, [isEnding, finalTranscriptParts, navigate, sessionId]);

  // AI prompt for the conversation
  const systemPrompt = `
    You are AdBuddy's AI Onboarding Specialist. Your role is to conduct a friendly, professional conversation with new users to collect essential business information. Maintain a conversational tone while ensuring you gather all required data points. Speak clearly and use natural pauses.

    Conversation Structure:

    1. Opening (30 seconds)
    - Greet the user warmly with a time-appropriate greeting (Good morning/afternoon/evening)
    - Introduce yourself: "I'm AdBuddy's AI Onboarding Specialist. I'll be guiding you through our quick onboarding process today."
    - Set expectations: "This will take about 5-7 minutes. I'll ask you some questions about you and your business so we can customize AdBuddy to best serve your needs."
    - Get consent: "Is it okay if I record this session for quality assurance? You can say no if you prefer."

    2. Personal Information (1 minute)
    - Ask for full name
    - Ask for preferred name
    - Ask for role/position in company
    - Ask for best email for notifications

    3. Company Information (1-2 minutes)
    - Ask for company name
    - Ask when business was established
    - Ask for number of employees
    - Ask for brief description of company (1-2 sentences)

    4. Business Type Determination (30 seconds)
    - Ask if primarily online, offline, or combination

    5a. Online Business Details (if applicable) (2 minutes)
    - Ask about online presence type
    - Ask about platforms/marketplaces used
    - Ask about primary business model
    - Ask about current digital marketing strategies
    - Ask about main challenges with online advertising

    5b. Offline Business Details (if applicable) (2 minutes)
    - Ask about business location(s)
    - Ask about type of physical establishment
    - Ask how customers typically find the business
    - Ask about local marketing strategies tried
    - Ask about main challenges with local advertising

    6. Industry & Customer Information (1-2 minutes)
    - Ask about industry/sector classification
    - Ask about primary customers/target audience
    - Ask about most valuable customer segments
    - Ask what sets business apart from competitors

    7. Business Goals (1 minute)
    - Ask about primary business goals (6-12 months)
    - Ask about specific advertising/marketing objectives
    - Ask what success with AdBuddy would look like
    - Ask about budget constraints for advertising

    8. Current Challenges (1 minute)
    - Ask about current advertising/marketing challenges
    - Ask about previous advertising platforms used
    - Ask about most difficult aspects of advertising to manage

    9. Additional Context
    - Ask if there's any other helpful information
    - Ask about specific requirements for AdBuddy

    10. Closing (30 seconds)
    - Summarize key information collected
    - Explain next steps
    - Express gratitude
    - End call professionally
    
    Maintain a professional yet friendly tone throughout. Use active listening, acknowledge responses, and adapt questions based on previous answers. If user seems hesitant, reassure about data privacy. Speak at a moderate pace with natural pauses.
  `;

  // Set up WebRTC connection
  useEffect(() => {
    const connectToOpenAI = async () => {
      setIsConnecting(true);

      try {
        // Configure WebRTC session
        const options: WebRTCSessionOptions = {
          systemPrompt,
          voice: "alloy", // Default voice
          initialGreeting: `Hello there! I'm AdBuddy's AI Onboarding Specialist. I'll be guiding you through our quick onboarding process today. This will take about 5-7 minutes, and I'll ask you some questions about you and your business so we can customize AdBuddy to best serve your needs.${
            userName ? ` It's nice to meet you, ${userName.split(" ")[0]}.` : ""
          } Is it okay if I record this session for quality assurance?`,
          onConnecting: () => {
            console.log("Connecting to OpenAI...");
          },
          onConnected: () => {
            console.log("Connected to OpenAI");
            setIsConnected(true);
            setIsConnecting(false);
          },
          onSessionReady: () => {
            console.log("Session is ready");
          },
          onTranscript: (text, isFinal) => {
            console.log(`AI: ${text} (final: ${isFinal})`);

            // If this is a partial transcript update, show the text as it comes in
            if (!isFinal) {
              setCurrentAIText(text);
              setIsAISpeaking(true);
            } else {
              // If this is a final transcript, add it to the conversation history
              setCurrentAIText("");
              setIsAISpeaking(false);
              setFinalTranscriptParts((prev) => [...prev, `AI: ${text}`]);
            }
          },
          onUserTranscript: (text, isFinal) => {
            console.log(`User: ${text} (final: ${isFinal})`);

            // If this is a partial transcript update, show the text as it comes in
            if (!isFinal) {
              setCurrentUserText(text);
              setIsUserSpeaking(true);
            } else {
              // If this is a final transcript, add it to the conversation history
              setCurrentUserText("");
              setIsUserSpeaking(false);
              setFinalTranscriptParts((prev) => [...prev, `User: ${text}`]);
            }
          },
          onDisconnect: () => {
            console.log("Disconnected from OpenAI");
            setIsConnected(false);

            // If not already ending the conversation, handle the disconnect
            if (!isEnding) {
              endConversation();
            }
          },
          onError: (error) => {
            console.error("WebRTC error:", error);
            toast.error("Error connecting to AI: " + error.message);
            setIsConnecting(false);
          },
        };

        // Create WebRTC session
        const session = createWebRTCSession(options);
        sessionRef.current = session;

        // Connect to OpenAI
        await session.connect();
      } catch (error) {
        console.error("Error setting up WebRTC:", error);
        setIsConnecting(false);
        toast.error("Failed to start AI conversation. Please try again.");
      }
    };

    connectToOpenAI();

    // Cleanup function
    return () => {
      if (sessionRef.current) {
        sessionRef.current.disconnect();
      }
    };
  }, [userName]);

  // Handle mute/unmute
  const toggleMute = () => {
    if (!sessionRef.current) return;

    if (isMuted) {
      sessionRef.current.unmute();
    } else {
      sessionRef.current.mute();
    }

    setIsMuted(!isMuted);
  };

  // Combine the live and final transcripts for a complete view
  useEffect(() => {
    const combinedTranscript = [
      ...finalTranscriptParts,
      isAISpeaking ? `AI: ${currentAIText}` : "",
      isUserSpeaking ? `User: ${currentUserText}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    setTranscriptText(combinedTranscript);
  }, [
    finalTranscriptParts,
    currentAIText,
    currentUserText,
    isAISpeaking,
    isUserSpeaking,
  ]);

  return (
    <div className="relative w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-800 min-h-[600px] flex flex-col">
      {/* Main conversation area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        {/* Speaker visualization */}
        <div className="relative mb-8">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 opacity-20"></div>

          {/* Middle animated ring - visible when AI is speaking */}
          <AnimatePresence>
            {isAISpeaking && (
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 opacity-40"
                initial={{ scale: 1 }}
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.4, 0.6, 0.4],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut",
                }}
              ></motion.div>
            )}
          </AnimatePresence>

          {/* Inner circle with microphone icon */}
          <div className="relative h-40 w-40 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 flex items-center justify-center shadow-lg">
            <motion.div
              animate={
                isAISpeaking
                  ? {
                      scale: [1, 1.05, 1],
                      transition: { repeat: Infinity, duration: 1 },
                    }
                  : {}
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </motion.div>
          </div>

          {/* User speaking indicator */}
          {isUserSpeaking && (
            <motion.div
              className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs py-1 px-3 rounded-full"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              You're speaking
            </motion.div>
          )}
        </div>

        {/* Connection status indicators */}
        <div className="text-center mb-4">
          {isConnecting && (
            <div className="flex items-center justify-center mb-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full mr-2"
              />
              <span className="text-gray-600 dark:text-gray-300">
                Connecting...
              </span>
            </div>
          )}

          {isConnected && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-green-600 dark:text-green-400 flex items-center justify-center mb-2"
            >
              <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-2"></span>
              Connected
            </motion.div>
          )}

          {isAISpeaking && isConnected && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-blue-600 dark:text-blue-400 font-medium"
            >
              {currentAIText || "AI is speaking..."}
            </motion.p>
          )}

          {!isAISpeaking && isConnected && !isConnecting && (
            <p className="text-gray-600 dark:text-gray-400">
              {isUserSpeaking ? "I'm listening..." : "Waiting for response..."}
            </p>
          )}
        </div>
      </div>

      {/* Controls area */}
      <div className="flex items-center justify-center p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex space-x-4">
          {/* Mute/Unmute button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleMute}
            className={`p-3 rounded-full flex items-center justify-center ${
              isMuted
                ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
            }`}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                  clipRule="evenodd"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            )}
          </motion.button>

          {/* End call button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={endConversation}
            disabled={isEnding}
            className="p-3 rounded-full bg-red-500 text-white hover:bg-red-600 disabled:opacity-70 disabled:cursor-not-allowed"
            title="End Call"
          >
            {isEnding ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
              />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z"
                />
              </svg>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default AIConversation;
