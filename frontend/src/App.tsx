import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useEffect, useMemo } from "react";
import { Toaster } from "react-hot-toast";
import { Provider as ReduxProvider } from "react-redux";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AuthenticatedLayout from "./components/AuthenticatedLayout";
// Removed TavusCVIProvider import as we're using direct iframe embedding instead
import { CVIProvider } from "./components/cvi/components/cvi-provider";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import OnboardingLobbyPage from "./pages/OnboardingLobbyPage";
import OnboardingPage from "./pages/OnboardingPage";
import VideoCallPage from "./pages/VideoCallPage";
import { initializeAuth } from "./services/authService";
import { fetchCurrentUser } from "./store/authActions";
import { store } from "./store/store";

// Create a client for React Query
const queryClient = new QueryClient();

// Simple token check component - doesn't check validity
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!localStorage.getItem("authToken")) {
    console.log("dwij: Failed to find token!");
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function App() {
  // Initialize authentication
  useEffect(() => {
    initializeAuth();

    // Check if we have an auth token
    const token = localStorage.getItem("authToken");
    if (token) {
      // Load user data into Redux store
      store.dispatch(fetchCurrentUser());
    }
  }, []);

  // Memoize routes to prevent unnecessary re-renders
  const routes = useMemo(
    () => (
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes */}
        {/* Onboarding routes */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <OnboardingPage />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/onboarding/form"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <OnboardingPage />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/onboarding/lobby"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <OnboardingLobbyPage />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/onboarding/video-call"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <VideoCallPage />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <DashboardPage />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    ),
    []
  );

  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <CVIProvider>
            <BrowserRouter>{routes}</BrowserRouter>

            <Toaster
              position="bottom-right"
              toastOptions={{
                className: "",
                style: {
                  maxWidth: "500px",
                  borderRadius: "8px",
                },
                success: {
                  iconTheme: {
                    primary: "#4CAF50",
                    secondary: "#FFFFFF",
                  },
                },
                error: {
                  iconTheme: {
                    primary: "#EF5350",
                    secondary: "#FFFFFF",
                  },
                },
              }}
            />
          </CVIProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ReduxProvider>
  );
}

export default App;
