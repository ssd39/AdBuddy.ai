import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateOnboardingState } from "../services/authService";
import { useAppSelector } from "../store/hooks";
import toast from "../utils/toast";

interface OpenAIOnboardingProps {
  onSessionCreated?: (sessionId: string) => void;
}

const OpenAIOnboarding: React.FC<OpenAIOnboardingProps> = ({
  onSessionCreated,
}) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Get user data from Redux store
  const { user } = useAppSelector((state) => state.auth);
  const userEmail = user?.email || "";
  const userName = user?.full_name || "";

  const startAICall = async () => {
    setIsLoading(true);

    try {
      // Create a unique session ID for tracking
      const sessionId = `openai-session-${Date.now()}`;

      // Store session info in localStorage
      localStorage.setItem("openai_session_id", sessionId);

      // Update backend with new onboarding state
      await updateOnboardingState({
        onboarding_state: "ai_call",
        conversation_id: sessionId,
      });

      // Notify parent component if needed
      if (onSessionCreated) {
        onSessionCreated(sessionId);
      }

      // Navigate to the AI call page
      navigate("/onboarding/ai-call", {
        state: {
          sessionId: sessionId,
          userName: userName,
          userEmail: userEmail,
        },
        replace: true,
      });
    } catch (error) {
      toast.error("Failed to start AI conversation");
      console.error("Error starting OpenAI conversation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-800 to-blue-600 dark:from-blue-400 dark:to-blue-200">
          AI Onboarding Experience
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
                Start a conversation with our AI specialist who will guide you
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
                Once the conversation is complete, you'll be automatically
                redirected to your personalized dashboard
              </p>
            </li>
          </ul>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
            Ready to Start?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The conversation will take approximately 5-7 minutes. Please ensure
            your microphone is working.
          </p>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={startAICall}
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
                <span>Starting Conversation...</span>
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
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
                <span>Start AI Conversation</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default OpenAIOnboarding;
