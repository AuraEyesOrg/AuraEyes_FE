import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '@/components/layouts';
import { useForm } from 'react-hook-form';
import { User, Mail, Lock, CheckCircle, ArrowRight } from 'lucide-react';

const RegisterPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data: any) => {
    console.log(data);
    // TODO: Implement registration logic
  };

  return (
    <AuthLayout>
      <div className="mb-8 text-center sm:text-left">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Create an Account
        </h2>
        <p className="text-gray-500 text-sm">
          Join AURA to start monitoring your retinal health securely.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Full Name */}
        <div className="space-y-1">
          <label className="block text-sm font-semibold text-gray-700">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <User className="h-5 w-5" />
            </div>
            <input
              {...register('fullName', { required: true })}
              type="text"
              placeholder="Enter your full name"
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-gray-900 placeholder-gray-400 sm:text-sm"
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="block text-sm font-semibold text-gray-700">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Mail className="h-5 w-5" />
            </div>
            <input
              {...register('email', { required: true })}
              type="email"
              placeholder="Enter your email"
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-gray-900 placeholder-gray-400 sm:text-sm"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label className="block text-sm font-semibold text-gray-700">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Lock className="h-5 w-5" />
            </div>
            <input
              {...register('password', { required: true })}
              type="password"
              placeholder="Create a password"
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-gray-900 placeholder-gray-400 sm:text-sm"
            />
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-1">
          <label className="block text-sm font-semibold text-gray-700">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <CheckCircle className="h-5 w-5" />
            </div>
            <input
              {...register('confirmPassword', { required: true })}
              type="password"
              placeholder="Confirm your password"
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-gray-900 placeholder-gray-400 sm:text-sm"
            />
          </div>
        </div>

        {/* Terms Checkbox */}
        <div className="flex items-start gap-3">
          <div className="flex h-5 items-center">
            <input
              id="register-terms"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              {...register('terms', { required: true })}
            />
          </div>
          <label htmlFor="register-terms" className="text-xs text-gray-600">
            I agree to the{' '}
            <a href="#" className="font-medium text-primary hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="font-medium text-primary hover:underline">
              Privacy Policy
            </a>
            .
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-background-dark font-semibold py-3 px-4 rounded-xl transition-all shadow-[0_4px_14px_0_rgba(19,236,236,0.39)] hover:shadow-[0_6px_20px_rgba(19,236,236,0.23)] hover:-translate-y-0.5"
        >
          Create Account
          <ArrowRight className="h-4 w-4" />
        </button>

        {/* Footer */}
        <div className="text-center">
          <span className="text-sm text-gray-500">
            Already have an account?{' '}
          </span>
          <Link
            to="/login"
            className="text-sm font-semibold text-primary hover:underline"
          >
            Log In
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;
