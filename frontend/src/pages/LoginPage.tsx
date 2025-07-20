import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import OTPVerificationForm from "../components/OTPVerificationForm";
import ThemeToggle from "../components/ThemeToggle";
import {
  getOnboardingStatus,
  sendOTP,
  verifyOTP,
} from "../services/authService";

type LoginStep = "email" | "verify-otp";

// Animation variants for the main container
const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

// Animation for the card
const cardVariants = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<LoginStep>("email");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already authenticated
  useEffect(() => {
    // Just check if token exists, not making API calls from login page
    // This prevents duplicate onboarding checks
    if (localStorage.getItem("authToken")) {
      // We'll let the dashboard page check onboarding status
      navigate("/dashboard");
    }
  }, []);

  const handleEmailSubmit = async (email: string) => {
    setIsLoading(true);
    setError(null);
    setEmail(email);

    try {
      await sendOTP(email);
      setCurrentStep("verify-otp");
    } catch (err) {
      setError("Failed to send verification. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSubmit = async (otp: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await verifyOTP(email, otp);

      // Store auth token
      localStorage.setItem("authToken", response.access_token);

      // Check onboarding status and redirect accordingly
      try {
        const status = await getOnboardingStatus();
        if (status.is_onboarded) {
          navigate("/dashboard");
        } else {
          navigate("/onboarding");
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        // Default to dashboard if status check fails
        navigate("/dashboard");
      }
    } catch (err) {
      setError("Invalid code. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await sendOTP(email);
      setError("A new code has been sent to your email.");
    } catch (err) {
      setError("Failed to resend code. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
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

      <Toaster
        position="bottom-right"
        toastOptions={{
          className: "",
          style: {
            maxWidth: "500px",
            borderRadius: "8px",
          },
        }}
      />

      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <motion.div
        variants={cardVariants}
        className="w-full max-w-md p-4 sm:p-6 md:p-8 bg-white/95 dark:bg-gray-800/95 
                 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700
                 backdrop-blur-md z-10"
      >
        <AnimatePresence mode="wait">
          {currentStep === "email" ? (
            <LoginForm
              key="email-form"
              onSubmit={handleEmailSubmit}
              isLoading={isLoading}
            />
          ) : (
            <OTPVerificationForm
              key="otp-form"
              email={email}
              onSubmit={handleOTPSubmit}
              onResend={handleResendOTP}
              onBack={() => setCurrentStep("email")}
              isLoading={isLoading}
            />
          )}
        </AnimatePresence>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-6 p-3 rounded-lg text-sm font-medium shadow-sm ${
              error.includes("sent")
                ? "bg-green-50/80 dark:bg-green-900/30 text-green-800 dark:text-green-200 border border-green-100 dark:border-green-800/30"
                : "bg-red-50/80 dark:bg-red-900/30 text-red-800 dark:text-red-200 border border-red-100 dark:border-red-800/30"
            }`}
          >
            {error}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
