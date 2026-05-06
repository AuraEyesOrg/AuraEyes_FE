import React from 'react';
import { useTranslation } from 'react-i18next';
import { Users, ArrowRight, Bell } from 'lucide-react';
import useNotificationStore from '@/store/useNotificationStore';
import { router } from '@/lib/router';
import { getNotificationRoute } from '@/types/notification';
import useAuthStore from '@/store/auth-store';

export const ConsiliumInvitationOverlay: React.FC = () => {
  const { t } = useTranslation();
  const { urgentInvitation, setUrgentInvitation } = useNotificationStore();

  const { user } = useAuthStore();

  if (!urgentInvitation) return null;

  const handleJoin = () => {
    // Navigate to collaboration page with specific groupId
    const route = getNotificationRoute(urgentInvitation, user?.roles || []);
    router.navigate(route);
    setUrgentInvitation(null);
  };

  const handleDismiss = () => {
    setUrgentInvitation(null);
  };

  const sanitizedMessage = (urgentInvitation.message || '')
    .replace(/Xem Bệnh án:\s*\/medical-records\/[0-9a-f-]+\s*/gi, '')
    .replace(/\/medical-records\/[0-9a-f-]+\s*/gi, '')
    .replace(
      /Xem Review Hội chẩn:\s*\/(?:screenings|screening-review)\/[0-9a-f-]+\s*/gi,
      'Xem Review Hội chẩn'
    )
    .replace(/\s{2,}/g, ' ')
    .trim();

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="relative p-6">
          {/* Header with Pulse Effect */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-500 rounded-2xl blur-lg opacity-40 animate-pulse"></div>
              <div className="relative w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center text-white">
                <Users className="w-7 h-7" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 border-2 border-white dark:border-slate-800 rounded-full flex items-center justify-center">
                <Bell className="w-3 h-3 text-white animate-bounce" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                {t(
                  'ProfessionalNetwork.collaboration.consilium.urgentTitle',
                  'Yêu cầu Hội chẩn Hỏa tốc'
                )}
              </h3>
              <p className="text-amber-600 dark:text-amber-400 font-medium text-sm flex items-center gap-1.5 mt-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                {t(
                  'ProfessionalNetwork.collaboration.consilium.urgentSubtitle',
                  'Phản hồi trong vòng 30 phút'
                )}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-4 mb-8">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50">
              <p className="text-slate-600 dark:text-slate-300 text-sm italic line-clamp-3">
                "{sanitizedMessage}"
              </p>
            </div>

            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
              <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-md font-medium capitalize">
                {urgentInvitation.title}
              </span>
              <span>•</span>
              <span>
                {new Date(urgentInvitation.createdAt).toLocaleTimeString()}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleDismiss}
              className="flex-1 h-12 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all active:scale-95"
            >
              {t('common.dismiss', 'Bỏ qua')}
            </button>
            <button
              onClick={handleJoin}
              className="flex-[1.5] h-12 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:translate-y-[-2px] active:scale-95"
            >
              {t('common.joinNow', 'Tham gia ngay')}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Top bar indicator */}
        <div className="h-1.5 w-full bg-amber-500/20">
          <div className="h-full bg-amber-500 animate-[progress_1800s_linear_forwards]"></div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `,
        }}
      />
    </div>
  );
};
