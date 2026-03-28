import { Link } from 'react-router-dom';
import { useFieldArray, useForm } from 'react-hook-form';
import {
  Mail,
  User,
  Phone,
  Upload,
  FileText,
  X,
  CheckCircle,
  Calendar,
  Shield,
  Activity,
  Zap,
  Lock,
  Plus,
  Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { registerOphthalmologist } from '../api/auth.api';
import { AuraLogo } from '@/components/ui/aura-logo';
import '@/styles/auth-animations.css';

interface CredentialFormItem {
  name: string;
  issuingAuthority: string;
  issuedDate: string;
  expiryDate: string;
  file: File | null;
}

interface DegreeFormItem {
  name: string;
  issuingAuthority: string;
  issuedDate: string;
  file: File | null;
}

interface CertificateFormItem {
  name: string;
  issuingAuthority: string;
  issuedDate: string;
  expiryDate: string;
  file: File | null;
}

interface DoctorFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  yearsOfExperience: string;
  employmentType: 'FullTime' | 'PartTime';
  workingHoursPerWeek: string;
  expectedMonthlySalary: string;
  bio: string;
  degrees: DegreeFormItem[];
  certificates: CertificateFormItem[];
}

const createDefaultDegree = (): DegreeFormItem => ({
  name: '',
  issuingAuthority: '',
  issuedDate: '',
  file: null,
});

const createDefaultCertificate = (): CertificateFormItem => ({
  name: '',
  issuingAuthority: '',
  issuedDate: '',
  expiryDate: '',
  file: null,
});

const RegisterDoctorPage = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<DoctorFormData>({
    defaultValues: {
      employmentType: 'FullTime',
      workingHoursPerWeek: '40',
      expectedMonthlySalary: '',
      degrees: [createDefaultDegree()],
      certificates: [createDefaultCertificate()],
    },
  });

  const {
    fields: degreeFields,
    append: appendDegree,
    remove: removeDegree,
  } = useFieldArray({
    control,
    name: 'degrees',
  });

  const {
    fields: certificateFields,
    append: appendCertificate,
    remove: removeCertificate,
  } = useFieldArray({
    control,
    name: 'certificates',
  });

  const selectedEmploymentType = watch('employmentType');
  const yearsOfExperienceValue = parseInt(
    watch('yearsOfExperience') || '0',
    10
  );
  const suggestedSalary =
    selectedEmploymentType === 'PartTime'
      ? 12000000 + Math.max(yearsOfExperienceValue, 0) * 500000
      : 25000000 + Math.max(yearsOfExperienceValue, 0) * 1000000;

  const degrees = watch('degrees') || [];
  const certificates = watch('certificates') || [];

  useEffect(() => {
    setValue(
      'workingHoursPerWeek',
      selectedEmploymentType === 'PartTime' ? '28' : '48'
    );
  }, [selectedEmploymentType, setValue]);

  const handleCredentialFileChange = (
    group: 'degrees' | 'certificates',
    index: number,
    file?: File
  ) => {
    setValue(`${group}.${index}.file`, file || null, { shouldValidate: true });
  };

  const toUtcIsoDate = (dateInput: string): string => {
    const date = new Date(`${dateInput}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime())) {
      throw new Error('Invalid date input.');
    }

    return date.toISOString();
  };

  const onSubmit = async (data: DoctorFormData) => {
    if (!data.degrees.length) {
      setSubmitError('At least one degree is required before submitting.');
      return;
    }

    if (!data.certificates.length) {
      setSubmitError(
        'At least one certificate/license is required before submitting.'
      );
      return;
    }

    if (data.degrees.some((item) => !item.file)) {
      setSubmitError('Every degree item must include a file.');
      return;
    }

    if (data.certificates.some((item) => !item.file)) {
      setSubmitError('Every certificate item must include a file.');
      return;
    }

    if (data.certificates.some((item) => !item.expiryDate)) {
      setSubmitError('Every certificate item must include an expiry date.');
      return;
    }

    if (
      data.certificates.some(
        (item) =>
          new Date(`${item.expiryDate}T00:00:00.000Z`) <=
          new Date(`${item.issuedDate}T00:00:00.000Z`)
      )
    ) {
      setSubmitError('Certificate expiry date must be later than issued date.');
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
        employmentType: data.employmentType,
        workingHoursPerWeek:
          parseInt(data.workingHoursPerWeek, 10) || undefined,
        expectedMonthlySalary:
          parseFloat(data.expectedMonthlySalary) || undefined,
        degrees: data.degrees.map((item) => ({
          name: item.name,
          issuingAuthority: item.issuingAuthority || undefined,
          issuedDate: toUtcIsoDate(item.issuedDate),
          expiryDate: undefined,
          file: item.file as File,
        })),
        certificates: data.certificates.map((item) => ({
          name: item.name,
          issuingAuthority: item.issuingAuthority || undefined,
          issuedDate: toUtcIsoDate(item.issuedDate),
          expiryDate: toUtcIsoDate(item.expiryDate),
          file: item.file as File,
        })),
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

  if (isSubmitted) {
    return (
      <div className="min-h-screen w-full flex flex-col lg:flex-row">
        <div className="lg:w-[40%] bg-gradient-to-br from-[#1A202C] to-[#2D3748] w-full flex flex-col justify-between p-8 lg:p-12 text-white relative overflow-hidden">
          <div className="absolute right-[-20%] top-[10%] opacity-5 pointer-events-none">
            <Activity className="w-[400px] h-[400px]" strokeWidth={0.5} />
          </div>
          <div className="absolute left-[-10%] bottom-[-10%] opacity-5 pointer-events-none">
            <Zap className="w-[300px] h-[300px]" strokeWidth={0.5} />
          </div>

          <div className="relative z-10">
            <AuraLogo size="sm" variant="light" className="mb-2" />
          </div>

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

          <div className="relative z-10 text-sm text-gray-500 flex justify-between items-end">
            <p>© {new Date().getFullYear()} Aura Medical Systems.</p>
            <a className="hover:text-[#00d1c0] transition-colors" href="#">
              System Status: <span className="text-green-400">● Online</span>
            </a>
          </div>
        </div>

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

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row">
      <div className="lg:w-[40%] bg-gradient-to-br from-[#1A202C] to-[#2D3748] w-full flex flex-col justify-between p-8 lg:p-12 text-white relative overflow-hidden">
        <div className="absolute right-[-20%] top-[10%] opacity-5 pointer-events-none">
          <Activity className="w-[400px] h-[400px]" strokeWidth={0.5} />
        </div>
        <div className="absolute left-[-10%] bottom-[-10%] opacity-5 pointer-events-none">
          <Zap className="w-[300px] h-[300px]" strokeWidth={0.5} />
        </div>

        <div className="relative z-10">
          <AuraLogo size="sm" variant="light" className="mb-2" />
        </div>

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
        </div>

        <div className="relative z-10 text-sm text-gray-500 flex justify-between items-end">
          <p>© 2026 Aura Medical Systems.</p>
          <a className="hover:text-[#00d1c0] transition-colors" href="#">
            System Status: <span className="text-green-400">● Online</span>
          </a>
        </div>
      </div>

      <div className="lg:w-[60%] w-full bg-white flex flex-col overflow-y-auto">
        <div className="flex-1 p-6 sm:p-12 lg:p-16">
          <div className="w-full max-w-[640px] mx-auto animate-slide-in-right">
            <div className="mb-8 text-center">
              <div className="mb-4 flex justify-center">
                <AuraLogo size="sm" showText={false} variant="dark" />
              </div>
              <h2 className="text-3xl font-bold text-[#1A202C] mb-2 tracking-tight">
                Doctor Registration
              </h2>
              <p className="text-gray-600 text-sm">
                Join AURA Healthcare Network
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">
                  Working Mode <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      value: 'FullTime' as const,
                      label: 'Full-time',
                      description: 'Toàn thời gian, lịch làm ổn định',
                    },
                    {
                      value: 'PartTime' as const,
                      label: 'Part-time',
                      description: 'Bán thời gian, lịch làm linh hoạt',
                    },
                  ].map((option) => {
                    const isSelected = selectedEmploymentType === option.value;
                    return (
                      <label
                        key={option.value}
                        className={`rounded-lg border px-4 py-3 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#1F85F5] bg-blue-50'
                            : 'border-gray-300 bg-white hover:border-[#1F85F5]/60'
                        }`}
                      >
                        <input
                          type="radio"
                          value={option.value}
                          {...register('employmentType', {
                            required: 'Working mode is required',
                          })}
                          className="sr-only"
                        />
                        <p className="text-sm font-semibold text-gray-800">
                          {option.label}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {option.description}
                        </p>
                      </label>
                    );
                  })}
                </div>
                {errors.employmentType && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.employmentType.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">
                  Working Hours / Week <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <input
                    type="number"
                    {...register('workingHoursPerWeek', {
                      required: 'Working hours is required',
                    })}
                    disabled
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1F85F5] focus:ring-1 focus:ring-[#1F85F5] sm:text-sm bg-gray-50/30 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500"
                    placeholder={
                      selectedEmploymentType === 'PartTime' ? '28' : '48'
                    }
                  />
                </div>
                {errors.workingHoursPerWeek && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.workingHoursPerWeek.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">
                  Expected Monthly Salary (VND){' '}
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 text-sm font-semibold">
                    ₫
                  </div>
                  <input
                    type="number"
                    {...register('expectedMonthlySalary', {
                      required: 'Expected salary is required',
                      min: { value: 0, message: 'Salary cannot be negative' },
                    })}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1F85F5] focus:ring-1 focus:ring-[#1F85F5] sm:text-sm bg-gray-50/30 transition-all"
                    placeholder={String(suggestedSalary)}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Suggested by mode + experience:{' '}
                  <span className="font-semibold text-gray-700">
                    {suggestedSalary.toLocaleString('vi-VN')} VND
                  </span>
                </p>
                {errors.expectedMonthlySalary && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.expectedMonthlySalary.message}
                  </p>
                )}
              </div>

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

              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Degrees <span className="text-red-500">*</span>
                  </h3>
                  <button
                    type="button"
                    data-testid="add-degree"
                    onClick={() => appendDegree(createDefaultDegree())}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-[#1F85F5] hover:text-[#156ed0]"
                  >
                    <Plus className="h-4 w-4" /> Add Degree
                  </button>
                </div>

                {degreeFields.map((field, index) => (
                  <div
                    key={field.id}
                    data-testid={`degree-item-${index}`}
                    className="p-4 rounded-lg border border-gray-200 bg-gray-50/40 space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-semibold text-gray-600">
                        Degree #{index + 1}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          if (degreeFields.length > 1) removeDegree(index);
                        }}
                        className="p-1 text-red-500 hover:bg-red-100 rounded-full disabled:opacity-40"
                        disabled={degreeFields.length === 1}
                        aria-label="Remove degree"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <input
                      type="text"
                      {...register(`degrees.${index}.name`, {
                        required: 'Degree name is required',
                      })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="Degree name"
                    />
                    {errors.degrees?.[index]?.name && (
                      <p className="text-xs text-red-500">
                        {errors.degrees[index]?.name?.message}
                      </p>
                    )}

                    <input
                      type="text"
                      {...register(`degrees.${index}.issuingAuthority`)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="Issuing authority (optional)"
                    />

                    <div>
                      <label className="text-xs text-gray-600">
                        Issued date
                      </label>
                      <input
                        type="date"
                        {...register(`degrees.${index}.issuedDate`, {
                          required: 'Issued date is required',
                        })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      {errors.degrees?.[index]?.issuedDate && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.degrees[index]?.issuedDate?.message}
                        </p>
                      )}
                    </div>

                    {!degrees[index]?.file ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-[#1F85F5] hover:bg-blue-50/30 transition-all">
                        <input
                          type="file"
                          id={`degree-upload-${field.id}`}
                          data-testid={`degree-file-${index}`}
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) =>
                            handleCredentialFileChange(
                              'degrees',
                              index,
                              e.target.files?.[0]
                            )
                          }
                          className="hidden"
                        />
                        <label
                          htmlFor={`degree-upload-${field.id}`}
                          className="cursor-pointer flex flex-col items-center"
                        >
                          <Upload className="h-5 w-5 text-[#00d1c0] mb-1" />
                          <p className="text-xs font-medium text-gray-700">
                            Upload degree file
                          </p>
                        </label>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <FileText className="h-5 w-5 text-[#00d1c0] flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-700 truncate">
                              {degrees[index]?.file?.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {degrees[index]?.file
                                ? `${(degrees[index].file!.size / 1024 / 1024).toFixed(2)} MB`
                                : ''}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            handleCredentialFileChange('degrees', index)
                          }
                          className="ml-2 p-1 hover:bg-red-100 rounded-full transition-colors"
                          aria-label="Remove uploaded degree file"
                        >
                          <X className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </section>

              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Licenses / Certificates{' '}
                    <span className="text-red-500">*</span>
                  </h3>
                  <button
                    type="button"
                    data-testid="add-certificate"
                    onClick={() =>
                      appendCertificate(createDefaultCertificate())
                    }
                    className="inline-flex items-center gap-2 text-xs font-semibold text-[#1F85F5] hover:text-[#156ed0]"
                  >
                    <Plus className="h-4 w-4" /> Add Certificate
                  </button>
                </div>

                {certificateFields.map((field, index) => (
                  <div
                    key={field.id}
                    data-testid={`certificate-item-${index}`}
                    className="p-4 rounded-lg border border-gray-200 bg-gray-50/40 space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-semibold text-gray-600">
                        Certificate #{index + 1}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          if (certificateFields.length > 1)
                            removeCertificate(index);
                        }}
                        className="p-1 text-red-500 hover:bg-red-100 rounded-full disabled:opacity-40"
                        disabled={certificateFields.length === 1}
                        aria-label="Remove certificate"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <input
                      type="text"
                      {...register(`certificates.${index}.name`, {
                        required: 'Certificate name is required',
                      })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="Certificate/license name"
                    />
                    {errors.certificates?.[index]?.name && (
                      <p className="text-xs text-red-500">
                        {errors.certificates[index]?.name?.message}
                      </p>
                    )}

                    <input
                      type="text"
                      {...register(`certificates.${index}.issuingAuthority`)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="Issuing authority (optional)"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-600">
                          Issued date
                        </label>
                        <input
                          type="date"
                          {...register(`certificates.${index}.issuedDate`, {
                            required: 'Issued date is required',
                          })}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        {errors.certificates?.[index]?.issuedDate && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors.certificates[index]?.issuedDate?.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="text-xs text-gray-600">
                          Expiry date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          {...register(`certificates.${index}.expiryDate`, {
                            required: 'Expiry date is required',
                            validate: (value) => {
                              if (!value) return 'Expiry date is required';

                              const issuedDate = getValues(
                                `certificates.${index}.issuedDate`
                              );
                              if (
                                issuedDate &&
                                new Date(`${value}T00:00:00.000Z`) <=
                                  new Date(`${issuedDate}T00:00:00.000Z`)
                              ) {
                                return 'Expiry date must be later than issued date';
                              }

                              return true;
                            },
                          })}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        {errors.certificates?.[index]?.expiryDate && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors.certificates[index]?.expiryDate?.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {!certificates[index]?.file ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-[#1F85F5] hover:bg-blue-50/30 transition-all">
                        <input
                          type="file"
                          id={`certificate-upload-${field.id}`}
                          data-testid={`certificate-file-${index}`}
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) =>
                            handleCredentialFileChange(
                              'certificates',
                              index,
                              e.target.files?.[0]
                            )
                          }
                          className="hidden"
                        />
                        <label
                          htmlFor={`certificate-upload-${field.id}`}
                          className="cursor-pointer flex flex-col items-center"
                        >
                          <Upload className="h-5 w-5 text-[#00d1c0] mb-1" />
                          <p className="text-xs font-medium text-gray-700">
                            Upload certificate/license file
                          </p>
                        </label>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <FileText className="h-5 w-5 text-[#00d1c0] flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-700 truncate">
                              {certificates[index]?.file?.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {certificates[index]?.file
                                ? `${(certificates[index].file!.size / 1024 / 1024).toFixed(2)} MB`
                                : ''}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            handleCredentialFileChange('certificates', index)
                          }
                          className="ml-2 p-1 hover:bg-red-100 rounded-full transition-colors"
                          aria-label="Remove uploaded certificate file"
                        >
                          <X className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </section>

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
                      credentials and selected working mode before assigning the
                      matching full-time/part-time contract template.
                    </p>
                  </div>
                </div>
              </div>

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
