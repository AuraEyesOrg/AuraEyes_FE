import { type ReactNode } from 'react';
import ClinicStaffSidebar from './ClinicStaffSidebar';
import ClinicStaffHeader from './ClinicStaffHeader';

interface ClinicStaffLayoutProps {
  children: ReactNode;
}

/**
 * Root layout for ClinicStaff portal.
 * Sidebar + header + main content — mirrors PatientLayout.
 */
export default function ClinicStaffLayout({
  children,
}: ClinicStaffLayoutProps) {
  return (
    <div className="flex h-screen w-full bg-[var(--bg-primary)]">
      <ClinicStaffSidebar />

      <div className="flex-1 h-full overflow-y-auto relative">
        <ClinicStaffHeader />
        <main className="p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
