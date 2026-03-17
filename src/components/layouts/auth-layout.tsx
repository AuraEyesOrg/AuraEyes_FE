import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-white shadow-lg mb-4 border border-gray-100 overflow-hidden p-2">
            <img
              src="/logo.png"
              alt="AURA Logo"
              className="h-full w-full object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">AURA</h1>
          <p className="text-gray-500 text-sm mt-1">
            Retinal Health Screening System
          </p>
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
