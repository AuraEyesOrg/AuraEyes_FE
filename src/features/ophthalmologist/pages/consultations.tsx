import ConsultationsChatView from './ConsultationsChatView';
import { DoctorSidebar, DoctorHeader } from '../components';
import { useConsultationSessions } from '@/features/consultation/hooks';
import useAuthStore from '@/store/auth-store';
import {
  SessionStatus,
  type ConsultationSessionListDto,
} from '@/types/consultation';

export default function ConsultationsPage() {
  const { user } = useAuthStore();
  const currentDoctorId = user?.roleId ?? '';
  const { data: sessionsData, isLoading: sessionsLoading } =
    useConsultationSessions(
      {
        ophthalmologistId: currentDoctorId || undefined,
        pageSize: 50,
      },
      { enabled: !!currentDoctorId }
    );

  const sessions: ConsultationSessionListDto[] = sessionsData?.items ?? [];

  const pendingCount = sessions.filter(
    (s) => s.status === SessionStatus.Pending
  ).length;
  return (
    <div className="flex h-screen w-full bg-(--bg-primary)">
      {/* Sidebar */}
      <DoctorSidebar pendingCount={pendingCount} />

      {/* Main Content */}
      <div className="flex-1 h-full overflow-y-auto">
        {/* Header */}
        <DoctorHeader />

        {/* Page Content */}
        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Consultations
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage consultation requests and chat with patients
            </p>
          </div>

          <ConsultationsChatView
            sessions={sessions}
            sessionsLoading={sessionsLoading}
          />
        </main>
      </div>
    </div>
  );
}
