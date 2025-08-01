import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import OpenAIOnboarding from "../components/OpenAIOnboarding";
import VideoOnboarding from "../components/VideoOnboarding";
import { SettingsService } from "../services/api";
import { AppSettings } from "../services/api/models/AppSettings";
import { useAppSelector } from "../store/hooks";

// Animation variants
const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export default function OnboardingPage() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);

  // Get user data from Redux store
  const { user } = useAppSelector((state) => state.auth);
  const userEmail = user?.email || "";
  const userName = user?.full_name || "";

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const appSettings =
          await SettingsService.getAppSettingsApiV1SettingsSettingsGet();
        setSettings(appSettings);
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };

    fetchSettings();
  }, []);

  // Handle when a conversation is created
  const handleConversationCreated = (id: string) => {
    setConversationId(id);
    localStorage.setItem("tavus_conversation_id", id);
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen flex items-center justify-center p-4 bg-light-gradient dark:bg-dark-gradient relative overflow-hidden"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-br from-blue-200/40 to-blue-300/30 rounded-full blur-3xl transform translate-x-1/4 -translate-y-1/4 dark:from-blue-800/40 dark:to-blue-700/30"></div>
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-gray-200/30 to-blue-300/20 rounded-full blur-3xl transform -translate-x-1/4 translate-y-1/4 dark:from-blue-900/40 dark:to-blue-800/30"></div>

      <div
        className="w-full max-w-4xl p-4 sm:p-6 md:p-8 bg-white/95 dark:bg-gray-800/95 
                rounded-xl shadow-xl border border-gray-100 dark:border-gray-700
                backdrop-blur-md z-10"
      >
        {settings?.onboarding_provider === "tavus" ? (
          <VideoOnboarding
            email={userEmail}
            fullName={userName}
            onConversationCreated={handleConversationCreated}
          />
        ) : (
          <OpenAIOnboarding />
        )}
      </div>
    </motion.div>
  );
}
