import { motion } from "framer-motion";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "../utils/toast";
import { Conversation } from "./cvi/components/conversation";

interface TavusEmbeddedConversationProps {
  conversationUrl: string;
  conversationId?: string; // Optional conversationId parameter for direct redirection
  onLeave?: (event: any) => void;
  onReplicaStartedSpeaking?: () => void;
  onUserStartedSpeaking?: () => void;
}

// This component uses the Tavus CVI component library
// It follows the documentation from: https://docs.tavus.io/sections/integrations/embedding-cvi
const TavusEmbeddedConversation: React.FC<TavusEmbeddedConversationProps> = ({
  conversationUrl,
  conversationId,
  onLeave,
  onReplicaStartedSpeaking,
  onUserStartedSpeaking,
}) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("conversationUrl: ", conversationUrl);
  }, [conversationUrl]);
  // Handle errors that might occur during conversation setup
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);

  // Handle when conversation ends - redirect to lobby
  const handleConversationEnd = useCallback(
    (event?: any) => {
      console.log("Conversation ended:", event);

      // First call the provided onLeave callback if it exists
      if (onLeave) {
        onLeave(event);
      }
      // If no callback was provided, handle the navigation directly
      else {
        console.log("No onLeave handler provided, redirecting to lobby");

        // Extract conversation ID from the URL if not provided as prop
        // Format: https://tavus.io/conversations/{conversation_id}
        let extractedConversationId = conversationId;
        if (!extractedConversationId && conversationUrl) {
          const urlParts = conversationUrl.split("/");
          extractedConversationId = urlParts[urlParts.length - 1];
        }

        // Redirect to the lobby page
        navigate("/onboarding/lobby", {
          state: {
            conversationId: extractedConversationId,
            status: "processing",
          },
          replace: true,
        });

        toast.success("Video call completed. Processing your information...");
      }
    },
    [onLeave, navigate]
  );

  return (
    <div className="relative w-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg z-10">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-gray-700 dark:text-gray-300">
              Loading conversation...
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 dark:bg-red-900/20 rounded-lg z-10">
          <div className="text-center p-6">
            <svg
              className="w-12 h-12 text-red-500 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-red-700 dark:text-red-300 font-medium mb-2">
              Error loading conversation
            </p>
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        </div>
      )}

      <motion.div
        className="w-full rounded-lg border border-gray-200 dark:border-gray-700"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        style={{ display: "flex", flexDirection: "column" }}
      >
        <div style={{ flex: 1 }}>
          <Conversation
            conversationUrl={conversationUrl}
            onLeave={handleConversationEnd}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default TavusEmbeddedConversation;
