import { motion } from "framer-motion";
import React, { useState } from "react";
import { Link } from "react-router-dom";

const fadeInUp = {
  initial: { y: 20, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const fadeIn = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.8 },
  },
};

const LandingPage: React.FC = () => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-neutral-200 overflow-hidden">
      {/* Hero Section */}
      <div className="relative z-10">
        {/* Background Gradient Effects */}
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-full blur-3xl transform translate-x-1/4 -translate-y-1/4"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-blue-800/20 to-blue-700/10 rounded-full blur-3xl transform -translate-x-1/4 translate-y-1/4"></div>

        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <motion.div
            className="max-w-5xl mx-auto text-center"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="mb-6">
              <div className="inline-block">
                <div className="relative">
                  {/* Outer glow effect */}
                  <div className="absolute -inset-1 rounded-2xl bg-blue-900/50 blur-md opacity-75"></div>

                  {/* Logo */}
                  <div className="relative rounded-xl bg-[#111827] border border-gray-800/50 py-4 px-6 flex items-center justify-center overflow-hidden">
                    <div className="flex items-center">
                      <span className="text-3xl md:text-4xl font-bold text-blue-400">
                        Ad
                      </span>
                      <span className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
                        Buddy
                      </span>
                      <span className="text-3xl md:text-4xl font-bold text-gray-400">
                        .ai
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
            >
              Your Personal{" "}
              <span className="text-gradient">AI Ad Consultant</span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-xl md:text-2xl text-neutral-300 mb-10 max-w-3xl mx-auto"
            >
              Like working with a premium ad agency, but better. Our AI agents
              communicate with you to understand your business, analyze
              competitors, and craft precise campaigns backed by Qloo's taste
              insight data.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to="/login"
                className="btn-primary text-lg py-3 px-8 rounded-xl shadow-blue-900/20 shadow-lg"
              >
                Get Started
              </Link>
              <button
                onClick={() => setIsVideoPlaying(true)}
                className="btn-secondary text-lg py-3 px-8 flex items-center justify-center gap-2 rounded-xl"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"
                  />
                </svg>
                Watch Demo
              </button>
            </motion.div>
          </motion.div>

          {/* Demo Image/Mockup */}
          <motion.div
            variants={fadeIn}
            initial="initial"
            animate="animate"
            className="mt-16 md:mt-24 max-w-5xl mx-auto relative"
          >
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-1">
              <div className="relative rounded-lg overflow-hidden shadow-2xl shadow-blue-900/20 border border-gray-800">
                <div className="bg-gray-800 p-2 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                </div>
                <img
                  src="/preview.png"
                  alt="AdBuddy.ai Dashboard"
                  className="w-full h-auto object-cover"
                  onError={(e) => {
                    // If image fails to load, show a placeholder
                    e.currentTarget.src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 800 450'%3E%3Crect fill='%232A3042' width='800' height='450'/%3E%3Ctext x='400' y='225' font-family='Arial' font-size='30' fill='%238BA1BB' text-anchor='middle' dominant-baseline='middle'%3EAdBuddy.ai Dashboard%3C/text%3E%3C/svg%3E";
                  }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <motion.div
        className="py-20 bg-gray-900/80 backdrop-blur-sm relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose <span className="text-gradient">AdBuddy.ai</span>?
            </h2>
            <p className="text-xl text-neutral-300 max-w-2xl mx-auto">
              Experience the personal touch of an ad agency with the power and
              efficiency of AI consultants that understand your business needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                className="card bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="bg-blue-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-neutral-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* How It Works Section */}
      <div className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How <span className="text-gradient">It Works</span>
            </h2>
            <p className="text-xl text-neutral-300 max-w-2xl mx-auto">
              Get started with AdBuddy.ai in three simple steps
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ x: index % 2 === 0 ? -20 : 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 + index * 0.15, duration: 0.5 }}
                className="flex flex-col md:flex-row items-center gap-8 mb-16"
              >
                <div
                  className={`md:w-1/2 ${index % 2 !== 0 ? "md:order-2" : ""}`}
                >
                  <div className="text-5xl font-bold text-blue-500/20 mb-2">
                    0{index + 1}
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                  <p className="text-neutral-300 mb-4">{step.description}</p>
                </div>
                <div
                  className={`md:w-1/2 ${index % 2 !== 0 ? "md:order-1" : ""}`}
                >
                  <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5 shadow-lg aspect-video flex items-center justify-center">
                    {step.icon}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gray-900/80 backdrop-blur-sm relative z-10">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-4xl mx-auto text-center bg-gray-800/80 backdrop-blur-md border border-gray-700/50 rounded-2xl p-8 md:p-12 shadow-xl"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Work With Your AI Consultant?
            </h2>
            <p className="text-xl text-neutral-300 mb-8">
              Join AdBuddy.ai today and experience a new way of planning,
              creating and launching successful campaigns.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/login"
                className="btn-primary text-lg py-3 px-8 rounded-xl shadow-blue-900/20 shadow-lg"
              >
                Get Started Now
              </Link>
              <button
                onClick={() => setIsVideoPlaying(true)}
                className="btn-secondary text-lg py-3 px-8 flex items-center justify-center gap-2 rounded-xl"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"
                  />
                </svg>
                Watch Demo
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 bg-gray-950 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <span className="text-xl font-bold text-blue-400">Ad</span>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
                Buddy
              </span>
              <span className="text-xl font-bold text-gray-400">.ai</span>
            </div>
            <div className="flex gap-6">
              <a
                href="#"
                className="text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                Contact
              </a>
            </div>
            <div className="mt-4 md:mt-0 text-sm text-neutral-500">
              © {new Date().getFullYear()} AdBuddy.ai. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* Video Modal */}
      {isVideoPlaying && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <div className="relative w-full max-w-4xl bg-gray-900 rounded-xl overflow-hidden">
            <button
              onClick={() => setIsVideoPlaying(false)}
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 transition-colors rounded-full p-2 text-white z-10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div className="aspect-video bg-black flex items-center justify-center">
              {/* Replace with actual video embed */}
              <div className="text-center text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-16 h-16 mx-auto mb-4 opacity-50"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
                  />
                </svg>
                <p>Video Demo Coming Soon</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Feature content
const features = [
  {
    title: "AI Consultant Experience",
    description:
      "Communicate with our AI agents as you would with human consultants. They ask questions, understand your business, and provide expert guidance.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 text-blue-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
        />
      </svg>
    ),
  },
  {
    title: "Competitor Intelligence",
    description:
      "Get insights into competitors' ad strategies and creative approaches. Stay ahead of the latest trends in your industry.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 text-blue-400"
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
    ),
  },
  {
    title: "Data-Backed Precision",
    description:
      "All campaigns are powered by Qloo's taste insight data to help you target the right audience segments with precision.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 text-blue-400"
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
    ),
  },
];

// Steps content
const steps = [
  {
    title: "Consult With Your AI Agent",
    description:
      "Connect with your personal AI consultant that asks questions to understand your business, goals, and target audience.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-16 w-16 text-blue-500/60"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
    ),
  },
  {
    title: "Review Competitor Analysis",
    description:
      "See what your competitors are doing and get insights from our AI on market trends, opportunities, and creative approaches.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-16 w-16 text-blue-500/60"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
    ),
  },
  {
    title: "Create & Launch Precision Campaigns",
    description:
      "Your AI consultant crafts detailed campaigns for both online and offline channels, backed by Qloo data to target the right audience segments.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-16 w-16 text-blue-500/60"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
        />
      </svg>
    ),
  },
];

export default LandingPage;
