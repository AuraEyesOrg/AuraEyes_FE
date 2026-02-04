import { ReactNode } from 'react';
import PatientSidebar from './PatientSidebar';

interface PatientLayoutProps {
  children: ReactNode;
  userName?: string;
  avatarUrl?: string;
  userId?: string;
}

export default function PatientLayout({
  children,
  userName = 'Alex Morgan',
  avatarUrl,
  userId = '#8823-X',
}: PatientLayoutProps) {
  return (
    <div className="flex h-screen w-full bg-[var(--bg-primary)]">
      <PatientSidebar
        userName={userName}
        userAvatar={avatarUrl}
        userId={userId}
      />

      <main className="flex-1 h-full overflow-y-auto relative">
        <div className="p-6 lg:p-10">{children}</div>
      </main>
    </div>
  );
}
