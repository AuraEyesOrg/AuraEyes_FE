import { useEffect, useMemo, useState } from 'react';
import {
  Save,
  Building,
  Users,
  Bell,
  Lock,
  Database,
  Upload,
} from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import OrganisationHeader from '../components/OrganisationHeader';
import Spinner from '@/components/ui/spinner';
import useAuthStore from '@/store/auth-store';
import {
  getOrganisationSettings,
  updateOrganisationSettings,
  type OrganisationSettingsDto,
} from '../api/settings.api';
import { uploadAvatar } from '@/features/patient/api/patient.api';
import { resolveAvatarUrl } from '@/lib/user-avatar';
import { extractApiErrorMessage } from '@/lib/api-error';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';

type SettingsTab = 'clinic' | 'users' | 'notifications' | 'security' | 'data';

type SettingsForm = {
  name: string;
  orgType: string;
  address: string;
  licenseNumber: string;
  taxCode: string;
  description: string;
  contactFullName: string;
  contactEmail: string;
  contactPhone: string;
  avatarUrl: string;
};

const SETTINGS_TOAST_IDS = {
  save: 'organisation-settings-save',
  avatarUpload: 'organisation-settings-avatar-upload',
} as const;

const SETTINGS_FORM_KEYS: Array<keyof SettingsForm> = [
  'name',
  'orgType',
  'address',
  'licenseNumber',
  'taxCode',
  'description',
  'contactFullName',
  'contactEmail',
  'contactPhone',
  'avatarUrl',
];

const mapSettingsToForm = (
  settings: OrganisationSettingsDto
): SettingsForm => ({
  name: settings.name ?? '',
  orgType: settings.orgType ?? '',
  address: settings.address ?? '',
  licenseNumber: settings.licenseNumber ?? '',
  taxCode: settings.taxCode ?? '',
  description: settings.description ?? '',
  contactFullName: settings.contactFullName ?? '',
  contactEmail: settings.contactEmail ?? '',
  contactPhone: settings.contactPhone ?? '',
  avatarUrl: settings.avatarUrl ?? '',
});

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const { t } = useSafeTranslation();
  const [activeTab, setActiveTab] = useState<SettingsTab>('clinic');
  const [initialForm, setInitialForm] = useState<SettingsForm | null>(null);
  const [form, setForm] = useState<SettingsForm>({
    name: '',
    orgType: '',
    address: '',
    licenseNumber: '',
    taxCode: '',
    description: '',
    contactFullName: '',
    contactEmail: '',
    contactPhone: '',
    avatarUrl: '',
  });

  const tabs = useMemo(
    () => [
      {
        id: 'clinic' as const,
        label: t('Organisation.settings.tabs.clinic', 'Clinic Info'),
        icon: Building,
      },
      {
        id: 'users' as const,
        label: t('Organisation.settings.tabs.users', 'Users & Roles'),
        icon: Users,
      },
      {
        id: 'notifications' as const,
        label: t('Organisation.settings.tabs.notifications', 'Notifications'),
        icon: Bell,
      },
      {
        id: 'security' as const,
        label: t('Organisation.settings.tabs.security', 'Security'),
        icon: Lock,
      },
      {
        id: 'data' as const,
        label: t('Organisation.settings.tabs.data', 'Data Management'),
        icon: Database,
      },
    ],
    [t]
  );

  const settingsQuery = useQuery({
    queryKey: ['organisation-settings'],
    queryFn: getOrganisationSettings,
  });

  useEffect(() => {
    if (!settingsQuery.data) return;
    const mapped = mapSettingsToForm(settingsQuery.data);
    setForm(mapped);
    setInitialForm(mapped);
  }, [settingsQuery.data]);

  const isDirty = useMemo(() => {
    if (!initialForm) {
      return false;
    }

    return SETTINGS_FORM_KEYS.some((key) => form[key] !== initialForm[key]);
  }, [form, initialForm]);

  const saveMutation = useMutation({
    mutationFn: updateOrganisationSettings,
    onSuccess: (updated) => {
      const mapped = mapSettingsToForm(updated);
      setForm(mapped);
      setInitialForm(mapped);

      if (user) {
        setUser({
          ...user,
          fullName: updated.contactFullName || user.fullName,
          email: updated.contactEmail || user.email,
          avatarUrl: resolveAvatarUrl(updated.avatarUrl) ?? user.avatarUrl,
        });
      }

      toast.success(
        t(
          'Organisation.settings.toast.updateSuccess',
          'Organisation settings updated successfully.'
        ),
        {
          toastId: SETTINGS_TOAST_IDS.save,
        }
      );
    },
    onError: (error) => {
      toast.error(
        extractApiErrorMessage(
          error,
          t(
            'Organisation.settings.toast.updateFailed',
            'Failed to update organisation settings.'
          )
        ),
        { toastId: SETTINGS_TOAST_IDS.save }
      );
    },
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: uploadAvatar,
    onSuccess: (avatarUrl) => {
      setForm((prev) => ({ ...prev, avatarUrl }));
      toast.success(
        t(
          'Organisation.settings.toast.avatarUploadSuccess',
          'Avatar uploaded. Save changes to persist profile mapping.'
        ),
        {
          toastId: SETTINGS_TOAST_IDS.avatarUpload,
        }
      );
    },
    onError: (error) => {
      toast.error(
        extractApiErrorMessage(
          error,
          t(
            'Organisation.settings.toast.avatarUploadFailed',
            'Failed to upload avatar.'
          )
        ),
        {
          toastId: SETTINGS_TOAST_IDS.avatarUpload,
        }
      );
    },
  });

  const isSaving = saveMutation.isPending || uploadAvatarMutation.isPending;
  const displayAvatar = resolveAvatarUrl(form.avatarUrl) ?? '/logo.png';

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    uploadAvatarMutation.mutate(file);
  };

  const handleSave = () => {
    if (
      !isDirty ||
      isSaving ||
      settingsQuery.isLoading ||
      settingsQuery.isError
    ) {
      return;
    }

    saveMutation.mutate({
      name: form.name.trim(),
      address: form.address.trim() || undefined,
      licenseNumber: form.licenseNumber.trim() || undefined,
      taxCode: form.taxCode.trim() || undefined,
      description: form.description.trim() || undefined,
      contactFullName: form.contactFullName.trim() || undefined,
      contactEmail: form.contactEmail.trim() || undefined,
      contactPhone: form.contactPhone.trim() || undefined,
      avatarUrl: form.avatarUrl || undefined,
    });
  };

  return (
    <div className="flex h-screen w-full bg-(--bg-primary)">
      <Sidebar />

      <div className="flex-1 h-full overflow-y-auto">
        <OrganisationHeader
          pageName={t('Organisation.settings.pageName', 'Settings')}
        />

        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-(--text-primary) mb-2">
              {t('Organisation.settings.header.title', 'Settings')}
            </h1>
            <p className="text-(--text-secondary)">
              {t(
                'Organisation.settings.header.subtitle',
                'Manage your organisation profile and contact configuration.'
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="bg-(--bg-secondary) rounded-xl p-4 border border-(--border-primary) h-fit">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary text-white'
                        : 'text-(--text-secondary) hover:bg-(--bg-tertiary)'
                    }`}
                  >
                    <tab.icon size={20} />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="lg:col-span-3">
              <div className="bg-(--bg-secondary) rounded-xl p-6 border border-(--border-primary)">
                {settingsQuery.isLoading && (
                  <p className="text-sm text-(--text-secondary)">
                    {t(
                      'Organisation.settings.states.loading',
                      'Loading organisation settings...'
                    )}
                  </p>
                )}

                {settingsQuery.isError && (
                  <p className="text-sm text-red-500">
                    {t(
                      'Organisation.settings.states.loadFailed',
                      'Unable to load settings. Please refresh and try again.'
                    )}
                  </p>
                )}

                {!settingsQuery.isLoading &&
                  !settingsQuery.isError &&
                  activeTab === 'clinic' && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-(--text-primary)">
                        {t(
                          'Organisation.settings.sections.organisationInfo',
                          'Organisation Information'
                        )}
                      </h3>

                      <div className="relative grid gap-4 md:grid-cols-[120px_1fr] items-start">
                        {uploadAvatarMutation.isPending && (
                          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-(--bg-primary)/70 backdrop-blur-[1px]">
                            <Spinner size={28} className="text-primary" />
                          </div>
                        )}

                        <img
                          src={displayAvatar}
                          alt={t(
                            'Organisation.settings.avatar.alt',
                            'Organisation avatar'
                          )}
                          className="h-24 w-24 rounded-2xl border border-(--border-primary) object-cover"
                        />
                        <div className="space-y-3">
                          <p className="text-xs text-(--text-tertiary)">
                            {t(
                              'Organisation.settings.avatar.hint',
                              'Avatar is synced to network profile and organisation about section.'
                            )}
                          </p>
                          <label className="inline-flex items-center gap-2 rounded-lg border border-(--border-primary) px-4 py-2 text-sm font-medium text-(--text-primary) hover:bg-(--bg-tertiary) cursor-pointer transition-colors">
                            <Upload size={16} />
                            {t(
                              'Organisation.settings.avatar.uploadAction',
                              'Upload avatar'
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleAvatarFileChange}
                              disabled={isSaving}
                            />
                          </label>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <InputField
                          label={t(
                            'Organisation.settings.form.organisationName',
                            'Organisation Name'
                          )}
                          name="name"
                          value={form.name}
                          onChange={handleInputChange}
                        />
                        <InputField
                          label={t('Organisation.settings.form.type', 'Type')}
                          name="orgType"
                          value={form.orgType}
                          onChange={handleInputChange}
                          readOnly
                        />
                        <InputField
                          label={t(
                            'Organisation.settings.form.licenseNumber',
                            'License Number'
                          )}
                          name="licenseNumber"
                          value={form.licenseNumber}
                          onChange={handleInputChange}
                        />
                        <InputField
                          label={t(
                            'Organisation.settings.form.taxCode',
                            'Tax Code'
                          )}
                          name="taxCode"
                          value={form.taxCode}
                          onChange={handleInputChange}
                        />
                        <InputField
                          label={t(
                            'Organisation.settings.form.contactFullName',
                            'Contact Full Name'
                          )}
                          name="contactFullName"
                          value={form.contactFullName}
                          onChange={handleInputChange}
                        />
                        <InputField
                          label={t(
                            'Organisation.settings.form.contactEmail',
                            'Contact Email'
                          )}
                          name="contactEmail"
                          type="email"
                          value={form.contactEmail}
                          onChange={handleInputChange}
                        />
                        <InputField
                          label={t(
                            'Organisation.settings.form.contactPhone',
                            'Contact Phone'
                          )}
                          name="contactPhone"
                          value={form.contactPhone}
                          onChange={handleInputChange}
                        />
                        <InputField
                          label={t(
                            'Organisation.settings.form.address',
                            'Address'
                          )}
                          name="address"
                          value={form.address}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-(--text-tertiary) mb-2">
                          {t(
                            'Organisation.settings.form.aboutDescription',
                            'About / Description'
                          )}
                        </label>
                        <textarea
                          name="description"
                          rows={4}
                          value={form.description}
                          onChange={handleInputChange}
                          className="w-full bg-(--bg-primary) border border-(--border-primary) rounded-lg px-4 py-3 text-(--text-primary) focus:outline-none focus:border-primary"
                          placeholder={t(
                            'Organisation.settings.form.descriptionPlaceholder',
                            'Brief organisation profile shown in network about section'
                          )}
                        />
                      </div>
                    </div>
                  )}

                {!settingsQuery.isLoading &&
                  !settingsQuery.isError &&
                  activeTab !== 'clinic' && (
                    <div className="rounded-lg border border-dashed border-(--border-primary) p-6 text-sm text-(--text-secondary)">
                      {t(
                        'Organisation.settings.states.sectionInProgress',
                        'This section is currently in progress. Core organisation profile settings are available in Clinic Info.'
                      )}
                    </div>
                  )}

                <div className="mt-6 pt-6 border-t border-(--border-primary)">
                  <button
                    onClick={handleSave}
                    disabled={
                      isSaving ||
                      !isDirty ||
                      settingsQuery.isLoading ||
                      settingsQuery.isError
                    }
                    className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Save size={18} />
                    {isSaving
                      ? t('Organisation.settings.actions.saving', 'Saving...')
                      : t(
                          'Organisation.settings.actions.saveChanges',
                          'Save Changes'
                        )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

type InputFieldProps = {
  label: string;
  name: keyof SettingsForm;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  readOnly?: boolean;
};

function InputField({
  label,
  name,
  value,
  onChange,
  type = 'text',
  readOnly = false,
}: InputFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-(--text-tertiary) mb-2">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        className="w-full bg-(--bg-primary) border border-(--border-primary) rounded-lg px-4 py-2 text-(--text-primary) focus:outline-none focus:border-primary read-only:opacity-70"
      />
    </div>
  );
}
