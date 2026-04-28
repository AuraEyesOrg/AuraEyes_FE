import { ReactNode } from 'react';
import { AuraLogo } from '../ui/aura-logo';

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8 flex flex-col items-center">
          <AuraLogo size="lg" subtitle="Retinal Health Screening System" />
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {children}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          © 2026 AURA. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;
