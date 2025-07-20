import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import { updateOnboardingState } from "../services/authService";
import { pollConversationStatus } from "../services/tavusService";
import toast from "../utils/toast";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
};

// Animation for the progress indicator
const progressAnimation = {
  initial: { width: "0%" },
  animate: {
    width: "100%",
    transition: {
      duration: 30,
      ease: "linear",
    },
  },
};

export default function OnboardingLobbyPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isPolling, setIsPolling] = useState(true);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string>(
    "Processing your onboarding information"
  );
  const pollingRef = useRef(false);

  // Get conversation ID from location state or localStorage
  const conversationIdFromState = location.state?.conversationId;
  const conversationIdFromStorage = localStorage.getItem(
    "tavus_conversation_id"
  );
  const conversationId = conversationIdFromState || conversationIdFromStorage;

  // Get the status from location state (if provided)
  const statusFromState = location.state?.status;

  // Messages to cycle through while waiting
  const statusMessages = [
    "Processing your onboarding information",
    "Analyzing your business needs",
    "Customizing your AdBuddy.ai experience",
    "Preparing your personalized dashboard",
    "Setting up your account preferences",
    "Almost there! Finalizing your profile",
  ];

  useEffect(() => {
    // Redirect to onboarding if no conversation ID provided
    if (!conversationId) {
      toast.error("No conversation information found");
      navigate("/onboarding", { replace: true });
      return;
    }

    // Change status message every 6 seconds
    const messageInterval = setInterval(() => {
      setStatusMessage((prevMessage) => {
        const currentIndex = statusMessages.indexOf(prevMessage);
        const nextIndex = (currentIndex + 1) % statusMessages.length;
        return statusMessages[nextIndex];
      });
    }, 6000);

    // Poll for conversation status
    const checkStatus = async () => {
      // Skip if already polling
      if (pollingRef.current) return;

      pollingRef.current = true;

      try {
        await pollConversationStatus(
          conversationId,
          5000, // Check every 5 seconds
          120 // Max 10 minutes (600 seconds) of polling
        );

        // Conversation is completed, update state, clear the video session ID and redirect to dashboard
        try {
          // Update backend state
          await updateOnboardingState({
            onboarding_state: "completed",
          });

          // Clear local storage
          localStorage.removeItem("tavus_conversation_id");
          localStorage.removeItem("tavus_conversation_url");

          toast.success("Onboarding completed successfully!");
          navigate("/dashboard", { replace: true });
        } catch (error) {
          console.error("Error updating onboarding state:", error);
          // Still navigate to dashboard even if update fails
          navigate("/dashboard", { replace: true });
        }
      } catch (error) {
        console.error("Error polling conversation status:", error);
        setIsPolling(false);
        toast.error("Could not verify onboarding status");
      } finally {
        pollingRef.current = false;
      }
    };

    // Start polling
    checkStatus();

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        // Max progress while waiting is 90%
        return Math.min(prev + 0.5, 90);
      });
    }, 3000);

    // Clean up intervals on unmount
    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, [conversationId, navigate, statusMessages]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen flex items-center justify-center p-4 bg-light-gradient dark:bg-dark-gradient relative overflow-hidden"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-br from-blue-200/40 to-blue-300/30 rounded-full blur-3xl transform translate-x-1/4 -translate-y-1/4 dark:from-blue-800/40 dark:to-blue-700/30"></div>
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-gray-200/30 to-blue-300/20 rounded-full blur-3xl transform -translate-x-1/4 translate-y-1/4 dark:from-blue-900/40 dark:to-blue-800/30"></div>

      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <motion.div
        variants={itemVariants}
        className="w-full max-w-xl p-6 sm:p-10 bg-white/95 dark:bg-gray-800/95 
                 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700
                 backdrop-blur-md z-10 text-center"
      >
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-800 to-blue-600 dark:from-blue-400 dark:to-blue-200">
            {statusFromState === "processing"
              ? "Processing Your Information"
              : "Creating Your Personalized Experience"}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {statusFromState === "processing"
              ? "Thank you for completing the video onboarding. We're processing your information."
              : "We're now crafting your tailored AdBuddy.ai experience based on your video call."}
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-8">
          <div className="w-32 h-32 mx-auto mb-6 relative">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-blue-500 dark:border-blue-400"
              style={{
                borderTopColor: "transparent",
                borderRightColor: "transparent",
              }}
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear",
              }}
            />

            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-blue-500 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
            {statusMessage}
          </h2>

          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4 overflow-hidden">
            <motion.div
              className="h-full bg-blue-600 dark:bg-blue-500 rounded-full"
              style={{ width: `${progress}%` }}
              initial={{ width: "0%" }}
            />
          </div>

          <p className="text-gray-500 dark:text-gray-400 text-sm">
            This process may take a few moments. Please don't close this window.
          </p>
        </motion.div>

        {!isPolling && (
          <motion.div variants={itemVariants} className="mt-6">
            <p className="text-amber-600 dark:text-amber-400 mb-4">
              It's taking longer than expected to complete your onboarding.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate("/dashboard")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Dashboard
              </button>
              {statusFromState === "processing" ? (
                <button
                  onClick={() => {
                    const conversationUrl = localStorage.getItem(
                      "tavus_conversation_url"
                    );
                    if (conversationUrl && conversationId) {
                      navigate("/onboarding/video-call", {
                        state: { conversationUrl, conversationId },
                        replace: true,
                      });
                    } else {
                      navigate("/onboarding", { replace: true });
                    }
                  }}
                  className="px-4 py-2 border border-blue-500 text-blue-700 dark:text-blue-400 dark:border-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  Return to Video Call
                </button>
              ) : (
                <button
                  onClick={() => navigate("/onboarding", { replace: true })}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Try Again
                </button>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
