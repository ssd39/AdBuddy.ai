import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTavusConversation } from "../services/tavusService";
import { updateOnboardingState } from "../services/authService";
import toast from "../utils/toast";

interface VideoOnboardingProps {
  email: string;
  fullName?: string;
  onConversationCreated: (conversationId: string) => void;
}

export default function VideoOnboarding({
  email,
  fullName,
  onConversationCreated,
}: VideoOnboardingProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const startVideoCall = async () => {
    setIsLoading(true);

    try {
      // Parse full name into first and last name
      let firstName = "";
      let lastName = "";

      if (fullName) {
        const nameParts = fullName.trim().split(" ");
        if (nameParts.length > 0) {
          firstName = nameParts[0];
          if (nameParts.length > 1) {
            lastName = nameParts.slice(1).join(" ");
          }
        }
      }

      // Create a Tavus conversation
      const response = await createTavusConversation({
        email,
        first_name: firstName || undefined,
        last_name: lastName || undefined,
      });

      // Save the conversation ID for polling status later
      onConversationCreated(response.conversation_id);
      
      // Save conversation details in localStorage to maintain state across refreshes
      localStorage.setItem("tavus_conversation_id", response.conversation_id);
      localStorage.setItem("tavus_conversation_url", response.conversation_url);
      
      // Update backend with new onboarding state
      await updateOnboardingState({
        onboarding_state: 'video_call',
        conversation_id: response.conversation_id
      });

      // Redirect to the embedded video call page instead of opening in new tab
      navigate("/onboarding/video-call", {
        state: {
          conversationUrl: response.conversation_url,
          conversationId: response.conversation_id,
        },
        replace: true
      });
    } catch (error) {
      toast.error("Failed to start video call");
      console.error("Error creating Tavus conversation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-800 to-blue-600 dark:from-blue-400 dark:to-blue-200">
          Video Onboarding Experience
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Complete your onboarding with our AI specialist in just a few minutes
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 mb-8 border border-gray-100 dark:border-gray-700">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
            How It Works
          </h2>
          <ul className="space-y-4">
            <li className="flex items-start">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full h-6 w-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                <span className="text-blue-700 dark:text-blue-300 text-sm font-semibold">
                  1
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                Start a video call with our AI specialist who will guide you
                through the onboarding process
              </p>
            </li>
            <li className="flex items-start">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full h-6 w-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                <span className="text-blue-700 dark:text-blue-300 text-sm font-semibold">
                  2
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                Answer a few questions about you and your business to help us
                tailor AdBuddy.ai to your needs
              </p>
            </li>
            <li className="flex items-start">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full h-6 w-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                <span className="text-blue-700 dark:text-blue-300 text-sm font-semibold">
                  3
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                Once the call is complete, you'll be automatically redirected to
                your personalized dashboard
              </p>
            </li>
          </ul>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
            Ready to Start?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The video call will take approximately 5-7 minutes. Please ensure
            your camera and microphone are working.
          </p>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={startVideoCall}
            disabled={isLoading}
            className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-lg font-medium transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
                <span>Starting Video Call...</span>
              </>
            ) : (
              <>
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
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <span>Start Video Call</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
