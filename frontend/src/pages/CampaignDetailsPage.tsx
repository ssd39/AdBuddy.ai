import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { CampaignDetailsResponse } from "../services/api/models/CampaignDetailsResponse";
import { CampaignsService } from "../services/api/services/CampaignsService";

export default function CampaignDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [campaignDetails, setCampaignDetails] =
    useState<CampaignDetailsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [selectedCreative, setSelectedCreative] = useState<number>(0);

  useEffect(() => {
    async function fetchCampaignDetails() {
      try {
        if (!id) return;

        setIsLoading(true);
        const detailsResponse =
          await CampaignsService.getCampaignDetailsApiV1CampaignsDetailsCampaignIdGet(
            {
              campaignId: id,
            }
          );

        setCampaignDetails(detailsResponse);
      } catch (err) {
        console.error("Failed to fetch campaign details:", err);
        setError("Failed to load campaign details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchCampaignDetails();
  }, [id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "processed":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "processing":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xl text-neutral-100">
            Loading campaign details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !campaignDetails) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="p-6 bg-red-900/20 rounded-xl border border-red-700/30 max-w-md">
          <h2 className="text-xl font-semibold text-red-100 mb-3">
            Error Loading Campaign
          </h2>
          <p className="text-neutral-200">{error || "Campaign not found"}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      {/* Background gradients */}
      <div className="fixed -z-10 top-0 right-0 w-1/3 h-1/3 bg-gradient-to-br from-blue-200/10 to-blue-300/10 rounded-full blur-3xl dark:from-blue-800/20 dark:to-blue-700/20 pointer-events-none transition-all duration-300"></div>
      <div className="fixed -z-10 bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-gray-200/10 to-blue-300/10 rounded-full blur-3xl dark:from-blue-900/20 dark:to-blue-800/20 pointer-events-none transition-all duration-300"></div>

      {/* Back navigation */}
      <div className="mb-6">
        <Link
          to="/dashboard"
          className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back to Dashboard
        </Link>
      </div>

      {/* Campaign Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">
              {campaignDetails.title}
            </h1>
            <p className="text-neutral-400 mt-1">
              Campaign ID: {campaignDetails.id}
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                campaignDetails.status
              )}`}
            >
              {campaignDetails.status.charAt(0).toUpperCase() +
                campaignDetails.status.slice(1)}
            </span>
            <span className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-xs font-medium">
              {new Date(campaignDetails.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Campaign is still processing */}
      {campaignDetails.status === "processing" && (
        <div className="bg-blue-900/20 border border-blue-700/30 rounded-xl p-8 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 mb-6 flex items-center justify-center bg-blue-900/30 rounded-full animate-pulse overflow-hidden">
            <div className="flex items-center justify-center">
              <svg
                className="w-10 h-10 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-neutral-100 mb-2">
            Processing Your Campaign
          </h2>
          <p className="text-neutral-400 max-w-md text-center mb-6">
            Our AI is analyzing your conversation and creating a detailed
            campaign strategy. This may take a few minutes. Check back soon!
          </p>
          <div className="flex space-x-3">
            <div
              className="h-3 w-3 bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            ></div>
            <div
              className="h-3 w-3 bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            ></div>
            <div
              className="h-3 w-3 bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            ></div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-md shadow-md hover:shadow-lg transition-all duration-300"
          >
            Refresh Status
          </button>
        </div>
      )}

      {/* Campaign error */}
      {campaignDetails.status === "error" && (
        <div className="bg-red-900/20 border border-red-700/30 rounded-xl p-8 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 mb-6 flex items-center justify-center bg-red-900/30 rounded-full overflow-hidden">
            <div className="flex items-center justify-center">
              <svg
                className="w-10 h-10 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-neutral-100 mb-2">
            Campaign Processing Error
          </h2>
          <p className="text-neutral-400 max-w-md text-center mb-4">
            We encountered an error while processing your campaign. Please try
            again or contact support.
          </p>
          <button
            onClick={() => navigate("/create-campaign")}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-md shadow-md hover:shadow-lg transition-all duration-300"
          >
            Create New Campaign
          </button>
        </div>
      )}

      {/* Campaign Details Tabs - Only show if status is processed */}
      {campaignDetails.status === "processed" && (
        <>
          {/* Navigation Tabs */}
          <div className="border-b border-gray-700/30 mb-8">
            <nav className="-mb-px flex space-x-8">
              {["overview", "creative", "targeting", "todo"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab
                      ? "border-blue-500 text-blue-500"
                      : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="max-h-[calc(100vh-20rem)] overflow-y-auto p-1">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              >
                {/* Main Campaign Information */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Campaign Goal */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                    className="bg-[#1e293b] rounded-xl p-6 shadow-lg border border-gray-700/30"
                  >
                    <h2 className="text-xl font-semibold text-white mb-4">
                      Campaign Goal
                    </h2>
                    <p className="text-neutral-300 leading-relaxed">
                      {campaignDetails.campaign_goal || "No goal defined"}
                    </p>
                  </motion.div>

                  {/* Target Audience Analysis */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="bg-[#1e293b] rounded-xl p-6 shadow-lg border border-gray-700/30"
                  >
                    <h2 className="text-xl font-semibold text-white mb-4">
                      Target Audience Analysis
                    </h2>
                    <p className="text-neutral-300 leading-relaxed whitespace-pre-line">
                      {campaignDetails.target_audience_analysis ||
                        "No audience analysis available"}
                    </p>
                  </motion.div>

                  {/* Budget Allocation Strategy */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="bg-[#1e293b] rounded-xl p-6 shadow-lg border border-gray-700/30"
                  >
                    <h2 className="text-xl font-semibold text-white mb-4">
                      Budget Allocation Strategy
                    </h2>
                    <p className="text-neutral-300 leading-relaxed">
                      {campaignDetails.budget_allocation_strategy ||
                        "No budget strategy defined"}
                    </p>
                  </motion.div>
                </div>

                {/* KPIs and Summary */}
                <div className="space-y-6">
                  {/* Campaign Summary */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="bg-[#1e293b] rounded-xl p-6 shadow-lg border border-gray-700/30"
                  >
                    <h2 className="text-xl font-semibold text-white mb-4">
                      Campaign Summary
                    </h2>
                    <div className="space-y-3">
                      <div>
                        <span className="text-neutral-400">Objective:</span>
                        <p className="text-neutral-200">
                          {campaignDetails.ad_campaign?.objective ||
                            "Not specified"}
                        </p>
                      </div>
                      <div>
                        <span className="text-neutral-400">Status:</span>
                        <p className="text-neutral-200">
                          {campaignDetails.ad_campaign?.status ||
                            "Not specified"}
                        </p>
                      </div>
                      <div>
                        <span className="text-neutral-400">Ad Sets:</span>
                        <p className="text-neutral-200">
                          {campaignDetails.ad_campaign?.ad_sets?.length || 0} ad
                          sets
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* KPIs */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="bg-[#1e293b] rounded-xl p-6 shadow-lg border border-gray-700/30"
                  >
                    <h2 className="text-xl font-semibold text-white mb-4">
                      Key Performance Indicators
                    </h2>
                    <ul className="space-y-2">
                      {(campaignDetails.kpis || []).map((kpi, index) => (
                        <li key={index} className="flex items-start">
                          <svg
                            className="w-5 h-5 text-blue-500 mr-2 mt-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            ></path>
                          </svg>
                          <span className="text-neutral-300">{kpi}</span>
                        </li>
                      ))}
                      {!campaignDetails.kpis?.length && (
                        <li className="text-neutral-300">No KPIs defined</li>
                      )}
                    </ul>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Creative Ideas Tab */}
            {activeTab === "creative" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-8"
              >
                {/* Creative Ideas List */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="md:col-span-1"
                >
                  <h2 className="text-xl font-semibold text-white mb-4">
                    Creative Ideas
                  </h2>
                  <div className="space-y-3">
                    {(campaignDetails.creative_ideas || []).map(
                      (idea, index) => (
                        <motion.button
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.3 }}
                          onClick={() => setSelectedCreative(index)}
                          className={`w-full text-left p-4 rounded-lg transition-all duration-300 ${
                            selectedCreative === index
                              ? "bg-blue-900/30 border border-blue-700/50"
                              : "bg-[#1e293b] border border-gray-700/30 hover:border-gray-600/50"
                          }`}
                        >
                          <h3
                            className={`font-medium ${
                              selectedCreative === index
                                ? "text-blue-400"
                                : "text-neutral-200"
                            }`}
                          >
                            {idea.title}
                          </h3>
                          <p className="text-xs text-neutral-400 mt-1 truncate">
                            {idea.target_audience}
                          </p>
                        </motion.button>
                      )
                    )}
                    {!campaignDetails.creative_ideas?.length && (
                      <div className="bg-[#1e293b] border border-gray-700/30 p-4 rounded-lg">
                        <p className="text-neutral-300">
                          No creative ideas available
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Selected Creative Detail */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="md:col-span-2"
                >
                  {campaignDetails.creative_ideas?.length &&
                  campaignDetails.creative_ideas[selectedCreative] ? (
                    <motion.div
                      key={selectedCreative}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="bg-[#1e293b] rounded-xl p-6 shadow-lg border border-gray-700/30"
                    >
                      <h2 className="text-xl font-semibold text-white mb-1">
                        {campaignDetails.creative_ideas[selectedCreative].title}
                      </h2>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {campaignDetails.creative_ideas[
                          selectedCreative
                        ].platforms.map((platform, idx) => (
                          <span
                            key={idx}
                            className="bg-blue-900/20 text-blue-400 px-2 py-1 rounded text-xs font-medium"
                          >
                            {platform}
                          </span>
                        ))}
                      </div>

                      <div className="mb-4">
                        <h3 className="text-sm font-medium text-neutral-400 mb-1">
                          Target Audience
                        </h3>
                        <p className="text-neutral-200">
                          {
                            campaignDetails.creative_ideas[selectedCreative]
                              .target_audience
                          }
                        </p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-neutral-400 mb-1">
                          Description
                        </h3>
                        <p className="text-neutral-200 whitespace-pre-line">
                          {
                            campaignDetails.creative_ideas[selectedCreative]
                              .description
                          }
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="bg-[#1e293b] rounded-xl p-6 shadow-lg border border-gray-700/30">
                      <p className="text-neutral-300">
                        Select a creative idea to view details
                      </p>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}

            {/* Targeting Tab */}
            {activeTab === "targeting" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                {/* Ad Sets */}
                {(campaignDetails.ad_campaign?.ad_sets || []).map(
                  (adSet, adSetIndex) => (
                    <motion.div
                      key={adSetIndex}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: adSetIndex * 0.1, duration: 0.5 }}
                      className="bg-[#1e293b] rounded-xl p-6 shadow-lg border border-gray-700/30"
                    >
                      <h2 className="text-xl font-semibold text-white mb-4">
                        {adSet.name || `Ad Set ${adSetIndex + 1}`}
                      </h2>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Targeting Details */}
                        <div>
                          <h3 className="font-medium text-blue-400 mb-3">
                            Targeting
                          </h3>
                          <div className="space-y-3">
                            {adSet.targeting.locations &&
                              adSet.targeting.locations.length > 0 && (
                                <div>
                                  <span className="text-sm text-neutral-400">
                                    Locations:
                                  </span>
                                  <p className="text-neutral-200">
                                    {adSet.targeting.locations.join(", ")}
                                  </p>
                                </div>
                              )}
                            {adSet.targeting.age_min &&
                              adSet.targeting.age_max && (
                                <div>
                                  <span className="text-sm text-neutral-400">
                                    Age Range:
                                  </span>
                                  <p className="text-neutral-200">
                                    {adSet.targeting.age_min} -{" "}
                                    {adSet.targeting.age_max}
                                  </p>
                                </div>
                              )}
                            {adSet.targeting.genders &&
                              adSet.targeting.genders.length > 0 && (
                                <div>
                                  <span className="text-sm text-neutral-400">
                                    Genders:
                                  </span>
                                  <p className="text-neutral-200">
                                    {adSet.targeting.genders
                                      .map(
                                        (g) =>
                                          g.charAt(0).toUpperCase() + g.slice(1)
                                      )
                                      .join(", ")}
                                  </p>
                                </div>
                              )}
                            {adSet.targeting.interests &&
                              adSet.targeting.interests.length > 0 && (
                                <div>
                                  <span className="text-sm text-neutral-400">
                                    Interests:
                                  </span>
                                  <p className="text-neutral-200">
                                    {adSet.targeting.interests.join(", ")}
                                  </p>
                                </div>
                              )}
                            {adSet.targeting.languages &&
                              adSet.targeting.languages.length > 0 && (
                                <div>
                                  <span className="text-sm text-neutral-400">
                                    Languages:
                                  </span>
                                  <p className="text-neutral-200">
                                    {adSet.targeting.languages.join(", ")}
                                  </p>
                                </div>
                              )}
                          </div>
                        </div>

                        {/* Budget & Placement */}
                        <div>
                          <h3 className="font-medium text-blue-400 mb-3">
                            Budget & Placement
                          </h3>
                          <div className="space-y-3">
                            <div>
                              <span className="text-sm text-neutral-400">
                                Budget Mode:
                              </span>
                              <p className="text-neutral-200">
                                {adSet.budget.mode === "BUDGET_MODE_DAY"
                                  ? "Daily"
                                  : adSet.budget.mode === "BUDGET_MODE_TOTAL"
                                  ? "Lifetime"
                                  : "Infinite"}
                              </p>
                            </div>
                            <div>
                              <span className="text-sm text-neutral-400">
                                Budget Amount:
                              </span>
                              <p className="text-neutral-200">
                                {adSet.budget.currency}{" "}
                                {adSet.budget.amount.toFixed(2)}
                              </p>
                            </div>
                            <div>
                              <span className="text-sm text-neutral-400">
                                Placements:
                              </span>
                              <p className="text-neutral-200">
                                {adSet.placements.automatic
                                  ? "Automatic Placements"
                                  : "Manual Placements"}
                              </p>
                              {adSet.placements.instagram_positions &&
                                adSet.placements.instagram_positions.length >
                                  0 && (
                                  <p className="text-neutral-400 text-sm">
                                    Instagram:{" "}
                                    {adSet.placements.instagram_positions.join(
                                      ", "
                                    )}
                                  </p>
                                )}
                              {adSet.placements.tiktok_placements &&
                                adSet.placements.tiktok_placements.length >
                                  0 && (
                                  <p className="text-neutral-400 text-sm">
                                    TikTok:{" "}
                                    {adSet.placements.tiktok_placements.join(
                                      ", "
                                    )}
                                  </p>
                                )}
                            </div>
                            <div>
                              <span className="text-sm text-neutral-400">
                                Optimization Goal:
                              </span>
                              <p className="text-neutral-200">
                                {adSet.optimization_goal}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Ad Creatives */}
                      {adSet.creatives && adSet.creatives.length > 0 && (
                        <div className="mt-8">
                          <h3 className="font-medium text-blue-400 mb-4">
                            Creatives
                          </h3>
                          <div className="space-y-4">
                            {adSet.creatives.map((creative, creativeIdx) => (
                              <div
                                key={creativeIdx}
                                className="border border-gray-700/50 rounded-lg p-4 bg-gray-900/30"
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-sm bg-blue-900/20 text-blue-300 px-2 py-0.5 rounded">
                                    {creative.ad_format}
                                  </span>
                                  <span className="text-sm bg-green-900/20 text-green-300 px-2 py-0.5 rounded">
                                    {creative.call_to_action}
                                  </span>
                                </div>
                                {creative.headline && (
                                  <h4 className="text-lg font-medium text-white mb-2">
                                    {creative.headline}
                                  </h4>
                                )}
                                <p className="text-neutral-300 mb-3">
                                  {creative.primary_text}
                                </p>
                                {creative.description && (
                                  <p className="text-sm text-neutral-400">
                                    {creative.description}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )
                )}
                {!campaignDetails.ad_campaign?.ad_sets?.length && (
                  <div className="bg-[#1e293b] rounded-xl p-6 shadow-lg border border-gray-700/30">
                    <p className="text-neutral-300">No ad sets available</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Todo Tab */}
            {activeTab === "todo" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-[#1e293b] rounded-xl p-6 shadow-lg border border-gray-700/30"
              >
                <h2 className="text-xl font-semibold text-white mb-6">
                  Implementation To-Do List
                </h2>
                <div className="space-y-6">
                  {(campaignDetails.todo_list || []).map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.4 }}
                      className="border-b border-gray-700/30 pb-6 last:border-b-0"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            item.priority === "high"
                              ? "bg-red-900/20 text-red-300"
                              : item.priority === "medium"
                              ? "bg-yellow-900/20 text-yellow-300"
                              : "bg-blue-900/20 text-blue-300"
                          }`}
                        >
                          {item.priority.toUpperCase()}
                        </div>
                        <h3 className="text-lg font-medium text-white">
                          {item.task}
                        </h3>
                      </div>
                      {item.notes && (
                        <p className="text-neutral-400 mt-2 ml-10">
                          {item.notes}
                        </p>
                      )}
                    </motion.div>
                  ))}
                  {!campaignDetails.todo_list?.length && (
                    <p className="text-neutral-300">No to-do items available</p>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}
