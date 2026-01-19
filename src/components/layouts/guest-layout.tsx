import { ReactNode } from 'react';
import { GuestNavbar } from '@/components/ui/navbar';

interface GuestLayoutProps {
  children: ReactNode;
}

const GuestLayout = ({ children }: GuestLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <GuestNavbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default GuestLayout;
