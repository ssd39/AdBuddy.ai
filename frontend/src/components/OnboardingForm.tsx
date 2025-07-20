import { ErrorMessage, Field, Form, Formik } from "formik";
import { motion } from "framer-motion";
import * as Yup from "yup";

// Export both the interface and component properly
export interface OnboardingData {
  full_name: string;
  company_name: string;
  role: string;
  industry: string;
}

interface OnboardingFormProps {
  onSubmit: (data: OnboardingData) => Promise<void>;
  isLoading: boolean;
}

// Industry options
const industries = [
  { value: "technology", label: "Technology" },
  { value: "healthcare", label: "Healthcare" },
  { value: "finance", label: "Finance" },
  { value: "education", label: "Education" },
  { value: "retail", label: "Retail" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "services", label: "Professional Services" },
  { value: "entertainment", label: "Entertainment" },
  { value: "hospitality", label: "Hospitality" },
  { value: "other", label: "Other" },
];

// Roles options
const roles = [
  { value: "marketing", label: "Marketing Manager" },
  { value: "sales", label: "Sales Manager" },
  { value: "executive", label: "Executive/C-Suite" },
  { value: "owner", label: "Business Owner" },
  { value: "specialist", label: "Marketing Specialist" },
  { value: "consultant", label: "Consultant" },
  { value: "other", label: "Other" },
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

// Validation schema
const onboardingSchema = Yup.object().shape({
  full_name: Yup.string()
    .required("Full name is required")
    .min(2, "Name is too short"),
  company_name: Yup.string().required("Company name is required"),
  role: Yup.string().required("Role is required"),
  industry: Yup.string().required("Industry is required"),
});

export default function OnboardingForm({
  onSubmit,
  isLoading,
}: OnboardingFormProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-2xl"
    >
      <motion.div variants={itemVariants} className="mb-10 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900 dark:text-white">
          Complete Your Profile
        </h2>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
          Tell us a bit about yourself to get started
        </p>
      </motion.div>

      <Formik
        initialValues={{
          full_name: "",
          company_name: "",
          role: "",
          industry: "",
        }}
        validationSchema={onboardingSchema}
        onSubmit={async (values) => {
          await onSubmit(values);
        }}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-5">
            <motion.div variants={itemVariants} className="space-y-2">
              <label
                htmlFor="full_name"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-200"
              >
                Full Name
              </label>
              <Field
                type="text"
                name="full_name"
                id="full_name"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 
                        focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 
                        dark:text-white transition-colors duration-200 shadow-sm"
                placeholder="John Doe"
              />
              <ErrorMessage
                name="full_name"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-2">
              <label
                htmlFor="company_name"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-200"
              >
                Company Name
              </label>
              <Field
                type="text"
                name="company_name"
                id="company_name"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 
                        focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 
                        dark:text-white transition-colors duration-200 shadow-sm"
                placeholder="Your Company"
              />
              <ErrorMessage
                name="company_name"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <motion.div variants={itemVariants} className="space-y-2">
                <label
                  htmlFor="role"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-200"
                >
                  Your Role
                </label>
                <Field
                  as="select"
                  name="role"
                  id="role"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 
                          focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 
                          dark:text-white transition-colors duration-200 shadow-sm appearance-none bg-no-repeat bg-[right_0.75rem_center]"
                  style={{
                    backgroundImage:
                      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='currentColor' class='w-6 h-6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5' /%3E%3C/svg%3E\")",
                    backgroundSize: "1.5em 1.5em",
                  }}
                >
                  <option value="">Select your role</option>
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </Field>
                <ErrorMessage
                  name="role"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-2">
                <label
                  htmlFor="industry"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-200"
                >
                  Industry
                </label>
                <Field
                  as="select"
                  name="industry"
                  id="industry"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 
                          focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 
                          dark:text-white transition-colors duration-200 shadow-sm appearance-none bg-no-repeat bg-[right_0.75rem_center]"
                  style={{
                    backgroundImage:
                      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='currentColor' class='w-6 h-6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5' /%3E%3C/svg%3E\")",
                    backgroundSize: "1.5em 1.5em",
                  }}
                >
                  <option value="">Select your industry</option>
                  {industries.map((industry) => (
                    <option key={industry.value} value={industry.value}>
                      {industry.label}
                    </option>
                  ))}
                </Field>
                <ErrorMessage
                  name="industry"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </motion.div>
            </div>

            <motion.div variants={itemVariants} className="pt-6">
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
                  "Complete Setup"
                )}
              </button>
              <p className="text-xs text-center mt-5 text-gray-500 dark:text-gray-400">
                By completing setup, you agree to our{" "}
                <span className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                  Terms of Service
                </span>{" "}
                and{" "}
                <span className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                  Privacy Policy
                </span>
              </p>
            </motion.div>
          </Form>
        )}
      </Formik>
    </motion.div>
  );
}
