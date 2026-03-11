import { ReactNode } from 'react';
import PatientSidebar from './PatientSidebar';
import PatientHeader from './PatientHeader';

interface PatientLayoutProps {
  children: ReactNode;
}

export default function PatientLayout({ children }: PatientLayoutProps) {
  return (
    <div className="flex h-screen w-full bg-[var(--bg-primary)]">
      <PatientSidebar />

      <div className="flex-1 h-full overflow-y-auto relative">
        <PatientHeader />
        <main className="p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
