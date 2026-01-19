import { Link } from 'react-router-dom';
import { AuthLayout } from '@/components/layouts';
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
  Building2,
  Calendar,
  Award,
} from 'lucide-react';
import { useState } from 'react';

interface DoctorFormData {
  fullName: string;
  email: string;
  phone: string;
  specialization: string;
  licenseNumber: string;
  yearsOfExperience: string;
  hospital: string;
  description: string;
}

const RegisterDoctorPage = () => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DoctorFormData>();

  const onSubmit = (data: DoctorFormData) => {
    console.log('Form Data:', data);
    console.log('Uploaded Files:', uploadedFiles);
    // TODO: Implement doctor registration logic
    setIsSubmitted(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setUploadedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  if (isSubmitted) {
    return (
      <AuthLayout>
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Application Submitted!
          </h2>
          <p className="text-gray-600 mb-2">
            Thank you for registering with AURA Healthcare Network.
          </p>
          <p className="text-gray-600 mb-6">
            Our team will review your application and credentials. You will
            receive your account details via email within 2-3 business days.
          </p>
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 mb-6">
            <p className="text-sm text-blue-800">
              📧 Please check your email <strong>{}</strong> for updates on your
              application status.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
          >
            Back to Home
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="mb-6 text-center">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-accent text-white mb-3">
          <Stethoscope className="h-6 w-6" />
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
          Doctor Registration
        </h2>
        <p className="text-gray-600 text-sm">Join AURA Healthcare Network</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              {...register('fullName', {
                required: 'Full name is required',
                minLength: {
                  value: 3,
                  message: 'Name must be at least 3 characters',
                },
              })}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 outline-none hover:border-gray-300"
              placeholder="Dr. John Smith"
            />
          </div>
          {errors.fullName && (
            <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
              <span className="text-xs">⚠️</span>
              {errors.fullName.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 outline-none hover:border-gray-300"
              placeholder="doctor@hospital.com"
            />
          </div>
          {errors.email && (
            <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
              <span className="text-xs">⚠️</span>
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="tel"
              {...register('phone', {
                required: 'Phone number is required',
                pattern: {
                  value: /^[0-9+\-\s()]+$/,
                  message: 'Invalid phone number',
                },
              })}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 outline-none hover:border-gray-300"
              placeholder="+84 123 456 789"
            />
          </div>
          {errors.phone && (
            <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
              <span className="text-xs">⚠️</span>
              {errors.phone.message}
            </p>
          )}
        </div>

        {/* Specialization */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Specialization <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Award className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              {...register('specialization', {
                required: 'Specialization is required',
              })}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 outline-none hover:border-gray-300 appearance-none"
            >
              <option value="">Select your specialization</option>
              <option value="ophthalmologist">Ophthalmologist</option>
              <option value="retina-specialist">Retina Specialist</option>
              <option value="general-practitioner">General Practitioner</option>
              <option value="optometrist">Optometrist</option>
              <option value="other">Other</option>
            </select>
          </div>
          {errors.specialization && (
            <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
              <span className="text-xs">⚠️</span>
              {errors.specialization.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* License Number */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              License Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('licenseNumber', {
                required: 'License number is required',
              })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 outline-none hover:border-gray-300"
              placeholder="MD-12345"
            />
            {errors.licenseNumber && (
              <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                <span className="text-xs">⚠️</span>
                {errors.licenseNumber.message}
              </p>
            )}
          </div>

          {/* Years of Experience */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Experience (years) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="number"
                {...register('yearsOfExperience', {
                  required: 'Experience is required',
                  min: { value: 0, message: 'Invalid experience' },
                })}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 outline-none hover:border-gray-300"
                placeholder="5"
              />
            </div>
            {errors.yearsOfExperience && (
              <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                <span className="text-xs">⚠️</span>
                {errors.yearsOfExperience.message}
              </p>
            )}
          </div>
        </div>

        {/* Hospital/Clinic */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Hospital/Clinic <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              {...register('hospital', {
                required: 'Hospital/Clinic name is required',
              })}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 outline-none hover:border-gray-300"
              placeholder="City General Hospital"
            />
          </div>
          {errors.hospital && (
            <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
              <span className="text-xs">⚠️</span>
              {errors.hospital.message}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Brief Description (Optional)
          </label>
          <textarea
            {...register('description')}
            rows={3}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 outline-none hover:border-gray-300 resize-none"
            placeholder="Brief introduction about yourself and your expertise..."
          />
        </div>

        {/* File Upload Section */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Upload Credentials <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Please upload your medical license, certificates, or other relevant
            documents (PDF, JPG, PNG - Max 10MB each)
          </p>

          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary hover:bg-primary/5 transition-all duration-200 cursor-pointer">
            <input
              type="file"
              id="fileUpload"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              className="hidden"
            />
            <label
              htmlFor="fileUpload"
              className="cursor-pointer flex flex-col items-center"
            >
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                PDF, JPG, PNG up to 10MB each
              </p>
            </label>
          </div>

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="ml-2 p-1 hover:bg-red-100 rounded-full transition-colors"
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Banner */}
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="h-6 w-6 rounded-full bg-blue-200 flex items-center justify-center">
                <span className="text-blue-700 text-sm font-bold">ℹ</span>
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-blue-900 mb-1">
                Account Creation Process
              </h4>
              <p className="text-xs text-blue-700">
                After submitting your application, our verification team will
                review your credentials. Once approved, you'll receive your
                login credentials via email within 2-3 business days.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={uploadedFiles.length === 0}
          className="w-full bg-gradient-to-r from-primary to-accent text-white py-3.5 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
        >
          Submit Application
        </button>
      </form>

      {/* Back Link */}
      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link
          to="/"
          className="font-semibold text-primary hover:text-accent transition-colors"
        >
          Sign in here
        </Link>
      </p>
    </AuthLayout>
  );
};

export default RegisterDoctorPage;
