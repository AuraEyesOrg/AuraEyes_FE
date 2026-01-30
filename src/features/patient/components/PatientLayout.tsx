import { ReactNode } from 'react';
import PatientSidebar from './PatientSidebar';
import PatientHeader from './PatientHeader';

interface PatientLayoutProps {
  children: ReactNode;
  userName?: string;
  avatarUrl?: string;
  notificationCount?: number;
  unreadMessages?: number;
}

export default function PatientLayout({
  children,
  userName = 'Patient',
  avatarUrl,
  notificationCount = 0,
  unreadMessages = 0,
}: PatientLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0a1929]">
      <PatientSidebar
        notificationCount={notificationCount}
        unreadMessages={unreadMessages}
      />

      <div className="ml-56">
        <PatientHeader userName={userName} avatarUrl={avatarUrl} />

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
