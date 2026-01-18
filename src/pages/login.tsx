import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '@/components/layouts';
import { useForm } from 'react-hook-form';
import { Eye, Lock, Info, ExternalLink } from 'lucide-react';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);

  // Toggle states
  const [allowAIScreening, setAllowAIScreening] = useState(false);
  const [contributeResearch, setContributeResearch] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data: any) => {
    console.log(data);
    // TODO: Implement login logic
  };

  return (
    <AuthLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome to Patient Portal
        </h2>
        <p className="text-gray-500 text-sm">
          Secure Access & Data Consent. Please review permissions before logging
          in.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Patient ID / Email */}
        <div className="space-y-1">
          <label className="block text-sm font-semibold text-gray-700">
            Patient ID or Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                />
              </svg>
            </div>
            <input
              {...register('identifier', { required: true })}
              type="text"
              placeholder="Enter your ID"
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-gray-900 placeholder-gray-400 sm:text-sm"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-gray-700">
              Password
            </label>
            <a
              href="#"
              className="text-xs font-medium text-primary hover:text-primary/80"
            >
              Forgot password?
            </a>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Lock className="h-5 w-5" />
            </div>
            <input
              {...register('password', { required: true })}
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-gray-900 placeholder-gray-400 sm:text-sm"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-gray-600">
              {/* Could add show/hide toggle here if design requested, but sticking strictly to image for now which doesn't explicitly show it but it's UX best practice. Image shows just icon left. */}
            </div>
          </div>
        </div>

        {/* Data Consent Section */}
        <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-100">
          <div className="flex gap-3 mb-4">
            <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-gray-900">
                Data Consent & Permissions
              </h4>
              <p className="text-xs text-gray-500 mt-1">
                Transparency is our priority. We need your explicit permission
                to process your imaging data.
              </p>
            </div>
          </div>

          <div className="space-y-4 bg-white rounded-lg p-3 border border-gray-100">
            {/* Toggle 1 */}
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    Allow AI Screening
                  </span>
                  <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] uppercase font-bold tracking-wider rounded">
                    Required
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Consent to analyze retinal images for vascular abnormalities.
                </p>
              </div>
              {/* Custom Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={allowAIScreening}
                  onChange={() => setAllowAIScreening(!allowAIScreening)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-100"></div>

            {/* Toggle 2 */}
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    Contribute to Research
                  </span>
                  <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] uppercase font-bold tracking-wider rounded">
                    Optional
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Allow anonymized data to be used for non-profit medical
                  research.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={contributeResearch}
                  onChange={() => setContributeResearch(!contributeResearch)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Terms Checkbox */}
        <div className="flex items-start gap-3">
          <div className="flex h-5 items-center">
            <input
              id="terms"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
          </div>
          <label htmlFor="terms" className="text-xs text-gray-600">
            I have read and agree to the{' '}
            <a href="#" className="font-medium text-primary hover:underline">
              Privacy Policy
            </a>{' '}
            and{' '}
            <a href="#" className="font-medium text-primary hover:underline">
              Terms of Service
            </a>
            .
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-background-dark font-semibold py-3 px-4 rounded-xl transition-all shadow-[0_4px_14px_0_rgba(19,236,236,0.39)] hover:shadow-[0_6px_20px_rgba(19,236,236,0.23)] hover:-translate-y-0.5"
        >
          <Lock className="h-4 w-4" />
          Verify & Log In
        </button>

        {/* Footer */}
        <div className="text-center">
          <span className="text-sm text-gray-500">New patient? </span>
          <Link
            to="/register"
            className="text-sm font-semibold text-primary hover:underline"
          >
            Activate your account
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
