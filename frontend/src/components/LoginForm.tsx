import { ErrorMessage, Field, Form, Formik } from "formik";
import { motion } from "framer-motion";
import * as Yup from "yup";


interface LoginFormProps {
  onSubmit: (email: string) => Promise<void>;
  isLoading: boolean;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
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
      stiffness: 300,
      damping: 24,
    },
  },
};

// Validation schema
const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
});

export default function LoginForm({ onSubmit, isLoading }: LoginFormProps) {

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-md"
    >
      <motion.div variants={itemVariants} className="mb-10 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-800 to-blue-600 dark:from-blue-400 dark:to-blue-200">
          Welcome to AdBuddy.ai
        </h2>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
          Login to manage your ad campaigns
        </p>
      </motion.div>

      <Formik
        initialValues={{ email: "" }}
        validationSchema={loginSchema}
        onSubmit={async (values) => {
          await onSubmit(values.email);
        }}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-6">
            <motion.div variants={itemVariants} className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-200"
              >
                Email Address
              </label>
              <Field
                type="email"
                name="email"
                id="email"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 
                        focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 
                        dark:text-white transition-colors duration-200 shadow-sm"
                placeholder="you@example.com"
              />
              <ErrorMessage
                name="email"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                We'll send you a one-time code to your email
              </p>
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
                  "Continue"
                )}
              </button>
            </motion.div>
          </Form>
        )}
      </Formik>
    </motion.div>
  );
}
