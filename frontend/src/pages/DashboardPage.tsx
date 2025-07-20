import { useState } from "react";
import ThemeToggle from "../components/ThemeToggle";

export default function DashboardPage() {
  // AuthenticatedLayout handles authentication and onboarding status checks
  // No need to check onboarding status here anymore

  return (
    <div className="min-h-screen bg-light-gradient dark:bg-dark-gradient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <ThemeToggle />
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Welcome to AdBuddy.ai
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Your dashboard is coming soon with amazing features to manage your ad campaigns.
          </p>
        </div>
      </div>
    </div>
  );
}