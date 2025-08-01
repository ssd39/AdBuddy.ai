import toast from "../utils/toast";
import type { OnboardingData, User } from "./api";
import { AuthService, OnboardingService, OpenAPI } from "./api";
import type { UpdateOnboardingStateRequest } from "./api/models/UpdateOnboardingStateRequest";

// Configure the base URL for API client
OpenAPI.BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Add auth token to requests
const updateAuthHeader = () => {
  const token = localStorage.getItem("authToken");
  if (token) {
    OpenAPI.TOKEN = token;
  } else {
    OpenAPI.TOKEN = undefined;
  }
};

// Handle API errors including token expiration
export const handleApiError = (error: any) => {
  console.error("API Error:", error);

  // Check if it's an unauthorized error (401)
  if (
    error?.status === 401 ||
    error?.response?.status === 401 ||
    error?.message?.includes("401") ||
    error?.message?.includes("unauthorized") ||
    error?.message?.includes("Unauthorized") ||
    error?.message?.includes("token expired")
  ) {
    // Token is expired or invalid
    toast.error("Your session has expired. Please log in again.");
    logout();
    return;
  }

  // Handle other errors
  toast.error("An error occurred. Please try again.");
};

// Call this when app initializes
export function initializeAuth() {
  updateAuthHeader();

  // Add a global error handler for API requests
  // Actual implementation depends on the API client used
}

// Send OTP to email
export async function sendOTP(email: string): Promise<{ message: string }> {
  try {
    const response = await AuthService.loginSendOtpApiV1AuthLoginOtpSendPost({
      requestBody: { email },
    });
    toast.success("Verification code sent to your email");
    return response;
  } catch (error) {
    toast.error("Failed to send verification code");
    console.error("Error sending OTP:", error);
    throw error;
  }
}

// Verify OTP
export async function verifyOTP(
  email: string,
  otp: string
): Promise<{ access_token: string; token_type: string }> {
  try {
    const response =
      await AuthService.loginVerifyOtpApiV1AuthLoginOtpVerifyPost({
        requestBody: {
          email,
          otp,
        },
      });

    // Store the token in localStorage
    if (response.access_token) {
      localStorage.setItem("authToken", response.access_token);
      updateAuthHeader();
      toast.success("Successfully logged in");
    }

    return {
      access_token: response.access_token || "",
      token_type: response.token_type || "bearer",
    };
  } catch (error) {
    toast.error("Invalid verification code");
    console.error("Error verifying OTP:", error);
    throw error;
  }
}

// Get current user profile
export async function getCurrentUser(): Promise<User> {
  try {
    return await AuthService.getUserMeApiV1AuthMeGet();
  } catch (error) {
    console.error("Error getting current user:", error);
    // Check if this is an auth error and handle it
    handleApiError(error);
    throw error;
  }
}

// Check if user is logged in and token is not expired
export function isAuthenticated(): boolean {
  const token = localStorage.getItem("authToken");

  if (!token) {
    return false;
  }

  // Try to make a test request to check if token is valid
  // We'll just return true for now, but the actual validation happens
  // in the API calls which will handle 401 errors
  return true;
}

// Check onboarding status
export async function getOnboardingStatus() {
  try {
    const response =
      await OnboardingService.getOnboardingStatusApiV1OnboardingStatusGet();

    return response;
  } catch (error) {
    console.error("Error getting onboarding status:", error);
    // Check if this is an auth error and handle it
    handleApiError(error);
    throw error;
  }
}

/**
 * Polls the onboarding status until the user is onboarded
 * @param interval The polling interval in milliseconds (default: 5000)
 * @param maxAttempts Maximum number of polling attempts (default: 120 - 10 minutes)
 * @returns Promise that resolves when the user is fully onboarded
 */
export function pollOnboardingStatus(
  interval = 5000,
  maxAttempts = 4000
): Promise<any> {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    const poll = async () => {
      try {
        const status = await getOnboardingStatus();

        // Check if user is onboarded
        if (status.is_onboarded) {
          // User is fully onboarded
          resolve(status);
          return;
        }

        attempts++;

        if (attempts >= maxAttempts) {
          // Exceeded maximum attempts
          reject(new Error("Onboarding status polling timed out"));
          return;
        }

        // Schedule next poll
        setTimeout(poll, interval);
      } catch (error) {
        reject(error);
      }
    };

    // Start polling
    poll();
  });
}

// Complete onboarding
export async function completeOnboarding(data: OnboardingData): Promise<User> {
  try {
    const response =
      await OnboardingService.completeOnboardingApiV1OnboardingCompletePost({
        requestBody: data,
      });
    toast.success("Onboarding completed successfully");

    // Update onboarding state to completed
    await updateOnboardingState({
      onboarding_state: "completed",
    });

    return response;
  } catch (error) {
    console.error("Error completing onboarding:", error);
    // Check if this is an auth error and handle it
    handleApiError(error);
    toast.error("Failed to complete onboarding");
    throw error;
  }
}

// Update onboarding state
export async function updateOnboardingState(
  data: UpdateOnboardingStateRequest
): Promise<any> {
  try {
    // Use the auto-generated client method
    return await OnboardingService.updateOnboardingStateApiV1OnboardingStatePost(
      {
        requestBody: data,
      }
    );
  } catch (error) {
    console.error("Error updating onboarding state:", error);
    handleApiError(error);
    throw error;
  }
}

// Logout
export function logout(): void {
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
  updateAuthHeader();
  toast.info("You have been logged out");
  window.location.href = "/login";
}
