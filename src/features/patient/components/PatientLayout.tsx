import { ReactNode } from 'react';
import PatientSidebar from './PatientSidebar';

interface PatientLayoutProps {
  children: ReactNode;
}

export default function PatientLayout({ children }: PatientLayoutProps) {
  return (
    <div className="flex h-screen w-full bg-[var(--bg-primary)]">
      <PatientSidebar />

      <main className="flex-1 h-full overflow-y-auto relative">
        <div className="p-6 lg:p-10">{children}</div>
      </main>
    </div>
  );
}
