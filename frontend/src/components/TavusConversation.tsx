import { motion } from "framer-motion";
import React from "react";
import { useNavigate } from "react-router-dom";
import { updateOnboardingState } from "../services/authService";
import toast from "../utils/toast";
import TavusEmbeddedConversation from "./TavusEmbeddedConversation";

interface TavusConversationProps {
  conversationUrl: string;
  conversationId: string;
}

const TavusConversation: React.FC<TavusConversationProps> = ({
  conversationUrl,
  conversationId,
}) => {
  const navigate = useNavigate();

  // Handle when the user leaves the conversation
  const handleLeave = async (event: any) => {
    // Log that the conversation has ended
    console.log("Conversation ended:", event);

    try {
      // Update backend state
      await updateOnboardingState({
        onboarding_state: "in_lobby",
        conversation_id: conversationId,
      });

      // Redirect to the lobby page to wait for processing
      navigate("/onboarding/lobby", {
        state: {
          conversationId: conversationId,
          status: "processing",
        },
        replace: true,
      });

      toast.success("Video call completed. Processing your information...");
    } catch (error) {
      console.error("Error updating onboarding state:", error);
      // Still redirect even if state update fails
      navigate("/onboarding/lobby", {
        state: { conversationId },
        replace: true,
      });
    }
  };

  // Additional event handlers
  const handleReplicaStartedSpeaking = () => {
    console.log("Replica started speaking");
  };

  const handleUserStartedSpeaking = () => {
    console.log("User started speaking");
  };

  return (
    <motion.div
      className="w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <TavusEmbeddedConversation
        conversationUrl={conversationUrl}
        conversationId={conversationId}
        onLeave={handleLeave}
        onReplicaStartedSpeaking={handleReplicaStartedSpeaking}
        onUserStartedSpeaking={handleUserStartedSpeaking}
      />
    </motion.div>
  );
};

export default TavusConversation;
