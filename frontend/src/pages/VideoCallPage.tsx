import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import TavusConversation from "../components/TavusConversation";
import toast from "../utils/toast";

// Animation variants
const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export default function VideoCallPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  // Get conversation details from location state or localStorage
  const conversationUrl = location.state?.conversationUrl;
  const conversationId = location.state?.conversationId || localStorage.getItem("tavus_conversation_id");

  useEffect(() => {
    // Redirect if no conversation URL is provided
    if (!conversationUrl || !conversationId) {
      toast.error("No conversation information found");
      navigate("/onboarding", { replace: true });
      return;
    }

    // Set loading false after a short delay to allow the component to mount
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [conversationUrl, conversationId, navigate]);

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen p-4 bg-light-gradient dark:bg-dark-gradient relative overflow-hidden"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-br from-blue-200/40 to-blue-300/30 rounded-full blur-3xl transform translate-x-1/4 -translate-y-1/4 dark:from-blue-800/40 dark:to-blue-700/30"></div>
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-gray-200/30 to-blue-300/20 rounded-full blur-3xl transform -translate-x-1/4 translate-y-1/4 dark:from-blue-900/40 dark:to-blue-800/30"></div>

      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-800 to-blue-600 dark:from-blue-400 dark:to-blue-200">
            Video Onboarding Session
          </h1>

          <div className="w-full max-w-4xl mx-auto">
            {isLoading ? (
              <div className="w-full h-[600px] flex items-center justify-center bg-white/95 dark:bg-gray-800/95 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
                  />
                  <p className="text-gray-700 dark:text-gray-300">Preparing your video call...</p>
                </div>
              </div>
            ) : (
              <TavusConversation
                conversationUrl={conversationUrl}
                conversationId={conversationId}
              />
            )}
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
              Speak clearly and answer the questions to complete your onboarding. 
              Your responses will help us customize AdBuddy.ai to your specific needs.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}