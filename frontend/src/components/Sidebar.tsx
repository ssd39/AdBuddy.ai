import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { logout } from "../services/authService";

// Navigation links
const navigation = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
      </svg>
    ),
  },
  {
    name: "Competitors",
    path: "/competitors",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm9 4a1 1 0 10-2 0v6a1 1 0 102 0V7zm-3 2a1 1 0 10-2 0v4a1 1 0 102 0V9zm-3 3a1 1 0 10-2 0v1a1 1 0 102 0v-1z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="h-full flex flex-col bg-gray-900 border-r border-gray-700 shadow-sm transition-all duration-300">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center justify-center flex-shrink-0 px-4 mb-8">
          <div className="relative w-full">
            {/* Outer glow effect */}
            <div className="absolute -inset-1 rounded-2xl bg-blue-900/50 blur-md opacity-75"></div>

            {/* Main container */}
            <div className="relative rounded-xl bg-[#111827] border border-gray-800/50 py-4 px-5 flex items-center justify-center overflow-hidden">
              {/* Logo text */}
              <div className="flex items-center">
                <span className="text-2xl font-bold text-blue-400">Ad</span>
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
                  Buddy
                </span>
                <span className="text-2xl font-bold text-gray-400">.ai</span>
              </div>
            </div>
          </div>
        </div>
        <nav className="mt-5 flex-1 px-2 space-y-3">
          {navigation.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl relative transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-blue-900/80 to-blue-800/50 text-blue-300 shadow-lg shadow-blue-900/20"
                    : "text-neutral-200 hover:bg-gray-800/70 hover:shadow-md"
                }`}
              >
                <div
                  className={`mr-3 ${
                    isActive
                      ? "text-blue-400"
                      : "text-gray-400 group-hover:text-gray-300"
                  }`}
                >
                  {item.icon}
                </div>
                <span className="font-medium">{item.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-blue-400 rounded-r-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex-shrink-0 mt-auto p-4">
        <div className="w-full border-t border-gray-700 pt-4">
          <div className="flex items-center justify-between">
            <div className="ml-1">
              <p className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
                AdBuddy<span className="opacity-80">.ai</span>
              </p>
              <p className="text-xs font-medium text-gray-400">v0.1.0</p>
            </div>
            <button
              onClick={() => logout()}
              className="flex items-center px-3 py-2 text-sm font-medium rounded-xl bg-gradient-to-r from-red-500/20 to-red-600/10 text-red-300 hover:from-red-500/30 hover:to-red-600/20 hover:text-red-200 transition-all duration-300 shadow-sm hover:shadow"
              title="Logout"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
