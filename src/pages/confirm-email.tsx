import { Link } from 'react-router-dom';
import { AuthLayout } from '@/components/layouts';
import { useForm } from 'react-hook-form';
import { Mail, CheckCircle, ArrowRight, RefreshCw } from 'lucide-react';

const ConfirmEmailPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data: any) => {
    console.log(data);
    // TODO: Implement verification logic
  };

  return (
    <AuthLayout>
      <div className="mb-8 text-center sm:text-left">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-4">
          <Mail className="h-6 w-6" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Check your inbox
        </h2>
        <p className="text-gray-500 text-sm">
          We've sent a 6-digit verification code to your email address. Please
          enter it below to confirm your account.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Verification Code */}
        <div className="space-y-1">
          <label className="block text-sm font-semibold text-gray-700">
            Verification Code
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <CheckCircle className="h-5 w-5" />
            </div>
            <input
              {...register('code', {
                required: true,
                minLength: 6,
                maxLength: 6,
              })}
              type="text"
              placeholder="Ex: 123456"
              className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-gray-900 placeholder-gray-400 tracking-widest text-lg font-mono sm:text-sm"
              maxLength={6}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Enter the 6-digit code sent to your email.
          </p>
        </div>

        {/* Verify Button */}
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-background-dark font-semibold py-3 px-4 rounded-xl transition-all shadow-[0_4px_14px_0_rgba(19,236,236,0.39)] hover:shadow-[0_6px_20px_rgba(19,236,236,0.23)] hover:-translate-y-0.5"
        >
          Verify Email
          <ArrowRight className="h-4 w-4" />
        </button>

        {/* Resend Link */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Didn't receive the code?{' '}
            <button
              type="button"
              className="inline-flex items-center gap-1 font-semibold text-primary hover:underline bg-transparent border-0 cursor-pointer p-0"
            >
              <RefreshCw className="h-3 w-3" />
              Resend Code
            </button>
          </p>
        </div>

        <div className="text-center border-t border-gray-100 pt-6 mt-6">
          <Link
            to="/login"
            className="text-sm text-gray-500 hover:text-gray-900 flex items-center justify-center gap-2"
          >
            ← Back to Login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ConfirmEmailPage;
