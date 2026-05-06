import { useMemo } from 'react';
import ConsultationsChatView from './ConsultationsChatView';
import { DoctorSidebar, DoctorHeader } from '../components';
import { useConsultationSessions } from '@/features/consultation/hooks';
import useAuthStore from '@/store/auth-store';
import {
  SessionStatus,
  type ConsultationSessionListDto,
} from '@/types/consultation';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import { useSearchParams } from 'react-router-dom';

export default function ConsultationsPage() {
  const { t } = useSafeTranslation();
  const { user } = useAuthStore();
  const currentDoctorId = user?.roleId ?? '';
  const [searchParams] = useSearchParams();
  const patientIdFilter = searchParams.get('patientId') ?? undefined;
  const { data: sessionsData, isLoading: sessionsLoading } =
    useConsultationSessions(
      {
        ophthalmologistId: currentDoctorId || undefined,
        pageSize: 50,
        patientId: patientIdFilter || undefined,
      },
      { enabled: !!currentDoctorId }
    );

  const sessions = useMemo<ConsultationSessionListDto[]>(
    () => sessionsData?.items ?? [],
    [sessionsData]
  );

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
          pageName={t(
            'Ophthalmologist.consultations.title',
            'Post-consultations'
          )}
        />

        {/* Page Content */}
        <main className="p-6">
          {/* <div className="mb-5 rounded-2xl border border-cyan-100 bg-cyan-50/80 p-4 text-sm text-cyan-900 dark:border-cyan-800/60 dark:bg-cyan-900/20 dark:text-cyan-200">
            {t(
              'Ophthalmologist.consultations.aftercareHint',
              'Use this space after you verify a screening report to continue patient follow-up. Incoming clinic queue cases should be reviewed from Screenings first.'
            )}
          </div> */}
          <ConsultationsChatView
            sessions={sessions}
            sessionsLoading={sessionsLoading}
          />
        </main>
      </div>
    </div>
  );
}
