import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useMemo } from "react";
import { Toaster } from "react-hot-toast";
import { Provider as ReduxProvider } from "react-redux";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AuthenticatedLayout from "./components/AuthenticatedLayout";
import { CVIProvider } from "./components/cvi/components/cvi-provider";
import { ThemeProvider } from "./contexts/ThemeContext";
import CampaignDetailsPage from "./pages/CampaignDetailsPage";
import CompetitorsPage from "./pages/CompetitorsPage";
import CreateCampaignPage from "./pages/CreateCampaignPage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import OnboardingLobbyPage from "./pages/OnboardingLobbyPage";
import OnboardingPage from "./pages/OnboardingPage";
import VideoCallPage from "./pages/VideoCallPage";
import { initializeAuth } from "./services/authService";
import { store } from "./store/store";

initializeAuth();

// Create a client for React Query
const queryClient = new QueryClient();

// Simple token check component - doesn't check validity
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!localStorage.getItem("authToken")) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function App() {
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

        <Route
          path="/competitors"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <CompetitorsPage />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-campaign"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <CreateCampaignPage />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/campaigns/:id"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <CampaignDetailsPage />
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
