import ConsultationsChatView from './ConsultationsChatView';
import { DoctorSidebar, DoctorHeader } from '../components';
import { useConsultationSessions } from '@/features/consultation/hooks';
import useAuthStore from '@/store/auth-store';
import {
  SessionStatus,
  type ConsultationSessionListDto,
} from '@/types/consultation';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';

export default function ConsultationsPage() {
  const { t } = useSafeTranslation();
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
        <DoctorHeader
          pageName={t('Ophthalmologist.consultations.title', 'Consultations')}
        />

        {/* Page Content */}
        <main className="p-6">
          <ConsultationsChatView
            sessions={sessions}
            sessionsLoading={sessionsLoading}
          />
        </main>
      </div>
    </div>
  );
}
