import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getOnboardingStatus } from "../services/authService";
import { fetchCurrentUser } from "../store/authActions";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import Sidebar from "./Sidebar";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

/**
 * A layout component that handles authentication and onboarding checks
 * Ensures onboarding status is checked only once per session
 */
export default function AuthenticatedLayout({
  children,
}: AuthenticatedLayoutProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [onboardingStatus, setOnboardingStatus] = useState<{
    is_onboarded: boolean;
    onboarding_state: "not_started" | "video_call" | "in_lobby" | "completed";
    conversation_id?: string;
  }>({ is_onboarded: false, onboarding_state: "not_started" });

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  // Get auth state from Redux
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  // Store pathname in a ref to prevent unnecessary API calls
  const previousPathnameRef = React.useRef(location.pathname);

  // Determine if we should show the sidebar (only for completed onboarding and non-onboarding routes)
  const shouldShowSidebar =
    !location.pathname.startsWith("/onboarding") &&
    onboardingStatus.is_onboarded;

  useEffect(() => {
    // Check if token exists
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    // Skip API calls if we've already done the checks and the path hasn't changed
    const shouldSkipChecks =
      isAuthenticated && previousPathnameRef.current === location.pathname;

    if (shouldSkipChecks) {
      return;
    }

    // Update pathname ref
    previousPathnameRef.current = location.pathname;

    // Load user data and check onboarding status
    const loadUserData = async () => {
      // Fetch user data if not already in Redux store
      if (!user) {
        await dispatch(fetchCurrentUser());
      }

      try {
        // Get onboarding status from backend
        const status = await getOnboardingStatus();

        // Explicitly set the status with type safety
        setOnboardingStatus({
          is_onboarded: !!status.is_onboarded,
          onboarding_state: status.onboarding_state || "not_started",
          conversation_id: status.conversation_id,
        });

        setIsLoading(false);
        // Handle routing based on onboarding state from backend
        switch (status.onboarding_state) {
          case "not_started":
            // If not in the initial onboarding page, redirect there
            if (location.pathname !== "/onboarding") {
              navigate("/onboarding", { replace: true });
            }
            break;

          case "video_call":
            // If not in the video call page, redirect there
            if (location.pathname !== "/onboarding/video-call") {
              navigate("/onboarding/video-call", {
                state: {
                  conversationId: status.conversation_id,
                  conversationUrl: localStorage.getItem(
                    "tavus_conversation_url"
                  ),
                },
                replace: true,
              });
            }
            break;

          case "in_lobby":
            // If not in the lobby page, redirect there
            if (location.pathname !== "/onboarding/lobby") {
              navigate("/onboarding/lobby", {
                state: { conversationId: status.conversation_id },
                replace: true,
              });
            }
            break;

          case "completed":
            // If user is in any onboarding page but is actually completed, go to dashboard
            if (location.pathname.startsWith("/onboarding")) {
              navigate("/dashboard", { replace: true });
            }
            break;

          default:
            // Fallback - if status doesn't match any known state
            if (!status.is_onboarded && location.pathname !== "/onboarding") {
              navigate("/onboarding", { replace: true });
            } else if (
              status.is_onboarded &&
              location.pathname.startsWith("/onboarding")
            ) {
              navigate("/dashboard", { replace: true });
            }
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [user, isAuthenticated, location.pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // If we're showing the sidebar, render the layout with sidebar
  if (shouldShowSidebar) {
    return (
      <div className="flex h-screen overflow-hidden relative">
        {/* Background with dark mode */}
        <div className="absolute inset-0 bg-gray-900 -z-10"></div>

        {/* Sidebar */}
        <div className="w-64 flex-shrink-0 z-10">
          <Sidebar />
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-hidden z-10">
          <main className="h-full overflow-hidden">{children}</main>
        </div>
      </div>
    );
  }

  // Otherwise, render just the children (for onboarding pages, etc.)
  return <>{children}</>;
}
