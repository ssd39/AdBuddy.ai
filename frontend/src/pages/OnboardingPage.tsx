import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import OnboardingForm from "../components/OnboardingForm";
import VideoOnboarding from "../components/VideoOnboarding";
import ThemeToggle from "../components/ThemeToggle";
import type { OnboardingData } from "../services/api";
import { completeOnboarding } from "../services/authService";
import toast from "../utils/toast";
import OnboardingLobbyPage from "./OnboardingLobbyPage";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { completeOnboarding as completeOnboardingAction } from "../store/authActions";

// Animation variants
const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export default function OnboardingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  
  // Get user data from Redux store
  const { user } = useAppSelector(state => state.auth);
  const userEmail = user?.email || "";
  const userName = user?.full_name || "";

  // Handle form onboarding submission
  const handleFormSubmit = async (formData: any) => {
    setIsLoading(true);

    try {
      // Map form data to API type
      const apiData: OnboardingData = {
        full_name: formData.full_name,
        company_name: formData.company_name,
        role: formData.role,
        industry: formData.industry,
      };

      // Use both the Redux action and the service call
      await dispatch(completeOnboardingAction(apiData));
      await completeOnboarding(apiData);

      // Redirect to dashboard after successful onboarding
      navigate("/dashboard");
    } catch (error) {
      toast.error("Failed to complete onboarding");
      console.error("Error completing onboarding:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle when a conversation is created
  const handleConversationCreated = (id: string) => {
    setConversationId(id);
    localStorage.setItem("tavus_conversation_id", id);
  };

  // If on the main onboarding path, show the video onboarding option
  if (location.pathname === "/onboarding") {
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

        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>

        <div
          className="w-full max-w-4xl p-4 sm:p-6 md:p-8 bg-white/95 dark:bg-gray-800/95 
                rounded-xl shadow-xl border border-gray-100 dark:border-gray-700
                backdrop-blur-md z-10"
        >
          <VideoOnboarding 
            email={userEmail} 
            fullName={userName} 
            onConversationCreated={handleConversationCreated} 
          />
        </div>
      </motion.div>
    );
  }
  
  // For the form-based onboarding route
  if (location.pathname === "/onboarding/form") {
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

        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>

        <div
          className="w-full max-w-2xl p-4 sm:p-6 md:p-8 bg-white/95 dark:bg-gray-800/95 
                rounded-xl shadow-xl border border-gray-100 dark:border-gray-700
                backdrop-blur-md z-10"
        >
          <div className="mb-4">
            <button 
              onClick={() => navigate("/onboarding")}
              className="text-blue-600 dark:text-blue-400 flex items-center gap-2 hover:underline"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Video Onboarding
            </button>
          </div>
          <OnboardingForm onSubmit={handleFormSubmit} isLoading={isLoading} />
        </div>
      </motion.div>
    );
  }
  
  // Default fallback (shouldn't happen with proper routing)
  return null;
}
