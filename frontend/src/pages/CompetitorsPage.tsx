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
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(9);

  // Fetch similar companies with pagination
  const fetchCompanies = async (page: number = 1) => {
    try {
      setIsLoading(true);
      const companiesData =
        await CompetitorsService.getSimilarCompaniesApiV1CompetitorsSimilarCompaniesGet(
          {
            page,
            pageSize,
          }
        );
      setSimilarCompanies(companiesData);
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching similar companies:", err);
      setError("Failed to fetch similar companies. Please try again later.");
      setIsLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchCompanies(currentPage);
  }, [currentPage, pageSize]);

  // Fetch competitor ads by company name
  const fetchCompetitorAds = async (companyName: string) => {
    try {
      setIsLoading(true);
      const adsData =
        await CompetitorsService.getCompetitorAdsApiV1CompetitorsCompetitorAdsGet(
          {
            companyName: companyName,
            limit: 20,
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
  const handleCompanyClick = (companyId: string, companyName: string) => {
    setActiveCompetitor(companyId);
    fetchCompetitorAds(companyName);
  };

  // Function to get tag names from the new format
  const getTagNames = (tags: any[] | undefined) => {
    if (!tags || tags.length === 0) return [];
    return tags.map((tag) => tag.name || "").filter(Boolean);
  };

  // Handle back button click
  const handleBackToCompanies = () => {
    setViewMode("companies");
    setActiveCompetitor(null);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0); // Scroll to top on page change
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
                    {similarCompanies.pagination && (
                      <span className="ml-2 text-sm font-normal text-gray-600 dark:text-gray-400">
                        ({similarCompanies.pagination.total_count} companies
                        found)
                      </span>
                    )}
                  </h2>
                </div>

                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {similarCompanies.competitors.map((company, index) => (
                    <motion.div
                      key={company.entity_id || index}
                      variants={itemVariants}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col h-full"
                    >
                      {company.properties?.image?.url && (
                        <div className="w-full h-40 relative overflow-hidden">
                          <img
                            src={company.properties.image.url}
                            alt={company.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent h-16"></div>
                        </div>
                      )}

                      <div className="p-6 flex flex-col flex-grow">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {company.name || "Unknown Company"}
                          </h3>
                          {typeof company.popularity === "number" && (
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-xs rounded-md font-medium">
                              {(company.popularity * 100).toFixed(0)}% Match
                            </span>
                          )}
                        </div>

                        {company.properties?.short_description && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-3">
                            {company.properties.short_description}
                          </p>
                        )}

                        {company.properties?.headquartered && (
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
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
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            {company.properties.headquartered}
                          </div>
                        )}

                        {company.properties?.industry &&
                          company.properties.industry.length > 0 && (
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
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
                                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                />
                              </svg>
                              {company.properties.industry[0]}
                              {company.properties.industry.length > 1 &&
                                ` +${
                                  company.properties.industry.length - 1
                                } more`}
                            </div>
                          )}

                        {company.tags && company.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4 mt-2">
                            {company.tags
                              .slice(0, 3)
                              .map((tag: any, tagIndex: number) => (
                                <span
                                  key={tagIndex}
                                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 text-xs rounded-full"
                                >
                                  {tag.name}
                                </span>
                              ))}
                            {company.tags.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                                +{company.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        )}

                        {/* Social Links */}
                        {company.external && (
                          <div className="flex space-x-2 mb-4">
                            {company.external.instagram && (
                              <a
                                href={`https://instagram.com/${company.external.instagram[0]?.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-pink-600 dark:text-pink-400 hover:text-pink-800 dark:hover:text-pink-300"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  fill="currentColor"
                                  viewBox="0 0 16 16"
                                >
                                  <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z" />
                                </svg>
                              </a>
                            )}

                            {company.external.facebook && (
                              <a
                                href={`https://facebook.com/${company.external.facebook[0]?.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  fill="currentColor"
                                  viewBox="0 0 16 16"
                                >
                                  <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z" />
                                </svg>
                              </a>
                            )}

                            {company.external.twitter && (
                              <a
                                href={`https://twitter.com/${company.external.twitter[0]?.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  fill="currentColor"
                                  viewBox="0 0 16 16"
                                >
                                  <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z" />
                                </svg>
                              </a>
                            )}

                            {company.properties?.official_site && (
                              <a
                                href={company.properties.official_site}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  fill="currentColor"
                                  viewBox="0 0 16 16"
                                >
                                  <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm7.5-6.923c-.67.204-1.335.82-1.887 1.855-.143.268-.276.56-.395.872.705.157 1.472.257 2.282.287V1.077zM4.249 3.539c.142-.384.304-.744.481-1.078a6.7 6.7 0 0 1 .597-.933A7.01 7.01 0 0 0 3.051 3.05c.362.184.763.349 1.198.49zM3.509 7.5c.036-1.07.188-2.087.436-3.008a9.124 9.124 0 0 1-1.565-.667A6.964 6.964 0 0 0 1.018 7.5h2.49zm1.4-2.741a12.344 12.344 0 0 0-.4 2.741H7.5V5.091c-.91-.03-1.783-.145-2.591-.332zM8.5 5.09V7.5h2.99a12.342 12.342 0 0 0-.399-2.741c-.808.187-1.681.301-2.591.332zM4.51 8.5c.035.987.176 1.914.399 2.741A13.612 13.612 0 0 1 7.5 10.91V8.5H4.51zm3.99 0v2.409c.91.03 1.783.145 2.591.332.223-.827.364-1.754.4-2.741H8.5zm-3.282 3.696c.12.312.252.604.395.872.552 1.035 1.218 1.65 1.887 1.855V11.91c-.81.03-1.577.13-2.282.287zm.11 2.276a6.696 6.696 0 0 1-.598-.933 8.853 8.853 0 0 1-.481-1.079 8.38 8.38 0 0 0-1.198.49 7.01 7.01 0 0 0 2.276 1.522zm-1.383-2.964A13.36 13.36 0 0 1 3.508 8.5h-2.49a6.963 6.963 0 0 0 1.362 3.675c.47-.258.995-.482 1.565-.667zm6.728 2.964a7.009 7.009 0 0 0 2.275-1.521 8.376 8.376 0 0 0-1.197-.49 8.853 8.853 0 0 1-.481 1.078 6.688 6.688 0 0 1-.597.933zM8.5 11.909v3.014c.67-.204 1.335-.82 1.887-1.855.143-.268.276-.56.395-.872A12.63 12.63 0 0 0 8.5 11.91zm3.555-.401c.57.185 1.095.409 1.565.667A6.963 6.963 0 0 0 14.982 8.5h-2.49a13.36 13.36 0 0 1-.437 3.008zM14.982 7.5a6.963 6.963 0 0 0-1.362-3.675c-.47.258-.995.482-1.565.667.248.92.4 1.938.437 3.008h2.49zM11.27 2.461c.177.334.339.694.482 1.078a8.368 8.368 0 0 0 1.196-.49 7.01 7.01 0 0 0-2.275-1.52c.218.283.418.597.597.932zm-.488 1.343a7.765 7.765 0 0 0-.395-.872C9.835 1.897 9.17 1.282 8.5 1.077V4.09c.81-.03 1.577-.13 2.282-.287z" />
                                </svg>
                              </a>
                            )}
                          </div>
                        )}

                        <div className="mt-auto pt-2">
                          <button
                            onClick={() =>
                              handleCompanyClick(
                                company.entity_id,
                                company.name
                              )
                            }
                            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                            View Ads
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Pagination Controls */}
                {similarCompanies.pagination &&
                  similarCompanies.pagination.total_pages > 1 && (
                    <div className="mt-10 flex justify-center">
                      <nav
                        className="flex items-center gap-2"
                        aria-label="Pagination"
                      >
                        <button
                          onClick={() =>
                            handlePageChange(Math.max(1, currentPage - 1))
                          }
                          disabled={currentPage === 1}
                          className="px-3 py-2 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                                  text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 
                                  disabled:opacity-50 disabled:pointer-events-none transition-colors"
                        >
                          <span className="sr-only">Previous</span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>

                        {/* Show up to 5 page buttons */}
                        {Array.from(
                          { length: similarCompanies.pagination.total_pages },
                          (_, i) => i + 1
                        )
                          .filter((page) => {
                            // Show pages within 2 of current page, first page, and last page
                            const totalPages =
                              similarCompanies.pagination.total_pages;
                            return (
                              page === 1 ||
                              page === totalPages ||
                              (page >= currentPage - 1 &&
                                page <= currentPage + 1)
                            );
                          })
                          .map((page, index, array) => {
                            // Add ellipsis where there are gaps
                            if (index > 0 && array[index - 1] !== page - 1) {
                              return (
                                <span
                                  key={`ellipsis-${page}`}
                                  className="px-3 py-2 text-gray-500 dark:text-gray-400"
                                >
                                  ...
                                </span>
                              );
                            }

                            return (
                              <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`w-10 h-10 flex items-center justify-center rounded-md transition-colors ${
                                  currentPage === page
                                    ? "bg-blue-600 text-white"
                                    : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                }`}
                                aria-current={
                                  currentPage === page ? "page" : undefined
                                }
                              >
                                {page}
                              </button>
                            );
                          })}

                        <button
                          onClick={() =>
                            handlePageChange(
                              Math.min(
                                similarCompanies.pagination.total_pages,
                                currentPage + 1
                              )
                            )
                          }
                          disabled={
                            currentPage ===
                            similarCompanies.pagination.total_pages
                          }
                          className="px-3 py-2 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                                  text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 
                                  disabled:opacity-50 disabled:pointer-events-none transition-colors"
                        >
                          <span className="sr-only">Next</span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  )}
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
