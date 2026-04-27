import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Moon,
  Sun,
  Award,
  ChevronRight,
  Edit3,
  Key,
  CheckCircle,
  Lock,
  Globe,
  X,
} from 'lucide-react';
import {
  DoctorSidebar,
  DoctorHeader,
  UploadCredentialsModal,
} from '../components';
import { useTheme } from '@/contexts/ThemeContext';
import { api } from '@/lib/api';
import useAuthStore from '@/store/auth-store';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import {
  type AppLocale,
  DEFAULT_LOCALE,
  getLocaleFromPathname,
  withLocalePathname,
} from '@/i18n/locales';
import { persistLocale } from '@/i18n/middleware';
import { ophthalToast } from '@/features/ophthalmologist/lib/ophthal-toast';
import { getTwoFactorStatus } from '@/features/auth/api/two-factor.api';
import { useChangePassword } from '@/features/patient/hooks/useProfile';
import {
  changePasswordSchema,
  type ChangePasswordFormData,
} from '@/features/patient/schemas/profile.schema';

interface OphthalmologistProfileApi {
  id: string;
}

export default function SettingsPage() {
  const { t } = useSafeTranslation();
  const { i18n } = useTranslation();

  const location = useLocation();
  const navigate = useNavigate();
  const locale = getLocaleFromPathname(location.pathname) ?? DEFAULT_LOCALE;
  const toLocalizedPath = (pathname: string): string =>
    withLocalePathname(locale, pathname);
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuthStore();
  const [showUploadCredentialsModal, setShowUploadCredentialsModal] =
    useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const changePasswordMutation = useChangePassword();
  const {
    register: registerChangePassword,
    handleSubmit: handleChangePasswordSubmit,
    reset: resetChangePassword,
    formState: { errors: changePasswordErrors },
  } = useForm<ChangePasswordFormData>({
    resolver: yupResolver(changePasswordSchema),
  });

  const profileQuery = useQuery({
    queryKey: ['ophthalmologist', 'me', 'profile'],
    queryFn: async () => {
      const response = await api.get<{
        data: { data: OphthalmologistProfileApi };
      }>('/ophthalmologist/profile');
      return response.data.data;
    },
  });

  const profileId = profileQuery.data?.id ?? user?.roleId ?? user?.id ?? '';

  const securityStatusQuery = useQuery({
    queryKey: ['auth', 'two-factor', 'status'],
    queryFn: getTwoFactorStatus,
    staleTime: 60 * 1000,
    retry: 1,
    enabled: Boolean(user?.id),
  });

  const securityHintLabel = useMemo(() => {
    if (securityStatusQuery.isLoading || securityStatusQuery.isFetching) {
      return t(
        'Ophthalmologist.settings.accountSettings.securityHintChecking',
        'Checking 2FA status...'
      );
    }

    if (securityStatusQuery.data?.isEnabled === true) {
      return t(
        'Ophthalmologist.settings.accountSettings.securityHintEnabled',
        '2FA is enabled. Manage password and recovery codes'
      );
    }

    if (securityStatusQuery.data?.isEnabled === false) {
      return t(
        'Ophthalmologist.settings.accountSettings.securityHintDisabled',
        '2FA is off. Set up protection now'
      );
    }

    return t(
      'Ophthalmologist.settings.accountSettings.securityHint',
      'Reset password & 2FA'
    );
  }, [
    securityStatusQuery.data?.isEnabled,
    securityStatusQuery.isFetching,
    securityStatusQuery.isLoading,
    t,
  ]);

  const closeChangePasswordModal = () => {
    setShowChangePasswordModal(false);
    resetChangePassword();
    changePasswordMutation.reset();
  };

  const onChangePasswordSubmit = (data: ChangePasswordFormData) => {
    changePasswordMutation.mutate(data, {
      onSuccess: () => {
        closeChangePasswordModal();
        ophthalToast.success(
          t(
            'Ophthalmologist.settings.accountSettings.passwordChanged',
            'Password changed successfully.'
          )
        );
      },
      onError: (error: unknown) => {
        const err = error as {
          message?: string;
          response?: { data?: { message?: string; errors?: string[] } };
        };

        ophthalToast.error(
          err.response?.data?.message ||
            err.response?.data?.errors?.join(', ') ||
            err.message ||
            t(
              'Ophthalmologist.settings.accountSettings.passwordChangeFailed',
              'Unable to change password right now. Please try again.'
            )
        );
      },
    });
  };

  const handleLanguageChange = (nextLocale: AppLocale) => {
    if (nextLocale === locale) return;

    persistLocale(nextLocale);
    void i18n.changeLanguage(nextLocale);

    const localizedPath = withLocalePathname(nextLocale, location.pathname);
    navigate(`${localizedPath}${location.search}${location.hash}`);
  };

  return (
    <div className="flex h-screen w-full bg-(--bg-primary)">
      <DoctorSidebar pendingCount={0} />

      <div className="flex-1 h-full overflow-y-auto">
        <DoctorHeader
          pageName={t('Ophthalmologist.settings.pageTitle', 'Settings')}
        />

        <main className="p-6">
          <div className="mx-auto max-w-2xl">
            <div className="mb-8">
              <h1 className="mb-2 text-3xl font-bold text-[var(--text-primary)]">
                {t('Ophthalmologist.settings.pageTitle', 'Settings')}
              </h1>
              <p className="text-[var(--text-secondary)]">
                {t(
                  'Ophthalmologist.settings.pageSubtitle',
                  'Manage your account settings and preferences'
                )}
              </p>
            </div>

            <div className="space-y-6">
              {/* Account */}
              <div className="medical-card">
                <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">
                  {t('Ophthalmologist.settings.groups.account', 'Account')}
                </h2>
                <div className="space-y-3">
                  {/* Profile row */}
                  <Link
                    to={toLocalizedPath('/ophthalmologist/profile')}
                    className="group flex items-center justify-between rounded-xl border border-transparent bg-[var(--bg-secondary)] p-4 transition hover:border-[var(--border-color)] hover:bg-[var(--bg-tertiary)]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand transition group-hover:bg-brand/20">
                        <Edit3 className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">
                          {t(
                            'Ophthalmologist.settings.profile.title',
                            'Profile Information'
                          )}
                        </p>
                        <p className="text-sm text-[var(--text-secondary)]">
                          {t(
                            'Ophthalmologist.settings.profile.description',
                            'Manage personal information and upload avatar'
                          )}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-[var(--text-muted)] transition group-hover:text-brand" />
                  </Link>

                  {/* Credentials row */}
                  <button
                    type="button"
                    onClick={() => setShowUploadCredentialsModal(true)}
                    className="group flex w-full items-center justify-between rounded-xl border border-transparent bg-[var(--bg-secondary)] p-4 transition hover:border-[var(--border-color)] hover:bg-[var(--bg-tertiary)]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand transition group-hover:bg-brand/20">
                        <Award className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-[var(--text-primary)]">
                          {t(
                            'Ophthalmologist.settings.credentials.title',
                            'Medical Credentials'
                          )}
                        </p>
                        <p className="text-sm text-[var(--text-secondary)]">
                          {t(
                            'Ophthalmologist.settings.credentials.description',
                            'Upload and manage your degrees and licenses'
                          )}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-[var(--text-muted)] transition group-hover:text-brand" />
                  </button>

                  {/* Security row */}
                  <Link
                    to={toLocalizedPath('/ophthalmologist/security')}
                    className="group flex items-center justify-between rounded-xl border border-transparent bg-[var(--bg-secondary)] p-4 transition hover:border-[var(--border-color)] hover:bg-[var(--bg-tertiary)]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand transition group-hover:bg-brand/20">
                        <Lock className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">
                          {t(
                            'Ophthalmologist.settings.accountSettings.security',
                            'Security'
                          )}
                        </p>
                        <p className="text-sm text-[var(--text-secondary)]">
                          {securityHintLabel}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-[var(--text-muted)] transition group-hover:text-brand" />
                  </Link>

                  {/* Change password row */}
                  <button
                    type="button"
                    onClick={() => setShowChangePasswordModal(true)}
                    className="group flex w-full items-center justify-between rounded-xl border border-transparent bg-[var(--bg-secondary)] p-4 transition hover:border-[var(--border-color)] hover:bg-[var(--bg-tertiary)]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand transition group-hover:bg-brand/20">
                        <Key className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-[var(--text-primary)]">
                          {t(
                            'Ophthalmologist.settings.accountSettings.resetPassword',
                            'Reset Password'
                          )}
                        </p>
                        <p className="text-sm text-[var(--text-secondary)]">
                          {t(
                            'Ophthalmologist.settings.accountSettings.resetPasswordHint',
                            'Update your current password'
                          )}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-[var(--text-muted)] transition group-hover:text-brand" />
                  </button>
                </div>
              </div>

              {/* Appearance */}
              <div className="medical-card">
                <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">
                  {t('Ophthalmologist.settings.appearance.title', 'Appearance')}
                </h2>
                <div className="flex items-center justify-between rounded-xl bg-[var(--bg-secondary)] p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
                      {theme === 'dark' ? (
                        <Moon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      ) : (
                        <Sun className="h-5 w-5 text-yellow-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">
                        {t(
                          'Ophthalmologist.settings.appearance.darkMode',
                          'Dark Mode'
                        )}
                      </p>
                      <p className="text-sm text-[var(--text-secondary)]">
                        {theme === 'dark'
                          ? t(
                              'Ophthalmologist.settings.appearance.currentlyOn',
                              'Currently on'
                            )
                          : t(
                              'Ophthalmologist.settings.appearance.currentlyOff',
                              'Currently off'
                            )}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className={`relative h-6 w-12 rounded-full transition-colors ${
                      theme === 'dark'
                        ? 'bg-brand'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                    aria-label={t(
                      'Ophthalmologist.settings.appearance.toggle',
                      'Toggle theme'
                    )}
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                        theme === 'dark' ? 'left-7' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Language */}
              <div className="medical-card">
                <h2 className="mb-1 text-lg font-semibold text-[var(--text-primary)]">
                  {t(
                    'Ophthalmologist.settings.accountSettings.language',
                    'Language'
                  )}
                </h2>
                <p className="mb-4 text-sm text-[var(--text-secondary)]">
                  {t(
                    'Ophthalmologist.settings.language.subtitle',
                    'Choose your preferred language for the portal'
                  )}
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft">
                    <Globe className="h-5 w-5 text-brand" />
                  </div>
                  <div className="flex flex-1 gap-3 overflow-x-auto pb-2">
                    {(
                      [
                        {
                          code: 'vi' as AppLocale,
                          flag: '🇻🇳',
                          nativeLabel: 'Tiếng Việt',
                          label: 'Vietnamese',
                        },
                        {
                          code: 'en' as AppLocale,
                          flag: '🇺🇸',
                          nativeLabel: 'English',
                          label: 'English (US)',
                        },
                      ] as const
                    ).map((opt) => {
                      const isSelected = locale === opt.code;
                      return (
                        <button
                          key={opt.code}
                          type="button"
                          onClick={() => handleLanguageChange(opt.code)}
                          className={`min-w-[140px] flex-1 rounded-xl border-2 px-4 py-3 text-left transition ${
                            isSelected
                              ? 'border-brand bg-brand-soft'
                              : 'border-[var(--border-color)] bg-[var(--bg-secondary)] hover:border-brand/40 hover:bg-[var(--bg-tertiary)]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <span className="text-xl">{opt.flag}</span>
                              <div>
                                <p
                                  className={`text-sm font-semibold ${
                                    isSelected
                                      ? 'text-brand'
                                      : 'text-[var(--text-primary)]'
                                  }`}
                                >
                                  {opt.nativeLabel}
                                </p>
                                <p className="text-xs text-[var(--text-muted)]">
                                  {opt.label}
                                </p>
                              </div>
                            </div>
                            {isSelected && (
                              <CheckCircle className="h-4 w-4 shrink-0 text-brand" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {showChangePasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeChangePasswordModal}
          />
          <div className="relative bg-white dark:bg-[#0a1f44] rounded-2xl w-full max-w-md mx-4 p-6 shadow-2xl border border-[var(--border-color)]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[var(--text-primary)]">
                {t(
                  'Ophthalmologist.settings.accountSettings.resetPassword',
                  'Reset Password'
                )}
              </h3>
              <button
                type="button"
                onClick={closeChangePasswordModal}
                className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[var(--text-muted)]" />
              </button>
            </div>

            {changePasswordMutation.isError && (
              <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
                {changePasswordMutation.error?.message ||
                  t(
                    'Ophthalmologist.settings.accountSettings.passwordChangeFailed',
                    'Unable to change password right now. Please try again.'
                  )}
              </div>
            )}

            <form
              onSubmit={handleChangePasswordSubmit(onChangePasswordSubmit)}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  {t(
                    'Ophthalmologist.settings.accountSettings.currentPassword',
                    'Current Password'
                  )}
                </label>
                <input
                  type="password"
                  {...registerChangePassword('currentPassword')}
                  className="w-full px-4 py-3 bg-white dark:bg-[#1e3a5f] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                />
                {changePasswordErrors.currentPassword?.message && (
                  <p className="mt-1 text-sm text-red-500">
                    {t(
                      changePasswordErrors.currentPassword.message,
                      'Current password is required.'
                    )}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  {t(
                    'Ophthalmologist.settings.accountSettings.newPassword',
                    'New Password'
                  )}
                </label>
                <input
                  type="password"
                  {...registerChangePassword('newPassword')}
                  className="w-full px-4 py-3 bg-white dark:bg-[#1e3a5f] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                />
                {changePasswordErrors.newPassword?.message && (
                  <p className="mt-1 text-sm text-red-500">
                    {t(
                      changePasswordErrors.newPassword.message,
                      'New password is invalid.'
                    )}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  {t(
                    'Ophthalmologist.settings.accountSettings.confirmNewPassword',
                    'Confirm New Password'
                  )}
                </label>
                <input
                  type="password"
                  {...registerChangePassword('confirmNewPassword')}
                  className="w-full px-4 py-3 bg-white dark:bg-[#1e3a5f] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                />
                {changePasswordErrors.confirmNewPassword?.message && (
                  <p className="mt-1 text-sm text-red-500">
                    {t(
                      changePasswordErrors.confirmNewPassword.message,
                      'Passwords do not match.'
                    )}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeChangePasswordModal}
                  className="px-4 py-2 bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded-xl font-medium transition-colors"
                >
                  {t('Ophthalmologist.common.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  className="px-4 py-2 bg-brand hover:bg-brand/80 text-white rounded-xl font-medium transition-colors disabled:opacity-60"
                >
                  {changePasswordMutation.isPending
                    ? t('Ophthalmologist.common.saving', 'Saving...')
                    : t(
                        'Ophthalmologist.settings.accountSettings.updatePassword',
                        'Update Password'
                      )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <UploadCredentialsModal
        isOpen={showUploadCredentialsModal}
        onClose={() => setShowUploadCredentialsModal(false)}
        ophthalmologistId={profileId}
      />
    </div>
  );
}
