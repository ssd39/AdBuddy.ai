import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { useTheme } from "../contexts/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={toggleTheme}
      className={`rounded-full p-2.5 shadow-lg backdrop-blur-sm transition-all duration-300
                ${theme === "light" 
                  ? "bg-white text-yellow-600 border border-gray-200/50 hover:bg-gray-50 hover:border-blue-300/50 focus:ring-2 focus:ring-blue-500/50" 
                  : "bg-gray-800 text-blue-300 border border-gray-700/50 hover:bg-gray-700 hover:border-blue-600/50 focus:ring-2 focus:ring-blue-400/50"
                }
                focus:outline-none`}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      <motion.div
        initial={false}
        animate={{
          rotate: theme === "dark" ? 0 : 180,
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 0.6,
          ease: "easeInOut",
          scale: { duration: 0.3, times: [0, 0.5, 1] },
        }}
        className="w-5 h-5 flex items-center justify-center"
      >
        {theme === "dark" ? (
          <SunIcon className="w-5 h-5 drop-shadow-md" />
        ) : (
          <MoonIcon className="w-5 h-5 drop-shadow-md" />
        )}
      </motion.div>
    </motion.button>
  );
}
