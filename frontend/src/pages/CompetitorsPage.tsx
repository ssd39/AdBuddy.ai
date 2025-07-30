import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { CompetitorAdsResponse } from "../services/api/models/CompetitorAdsResponse";
import type { CompetitorResponse } from "../services/api/models/CompetitorResponse";
import { CompetitorsService } from "../services/api/services/CompetitorsService";

// Animation variants
const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

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

export default function CompetitorsPage() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [similarCompanies, setSimilarCompanies] =
    useState<CompetitorResponse | null>(null);
  const [competitorAds, setCompetitorAds] =
    useState<CompetitorAdsResponse | null>(null);
  const [activeCompetitor, setActiveCompetitor] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"companies" | "ads">("companies");

  // Fetch similar companies on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const companiesData =
          await CompetitorsService.getSimilarCompaniesApiV1CompetitorsSimilarCompaniesGet(
            {}
          );
        setSimilarCompanies(companiesData);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching similar companies:", err);
        setError("Failed to fetch similar companies. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch competitor ads when a company is selected
  const fetchCompetitorAds = async (companyIds?: string[]) => {
    try {
      setIsLoading(true);
      const adsData =
        await CompetitorsService.getCompetitorAdsApiV1CompetitorsCompetitorAdsGet(
          {
            companyIds: companyIds ? companyIds.join(",") : undefined,
          }
        );
      setCompetitorAds(adsData);
      setViewMode("ads");
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching competitor ads:", err);
      setError("Failed to fetch competitor ads. Please try again later.");
      setIsLoading(false);
    }
  };

  // Handle company selection
  const handleCompanyClick = (companyId: string) => {
    setActiveCompetitor(companyId);
    fetchCompetitorAds([companyId]);
  };

  // Handle view all ads button click
  const handleViewAllAds = () => {
    fetchCompetitorAds();
  };

  // Handle back button click
  const handleBackToCompanies = () => {
    setViewMode("companies");
    setActiveCompetitor(null);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="h-full overflow-hidden relative"
    >
      {/* Decorative elements with proper transitions */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-br from-blue-200/40 to-blue-300/30 rounded-full blur-3xl transform translate-x-1/4 -translate-y-1/4 dark:from-blue-800/40 dark:to-blue-700/30 pointer-events-none transition-all duration-300"></div>
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-gray-200/30 to-blue-300/20 rounded-full blur-3xl transform -translate-x-1/4 translate-y-1/4 dark:from-blue-900/40 dark:to-blue-800/30 pointer-events-none transition-all duration-300"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-8 pb-12 overflow-y-auto h-full">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            {viewMode === "companies" ? "Competitors" : "Competitor Ads"}
          </h1>
        </div>

        {/* Error display */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 mb-6 rounded-md">
            <p>{error}</p>
          </div>
        )}

        {/* Loading state */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <>
            {/* Companies View */}
            {viewMode === "companies" && similarCompanies && (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                    Companies Similar to{" "}
                    <span className="text-blue-600 dark:text-blue-400">
                      {similarCompanies.query_parameters.company_name}
                    </span>
                  </h2>
                  <button
                    onClick={handleViewAllAds}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    View All Ads
                  </button>
                </div>

                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {similarCompanies.competitors.map((company, index) => (
                    <motion.div
                      key={company.id || index}
                      variants={itemVariants}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden border border-gray-100 dark:border-gray-700"
                    >
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {company.name || "Unknown Company"}
                        </h3>
                        <div className="mb-4">
                          <div className="flex items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              Popularity:{" "}
                              {typeof company.popularity === "number"
                                ? `${(company.popularity * 100).toFixed(0)}%`
                                : "N/A"}
                            </span>
                          </div>
                        </div>

                        {company.tags && company.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {company.tags
                              .slice(0, 3)
                              .map((tag: string, tagIndex: number) => (
                                <span
                                  key={tagIndex}
                                  className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                            {company.tags.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                                +{company.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        )}

                        <button
                          onClick={() => handleCompanyClick(company.id)}
                          className="w-full mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors duration-200"
                        >
                          View Ads
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </>
            )}

            {/* Ads View */}
            {viewMode === "ads" && competitorAds && (
              <>
                <div className="flex justify-between items-center mb-6">
                  <button
                    onClick={handleBackToCompanies}
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
                    Back to Companies
                  </button>
                </div>

                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-8"
                >
                  {Object.entries(competitorAds.competitor_ads).map(
                    ([companyName, ads], companyIndex) => (
                      <motion.div
                        key={companyIndex}
                        variants={itemVariants}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700"
                      >
                        <div className="p-6">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                            {companyName}
                          </h3>

                          {ads.length === 0 ? (
                            <p className="text-gray-600 dark:text-gray-300">
                              No ads found for this company.
                            </p>
                          ) : (
                            <div className="space-y-6">
                              {ads.map((ad, adIndex) => (
                                <div
                                  key={adIndex}
                                  className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0 last:pb-0"
                                >
                                  {ad.ad_creative_bodies &&
                                    ad.ad_creative_bodies.length > 0 && (
                                      <div className="mb-3">
                                        <p className="text-gray-800 dark:text-gray-200">
                                          {ad.ad_creative_bodies[0]}
                                        </p>
                                      </div>
                                    )}

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                                    {ad.ad_creative_link_titles &&
                                      ad.ad_creative_link_titles.length > 0 && (
                                        <div>
                                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Title:
                                          </span>
                                          <p className="text-gray-800 dark:text-gray-100">
                                            {ad.ad_creative_link_titles[0]}
                                          </p>
                                        </div>
                                      )}

                                    {ad.ad_creative_link_descriptions &&
                                      ad.ad_creative_link_descriptions.length >
                                        0 && (
                                        <div>
                                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Description:
                                          </span>
                                          <p className="text-gray-800 dark:text-gray-100">
                                            {
                                              ad
                                                .ad_creative_link_descriptions[0]
                                            }
                                          </p>
                                        </div>
                                      )}
                                  </div>

                                  <div className="flex flex-wrap gap-4 text-sm">
                                    {ad.ad_creation_time && (
                                      <div className="flex items-center">
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          className="h-4 w-4 mr-1 text-gray-600 dark:text-gray-300"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                          />
                                        </svg>
                                        <span className="text-gray-700 dark:text-gray-300">
                                          Created:{" "}
                                          {formatDate(ad.ad_creation_time)}
                                        </span>
                                      </div>
                                    )}

                                    {ad.funding_entity && (
                                      <div className="flex items-center">
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          className="h-4 w-4 mr-1 text-gray-600 dark:text-gray-300"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                                          />
                                        </svg>
                                        <span className="text-gray-700 dark:text-gray-300">
                                          Funded by: {ad.funding_entity}
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {ad.ad_snapshot_url && (
                                    <div className="mt-4">
                                      <a
                                        href={ad.ad_snapshot_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                      >
                                        <span>View Ad on Meta</span>
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          className="h-4 w-4 ml-1"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                          />
                                        </svg>
                                      </a>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )
                  )}
                </motion.div>
              </>
            )}

            {/* Coming Soon Message (Only shown if no data) */}
            {!isLoading && !similarCompanies && !competitorAds && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 mx-auto mb-4 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Competitor Analysis Coming Soon
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  We're working on bringing you valuable insights about your
                  competitors and their ad strategies.
                </p>
                <div className="animate-pulse w-2/3 mx-auto h-2 bg-blue-200 dark:bg-blue-700 rounded"></div>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
