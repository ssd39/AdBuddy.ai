import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

export interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
  attachments?: Array<{
    name: string;
    type: string;
    url: string;
  }>;
}

interface ConversationAreaProps {
  messages: Message[];
  isAiThinking: boolean;
}

const ConversationArea: React.FC<ConversationAreaProps> = ({
  messages,
  isAiThinking,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever messages change or AI starts/stops thinking
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAiThinking]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-2 mt-1 space-y-3 relative">
      {/* Message List */}
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${
            message.sender === "ai" ? "justify-start" : "justify-end"
          } items-start`}
        >
          {/* AI avatar and name outside the bubble */}
          {message.sender === "ai" && (
            <div className="flex flex-col items-center mr-2 mt-1">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">AI</span>
              </div>
              <span className="text-xs font-medium text-blue-400 mt-1">
                AdBuddy
              </span>
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 120 }}
            className={`max-w-3xl px-4 py-3 rounded-2xl shadow-lg ${
              message.sender === "ai"
                ? "bg-[#1e293b] text-neutral-100 border border-gray-700/40"
                : "bg-blue-600 text-white border border-blue-500/40"
            }`}
          >
            <p className="text-sm leading-relaxed">{message.text}</p>
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {message.attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="bg-gray-800/80 rounded-md p-2 flex items-center text-xs"
                  >
                    <svg
                      className="w-4 h-4 mr-1.5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                      />
                    </svg>
                    {attachment.name}
                  </div>
                ))}
              </div>
            )}
            <span className="block mt-1.5 text-xs opacity-60">
              {message.timestamp.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </motion.div>

          {/* User avatar outside the bubble */}
          {message.sender === "user" && (
            <div className="flex flex-col items-center ml-2 mt-1">
              <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">U</span>
              </div>
              <span className="text-xs font-medium text-gray-400 mt-1">
                You
              </span>
            </div>
          )}
        </div>
      ))}

      {/* AI Thinking Animation - Positioned at bottom left */}
      {isAiThinking && (
        <div className="flex justify-start mb-2">
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="max-w-xs px-4 py-2 rounded-2xl shadow-lg bg-[#1e293b] text-neutral-100 border border-gray-700/40"
          >
            <div className="flex items-center space-x-1.5 h-4">
              <div
                className="h-2 w-2 bg-blue-400 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              ></div>
              <div
                className="h-2 w-2 bg-blue-400 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              ></div>
              <div
                className="h-2 w-2 bg-blue-400 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              ></div>
            </div>
          </motion.div>
        </div>
      )}

      {/* This div ensures scrolling to the bottom of the conversation */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ConversationArea;
