import { ErrorMessage, Field, Form, Formik } from "formik";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import * as Yup from "yup";

interface OTPVerificationFormProps {
  email: string;
  onSubmit: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
  onBack: () => void;
  isLoading: boolean;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30,
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
  exit: {
    opacity: 0,
    x: -50,
    transition: { ease: "easeInOut" as const },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24,
    },
  },
};

// Validation schema
const otpSchema = Yup.object().shape({
  otp: Yup.string()
    .required("OTP is required")
    .matches(/^\d{6}$/, "OTP must be exactly 6 digits"),
});

export default function OTPVerificationForm({
  email,
  onSubmit,
  onResend,
  onBack,
  isLoading,
}: OTPVerificationFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus the OTP input when the component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full max-w-md"
    >
      <motion.div variants={itemVariants} className="mb-10 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-800 to-blue-600 dark:from-blue-400 dark:to-blue-200">
          Verify OTP
        </h2>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
          Enter the 6-digit code sent to{" "}
          <span className="font-semibold break-all">{email}</span>
        </p>
      </motion.div>

      <Formik
        initialValues={{ otp: "" }}
        validationSchema={otpSchema}
        onSubmit={async (values) => {
          await onSubmit(values.otp);
        }}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-6">
            <motion.div variants={itemVariants} className="space-y-2">
              <label
                htmlFor="otp"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-200"
              >
                Verification Code
              </label>
              <Field
                type="text"
                name="otp"
                id="otp"
                innerRef={inputRef}
                className="w-full px-4 py-3.5 text-center tracking-widest text-lg font-medium
                        rounded-lg border border-gray-300 dark:border-gray-600 
                        focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 
                        dark:text-white transition-colors duration-200 shadow-sm"
                placeholder="000000"
                maxLength={6}
              />
              <ErrorMessage
                name="otp"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="w-full px-5 py-3.5 text-white bg-blue-600 hover:bg-blue-700
                       rounded-lg shadow-lg transition-all duration-300 flex justify-center items-center
                       focus:outline-none focus:ring-2 focus:ring-blue-500
                       disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-xl
                       transform hover:-translate-y-0.5 font-medium text-base"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 1,
                      ease: "linear",
                    }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  "Verify"
                )}
              </button>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex justify-between text-sm pt-4"
            >
              <button
                type="button"
                onClick={onBack}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200
                         flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800
                         transition-colors"
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
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={onResend}
                disabled={isLoading}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300
                         disabled:opacity-70 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg font-medium
                         hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                Resend code
              </button>
            </motion.div>
          </Form>
        )}
      </Formik>
    </motion.div>
  );
}
