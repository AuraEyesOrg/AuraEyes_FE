import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Mail,
  User,
  Phone,
  Stethoscope,
  Upload,
  FileText,
  X,
  CheckCircle,
  Calendar,
  Eye,
  Shield,
  Activity,
  Zap,
  Lock,
} from 'lucide-react';
import { useState } from 'react';
import { registerOphthalmologist } from '../api/auth.api';
import '@/styles/auth-animations.css';

interface DoctorFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  yearsOfExperience: string;
  bio: string;
}

const RegisterDoctorPage = () => {
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [degreeFile, setDegreeFile] = useState<File | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DoctorFormData>();

  const onSubmit = async (data: DoctorFormData) => {
    if (!licenseFile) {
      setSubmitError('Contract/License file is required before submitting.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    try {
      await registerOphthalmologist({
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        fullName: data.fullName,
        phone: data.phone || undefined,
        bio: data.bio || undefined,
        yearsOfExperience: parseInt(data.yearsOfExperience, 10) || 0,
        licenseImage: licenseFile ?? undefined,
        degreeImage: degreeFile ?? undefined,
      });
      setSubmittedEmail(data.email);
      setIsSubmitted(true);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setSubmitError(
        error?.response?.data?.message ||
          'Registration failed. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLicenseUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setLicenseFile(e.target.files[0]);
  };
  const handleDegreeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setDegreeFile(e.target.files[0]);
  };
  const removeLicense = () => setLicenseFile(null);
  const removeDegree = () => setDegreeFile(null);

  // Success State View
  if (isSubmitted) {
    return (
      <div className="min-h-screen w-full flex flex-col lg:flex-row">
        {/* Left Panel: Brand Identity */}
        <div className="lg:w-[40%] bg-gradient-to-br from-[#1A202C] to-[#2D3748] w-full flex flex-col justify-between p-8 lg:p-12 text-white relative overflow-hidden">
          {/* Background Decorative Elements */}
          <div className="absolute right-[-20%] top-[10%] opacity-5 pointer-events-none">
            <Activity className="w-[400px] h-[400px]" strokeWidth={0.5} />
          </div>
          <div className="absolute left-[-10%] bottom-[-10%] opacity-5 pointer-events-none">
            <Zap className="w-[300px] h-[300px]" strokeWidth={0.5} />
          </div>

          {/* Header */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <Eye className="text-[#00d1c0] w-10 h-10" />
              <span className="text-2xl font-bold tracking-tight">AURA</span>
            </div>
          </div>

          {/* Center Content */}
          <div className="relative z-10 flex flex-col gap-6 my-auto py-12">
            <div className="w-16 h-1 bg-[#00d1c0] mb-2 rounded-full"></div>
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
              Welcome to <br />
              <span className="text-[#00d1c0]">Medical Excellence.</span>
            </h1>
            <p className="text-gray-300 text-lg lg:text-xl font-light leading-relaxed max-w-md">
              Join our network of healthcare professionals using cutting-edge AI
              for retinal diagnostics.
            </p>
          </div>

          {/* Footer */}
          <div className="relative z-10 text-sm text-gray-500 flex justify-between items-end">
            <p>© {new Date().getFullYear()} Aura Medical Systems.</p>
            <a className="hover:text-[#00d1c0] transition-colors" href="#">
              System Status: <span className="text-green-400">● Online</span>
            </a>
          </div>
        </div>

        {/* Right Panel: Success Message */}
        <div className="lg:w-[60%] w-full bg-white flex flex-col items-center justify-center p-6 sm:p-12 lg:p-24">
          <div className="w-full max-w-[480px] animate-slide-in-right">
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6 animate-pulse-slow">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-[#1A202C] mb-3 tracking-tight">
                Application Submitted!
              </h2>
              <p className="text-gray-600 mb-2">
                Thank you for registering with AURA Healthcare Network.
              </p>
              <p className="text-gray-600 mb-6">
                Our team will review your application and credentials. You will
                receive your account details via email within 2-3 business days.
              </p>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mb-6">
                <p className="text-sm text-blue-800">
                  Please check your email <strong>{submittedEmail}</strong> to
                  verify your account before the admin reviews your contract.
                </p>
              </div>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#00d1c0] hover:bg-[#00b8a9] text-white rounded-lg font-semibold transition-all duration-200 button-hover-lift uppercase tracking-wider text-sm"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Registration Form View
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row">
      {/* Left Panel: Brand Identity */}
      <div className="lg:w-[40%] bg-gradient-to-br from-[#1A202C] to-[#2D3748] w-full flex flex-col justify-between p-8 lg:p-12 text-white relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute right-[-20%] top-[10%] opacity-5 pointer-events-none">
          <Activity className="w-[400px] h-[400px]" strokeWidth={0.5} />
        </div>
        <div className="absolute left-[-10%] bottom-[-10%] opacity-5 pointer-events-none">
          <Zap className="w-[300px] h-[300px]" strokeWidth={0.5} />
        </div>

        {/* Header */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Eye className="text-[#00d1c0] w-10 h-10" />
            <span className="text-2xl font-bold tracking-tight">AURA</span>
          </div>
        </div>

        {/* Center Content */}
        <div className="relative z-10 flex flex-col gap-6 my-auto py-12">
          <div className="w-16 h-1 bg-[#00d1c0] mb-2 rounded-full"></div>
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
            Join Our <br />
            <span className="text-[#00d1c0]">Medical Network.</span>
          </h1>
          <p className="text-gray-300 text-lg lg:text-xl font-light leading-relaxed max-w-md">
            Become part of our elite team of healthcare professionals leveraging
            AI-powered diagnostics.
          </p>

          {/* Features */}
          <div className="space-y-4 mt-8">
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-[#00d1c0]/20 flex items-center justify-center flex-shrink-0 mt-1">
                <CheckCircle className="h-4 w-4 text-[#00d1c0]" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">
                  AI-Powered Analysis
                </h3>
                <p className="text-gray-400 text-sm">
                  Access cutting-edge retinal screening technology
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-[#00d1c0]/20 flex items-center justify-center flex-shrink-0 mt-1">
                <CheckCircle className="h-4 w-4 text-[#00d1c0]" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">
                  Secure Platform
                </h3>
                <p className="text-gray-400 text-sm">
                  HIPAA-compliant data protection standards
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-[#00d1c0]/20 flex items-center justify-center flex-shrink-0 mt-1">
                <CheckCircle className="h-4 w-4 text-[#00d1c0]" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">
                  Collaborative Care
                </h3>
                <p className="text-gray-400 text-sm">
                  Connect with specialists and share insights
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-sm text-gray-500 flex justify-between items-end">
          <p>© 2026 Aura Medical Systems.</p>
          <a className="hover:text-[#00d1c0] transition-colors" href="#">
            System Status: <span className="text-green-400">● Online</span>
          </a>
        </div>
      </div>

      {/* Right Panel: Registration Form */}
      <div className="lg:w-[60%] w-full bg-white flex flex-col overflow-y-auto">
        <div className="flex-1 p-6 sm:p-12 lg:p-16">
          <div className="w-full max-w-[520px] mx-auto animate-slide-in-right">
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-[#1F85F5] to-[#00d1c0] text-white mb-4">
                <Stethoscope className="h-6 w-6" />
              </div>
              <h2 className="text-3xl font-bold text-[#1A202C] mb-2 tracking-tight">
                Doctor Registration
              </h2>
              <p className="text-gray-600 text-sm">
                Join AURA Healthcare Network
              </p>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    {...register('fullName', {
                      required: 'Full name is required',
                      minLength: {
                        value: 3,
                        message: 'Name must be at least 3 characters',
                      },
                    })}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1F85F5] focus:ring-1 focus:ring-[#1F85F5] sm:text-sm bg-gray-50/30 transition-all"
                    placeholder="Dr. John Smith"
                  />
                </div>
                {errors.fullName && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">
                  Medical Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1F85F5] focus:ring-1 focus:ring-[#1F85F5] sm:text-sm bg-gray-50/30 transition-all"
                    placeholder="dr.smith@hospital.org"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Phone className="w-5 h-5" />
                  </div>
                  <input
                    type="tel"
                    {...register('phone', {
                      pattern: {
                        value: /^[0-9+\-\s()]+$/,
                        message: 'Invalid phone number',
                      },
                    })}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1F85F5] focus:ring-1 focus:ring-[#1F85F5] sm:text-sm bg-gray-50/30 transition-all"
                    placeholder="+84 (123) 456-7890"
                  />
                </div>
                {errors.phone && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters',
                      },
                    })}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1F85F5] focus:ring-1 focus:ring-[#1F85F5] sm:text-sm bg-gray-50/30 transition-all"
                    placeholder="Minimum 8 characters"
                  />
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                    })}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1F85F5] focus:ring-1 focus:ring-[#1F85F5] sm:text-sm bg-gray-50/30 transition-all"
                    placeholder="Re-enter your password"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Years of Experience */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">
                  Experience (years) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <input
                    type="number"
                    {...register('yearsOfExperience', {
                      required: 'Experience is required',
                      min: { value: 0, message: 'Invalid experience' },
                    })}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1F85F5] focus:ring-1 focus:ring-[#1F85F5] sm:text-sm bg-gray-50/30 transition-all"
                    placeholder="5"
                  />
                </div>
                {errors.yearsOfExperience && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.yearsOfExperience.message}
                  </p>
                )}
              </div>

              {/* Bio / Description */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">
                  Brief Bio (Optional)
                </label>
                <textarea
                  {...register('bio')}
                  rows={3}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1F85F5] focus:ring-1 focus:ring-[#1F85F5] sm:text-sm bg-gray-50/30 transition-all resize-none"
                  placeholder="Brief introduction about your practice and expertise..."
                />
              </div>

              {/* License Upload */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">
                  Contract / License <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Upload your contract or medical license (PDF, JPG, PNG - Max
                  10MB)
                </p>
                {!licenseFile ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#1F85F5] hover:bg-blue-50/30 transition-all">
                    <input
                      type="file"
                      id="licenseUpload"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleLicenseUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="licenseUpload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload className="h-6 w-6 text-[#00d1c0] mb-1" />
                      <p className="text-sm font-medium text-gray-700">
                        Click to upload contract / license
                      </p>
                    </label>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="h-5 w-5 text-[#00d1c0] flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700 truncate">
                          {licenseFile.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(licenseFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeLicense}
                      className="ml-2 p-1 hover:bg-red-100 rounded-full transition-colors"
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                )}
              </div>

              {/* Degree Upload */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">
                  Medical Degree
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Upload medical degree certificate (PDF, JPG, PNG - Max 10MB)
                </p>
                {!degreeFile ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#1F85F5] hover:bg-blue-50/30 transition-all">
                    <input
                      type="file"
                      id="degreeUpload"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleDegreeUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="degreeUpload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload className="h-6 w-6 text-[#00d1c0] mb-1" />
                      <p className="text-sm font-medium text-gray-700">
                        Click to upload degree
                      </p>
                    </label>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="h-5 w-5 text-[#00d1c0] flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700 truncate">
                          {degreeFile.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(degreeFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeDegree}
                      className="ml-2 p-1 hover:bg-red-100 rounded-full transition-colors"
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                )}
              </div>

              {/* Info Banner */}
              <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                <div className="flex items-start gap-3">
                  <Shield className="text-[#1F85F5] w-5 h-5 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-blue-900 mb-1">
                      Account Creation Process
                    </h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      After submitting your application, our verification team
                      will first verify your email, then review your submitted
                      contract/license before activating your doctor workflow.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                {submitError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{submitError}</p>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-[#00d1c0] hover:bg-[#00b8a9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00d1c0] transition-all duration-200 uppercase tracking-wider button-hover-lift disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-none"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>

            {/* Back Link */}
            <div className="pt-6 border-t border-gray-100 mt-6">
              <p className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/"
                  className="font-semibold text-[#1F85F5] hover:text-[#00d1c0] transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterDoctorPage;
