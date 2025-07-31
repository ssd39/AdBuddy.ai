import { Dialog, Transition } from "@headlessui/react";
import { motion } from "framer-motion";
import { Fragment, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { CampaignResponse } from "../services/api/models/CampaignResponse";
import { CampaignsService } from "../services/api/services/CampaignsService";
import { DashboardService } from "../services/api/services/DashboardService";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 12,
    },
  },
};

export default function DashboardPage() {
  const [stats, setStats] = useState({
    campaign_count: 0,
    competitor_count: 0,
    company_details: "",
    company_name: "",
  });
  const [campaigns, setCampaigns] = useState<CampaignResponse[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [campaignsError, setCampaignsError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response =
          await DashboardService.getDashboardStatsApiV1DashboardStatsGet();
        setStats(response);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        setError("Failed to load dashboard statistics");
        setLoading(false);
      }
    };

    const fetchCampaigns = async () => {
      try {
        const response =
          await CampaignsService.listCampaignsApiV1CampaignsListGet();
        setCampaigns(response.campaigns);
        setCampaignsLoading(false);
      } catch (err) {
        console.error("Error fetching campaigns:", err);
        setCampaignsError("Failed to load campaigns");
        setCampaignsLoading(false);
      }
    };

    fetchDashboardStats();
    fetchCampaigns();
  }, []);

  return (
    <div className="h-full overflow-hidden relative">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-br from-blue-800/40 to-blue-700/30 rounded-full blur-3xl transform translate-x-1/4 -translate-y-1/4 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-blue-900/40 to-blue-800/30 rounded-full blur-3xl transform -translate-x-1/4 translate-y-1/4 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-8 pb-12 overflow-y-auto h-full">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-100">Dashboard</h1>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 text-red-300 p-4 rounded-lg mb-6">
            {error}
          </div>
        ) : (
          <>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-12 gap-6"
            >
              {/* Number of Campaigns Box */}
              <motion.div
                variants={itemVariants}
                className="col-span-12 md:col-span-3 bg-gray-800 shadow-md hover:shadow-lg transition-shadow duration-200 rounded-xl p-6 border border-gray-700 h-52 flex flex-col justify-center"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="flex-shrink-0 bg-blue-900/30 p-3 rounded-full mb-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-blue-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-100 mb-1">
                    {stats.campaign_count}
                  </h3>
                  <p className="text-neutral-300 text-sm">Active Campaigns</p>
                </div>
              </motion.div>

              {/* Competitors Found Box */}
              <motion.div
                variants={itemVariants}
                className="col-span-12 md:col-span-3 bg-gray-800 shadow-md hover:shadow-lg transition-shadow duration-200 rounded-xl p-6 border border-gray-700 h-52 flex flex-col justify-center"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="flex-shrink-0 bg-blue-900/30 p-3 rounded-full mb-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-blue-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-100 mb-1">
                    {stats.competitor_count}
                  </h3>
                  <p className="text-neutral-300 text-sm">Competitors Found</p>
                </div>
              </motion.div>

              {/* Company Details Box (Takes Remaining Width) */}
              <motion.div
                variants={itemVariants}
                className="col-span-12 md:col-span-6 bg-gray-800 shadow-md hover:shadow-lg transition-shadow duration-200 rounded-xl p-6 border border-gray-700 h-52 flex flex-col justify-between"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-blue-900/30 p-3 rounded-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-blue-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <div>
                      <h3 className="text-xl font-semibold text-neutral-100 mb-2">
                        {stats.company_name}
                      </h3>
                      <p className="text-neutral-300 mb-2 line-clamp-2">
                        {stats.company_details ||
                          "No company details available"}
                      </p>
                    </div>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="inline-flex items-center px-3 py-2 mt-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors duration-200"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      View Details
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Campaigns Section */}
            <div className="mt-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-neutral-100">
                  Your Campaigns
                </h2>
                <Link
                  to="/create-campaign"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Create Campaign
                </Link>
              </div>

              {/* Campaign List */}
              {campaignsLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : campaignsError ? (
                <div className="bg-red-900/20 text-red-300 p-4 rounded-lg">
                  {campaignsError}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                >
                  {campaigns.length === 0 ? (
                    /* Empty State */
                    <div className="col-span-3 bg-gray-800/50 border border-gray-700 rounded-xl p-8 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-12 w-12 text-gray-500 mb-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          />
                        </svg>
                        <h3 className="text-lg font-medium text-neutral-300 mb-2">
                          No campaigns yet
                        </h3>
                        <p className="text-neutral-400 mb-6 max-w-md">
                          Create your first campaign to start reaching your
                          target audience with AI-optimized ads
                        </p>
                        <Link
                          to="/create-campaign"
                          className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                          </svg>
                          Create Your First Campaign
                        </Link>
                      </div>
                    </div>
                  ) : (
                    /* Display campaigns */
                    <>
                      {campaigns.map((campaign) => (
                        <motion.div
                          key={campaign.id}
                          variants={itemVariants}
                          className="bg-gray-800 border border-gray-700 rounded-xl p-5 hover:shadow-lg transition-shadow duration-200"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="text-lg font-semibold text-neutral-100 mb-1 line-clamp-1">
                              {campaign.title || "Untitled Campaign"}
                            </h3>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                campaign.status === "processed"
                                  ? "bg-green-900/30 text-green-400"
                                  : campaign.status === "processing"
                                  ? "bg-blue-900/30 text-blue-400"
                                  : campaign.status === "error"
                                  ? "bg-red-900/30 text-red-400"
                                  : "bg-gray-700 text-gray-300"
                              }`}
                            >
                              {campaign.status}
                            </span>
                          </div>

                          <div className="mb-4 text-neutral-400 text-sm">
                            Created:{" "}
                            {new Date(campaign.created_at).toLocaleDateString()}
                          </div>

                          <Link
                            to={`/campaigns/${campaign.id}`}
                            className="inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors duration-200"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            View Details
                          </Link>
                        </motion.div>
                      ))}
                    </>
                  )}
                </motion.div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Company Details Modal */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setIsModalOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/75" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-gray-800 p-6 text-left align-middle shadow-xl transition-all border border-gray-700">
                  <Dialog.Title
                    as="h3"
                    className="text-xl font-semibold leading-6 text-neutral-100 mb-4"
                  >
                    {stats.company_name}
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-neutral-300 whitespace-pre-wrap">
                      {stats.company_details || "No company details available"}
                    </p>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Close
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
