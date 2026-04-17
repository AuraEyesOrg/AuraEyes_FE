/**
 * System Admin Settings Page
 * Manage system-wide settings and configurations
 */

import { useState, useEffect, useRef } from 'react';
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  Database,
  Globe,
  Mail,
  Lock,
  Save,
  RefreshCw,
  Plus,
  X,
  Check,
} from 'lucide-react';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import {
  useSystemSettings,
  useUpdateSystemSettings,
  useExperiencePricingRules,
  useUpdateExperiencePricingRules,
  type ExperiencePricingRule,
} from '../api/system-settings.api';
import { extractApiErrorMessage } from '@/lib/api-error';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';

interface SettingSection {
  id: string;
  titleKey: string;
  titleFallback: string;
  descriptionKey: string;
  descriptionFallback: string;
  icon: React.ReactNode;
}

const settingSections: SettingSection[] = [
  {
    id: 'general',
    titleKey: 'SystemAdmin.settings.sections.general.title',
    titleFallback: 'General Settings',
    descriptionKey: 'SystemAdmin.settings.sections.general.description',
    descriptionFallback: 'Configure basic system settings',
    icon: <SettingsIcon className="w-5 h-5" />,
  },
  {
    id: 'notifications',
    titleKey: 'SystemAdmin.settings.sections.notifications.title',
    titleFallback: 'Notifications',
    descriptionKey: 'SystemAdmin.settings.sections.notifications.description',
    descriptionFallback: 'Manage notification preferences',
    icon: <Bell className="w-5 h-5" />,
  },
  {
    id: 'security',
    titleKey: 'SystemAdmin.settings.sections.security.title',
    titleFallback: 'Security',
    descriptionKey: 'SystemAdmin.settings.sections.security.description',
    descriptionFallback: 'Security and authentication settings',
    icon: <Shield className="w-5 h-5" />,
  },
  {
    id: 'data',
    titleKey: 'SystemAdmin.settings.sections.data.title',
    titleFallback: 'Data Management',
    descriptionKey: 'SystemAdmin.settings.sections.data.description',
    descriptionFallback: 'Backup, export, and data retention',
    icon: <Database className="w-5 h-5" />,
  },
];

const DEFAULT_TRUSTED_DOMAINS = [
  'vinmec.com',
  'vnio.vn',
  'benhvienmat.com',
  'matsaigon.com',
  'matquocte.vn',
  'medlatec.vn',
  'hellobacsi.com',
];

const SYSTEM_LANGUAGE_OPTIONS = [
  {
    code: 'en',
    nativeLabelKey: 'SystemAdmin.settings.general.languageOptions.en.native',
    nativeLabelFallback: 'English',
    labelKey: 'SystemAdmin.settings.general.languageOptions.en.label',
    labelFallback: 'English',
    flag: 'US',
  },
  {
    code: 'vi',
    nativeLabelKey: 'SystemAdmin.settings.general.languageOptions.vi.native',
    nativeLabelFallback: 'Tiếng Việt',
    labelKey: 'SystemAdmin.settings.general.languageOptions.vi.label',
    labelFallback: 'Vietnamese',
    flag: 'VN',
  },
] as const;

const SETTINGS_TOAST_IDS = {
  save: 'system-admin-settings-save',
} as const;

export default function SettingsPage() {
  const { t } = useSafeTranslation();
  const [activeSection, setActiveSection] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const domainInputRef = useRef<HTMLInputElement>(null);

  const { data: systemSettings } = useSystemSettings();
  const { data: experiencePricingRules } = useExperiencePricingRules();
  const updateSettingsMutation = useUpdateSystemSettings();
  const updatePricingRulesMutation = useUpdateExperiencePricingRules();

  // General settings state
  const [generalSettings, setGeneralSettings] = useState({
    platformName: 'AURA Medical',
    supportEmail: 'support@aura.med',
    timezone: 'UTC',
    language: 'en',
    maintenanceMode: false,
    minAdvanceBookingHours: 0.5,
    aiQuotaUnitPrice: 10000,
    freeAiQuota: 3,
    partTimeMaxSlotsPerDay: 100,
    fullTimeSlotWindowDays: 30,
    fullTimeMinSlotCost: 100000,
    fullTimeMaxSlotCost: 400000,
  });

  // Trusted medical domains for AI resource search
  const [trustedDomains, setTrustedDomains] = useState<string[]>(
    DEFAULT_TRUSTED_DOMAINS
  );
  const [domainInput, setDomainInput] = useState('');
  const [pricingBands, setPricingBands] = useState<ExperiencePricingRule[]>([]);

  useEffect(() => {
    if (systemSettings) {
      setGeneralSettings((prev) => ({
        ...prev,
        minAdvanceBookingHours: systemSettings['MIN_ADVANCE_BOOKING_HOURS']
          ? parseFloat(systemSettings['MIN_ADVANCE_BOOKING_HOURS'])
          : 0.5,
        aiQuotaUnitPrice: systemSettings['AI_QUOTA_UNIT_PRICE']
          ? parseFloat(systemSettings['AI_QUOTA_UNIT_PRICE'])
          : 10000,
        freeAiQuota: systemSettings['FREE_AI_QUOTA']
          ? parseInt(systemSettings['FREE_AI_QUOTA'], 10)
          : 3,
        partTimeMaxSlotsPerDay: systemSettings['PART_TIME_MAX_SLOTS_PER_DAY']
          ? parseInt(systemSettings['PART_TIME_MAX_SLOTS_PER_DAY'], 10)
          : 100,
        fullTimeSlotWindowDays: systemSettings['FULLTIME_SLOT_WINDOW_DAYS']
          ? parseInt(systemSettings['FULLTIME_SLOT_WINDOW_DAYS'], 10)
          : 30,
        fullTimeMinSlotCost: systemSettings['FULLTIME_MIN_SLOT_COST']
          ? parseInt(systemSettings['FULLTIME_MIN_SLOT_COST'], 10)
          : 100000,
        fullTimeMaxSlotCost: systemSettings['FULLTIME_MAX_SLOT_COST']
          ? parseInt(systemSettings['FULLTIME_MAX_SLOT_COST'], 10)
          : 400000,
      }));

      if (systemSettings['TRUSTED_EYE_HEALTH_DOMAINS']) {
        const parsed = systemSettings['TRUSTED_EYE_HEALTH_DOMAINS']
          .split(',')
          .map((d) => d.trim())
          .filter(Boolean);
        if (parsed.length > 0) setTrustedDomains(parsed);
      }
    }
  }, [systemSettings]);

  useEffect(() => {
    if (!experiencePricingRules) {
      return;
    }

    setPricingBands(
      [...experiencePricingRules].sort(
        (a, b) => a.minYearsExperience - b.minYearsExperience
      )
    );
  }, [experiencePricingRules]);

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    screeningAlerts: true,
    systemAlerts: true,
    weeklyReports: true,
    marketingEmails: false,
  });

  // Security settings state
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorRequired: false,
    sessionTimeout: 30,
    passwordMinLength: 8,
    maxLoginAttempts: 5,
    ipWhitelist: '',
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const normalizedFullTimeMinCost = Math.max(
        0,
        generalSettings.fullTimeMinSlotCost
      );
      const normalizedFullTimeMaxCost = Math.max(
        normalizedFullTimeMinCost,
        generalSettings.fullTimeMaxSlotCost
      );

      const settingsToUpdate = {
        MIN_ADVANCE_BOOKING_HOURS: Math.max(
          0.5,
          generalSettings.minAdvanceBookingHours
        ).toString(),
        AI_QUOTA_UNIT_PRICE: Math.max(
          1,
          generalSettings.aiQuotaUnitPrice
        ).toString(),
        FREE_AI_QUOTA: Math.max(0, generalSettings.freeAiQuota).toString(),
        PART_TIME_MAX_SLOTS_PER_DAY: Math.max(
          1,
          generalSettings.partTimeMaxSlotsPerDay
        ).toString(),
        FULLTIME_SLOT_WINDOW_DAYS: Math.max(
          1,
          generalSettings.fullTimeSlotWindowDays
        ).toString(),
        FULLTIME_MIN_SLOT_COST: normalizedFullTimeMinCost.toString(),
        FULLTIME_MAX_SLOT_COST: normalizedFullTimeMaxCost.toString(),
        TRUSTED_EYE_HEALTH_DOMAINS: trustedDomains.join(','),
      };
      await updateSettingsMutation.mutateAsync(settingsToUpdate);

      if (pricingBands.length > 0) {
        await updatePricingRulesMutation.mutateAsync(
          pricingBands.map((band) => ({
            id: band.id,
            minPrice: Math.max(1, Math.trunc(band.minPrice)),
            maxPrice: Math.max(
              Math.max(1, Math.trunc(band.minPrice)),
              Math.trunc(band.maxPrice)
            ),
          }))
        );
      }

      toast.success(
        t(
          'SystemAdmin.settings.toasts.saveSuccess',
          'Settings saved successfully'
        ),
        {
          toastId: SETTINGS_TOAST_IDS.save,
        }
      );
    } catch (error) {
      console.error(error);
      toast.error(
        extractApiErrorMessage(
          error,
          t('SystemAdmin.settings.toasts.saveFailed', 'Failed to save settings')
        ),
        {
          toastId: SETTINGS_TOAST_IDS.save,
        }
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handlePricingBandChange = (
    id: string,
    field: 'minPrice' | 'maxPrice',
    value: number
  ) => {
    setPricingBands((prev) =>
      prev.map((band) => {
        if (band.id !== id) {
          return band;
        }

        const normalizedValue = Number.isFinite(value) ? value : 0;
        return {
          ...band,
          [field]: normalizedValue,
        };
      })
    );
  };

  const addDomain = () => {
    const raw = domainInput
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/\/.*$/, '');
    if (!raw || trustedDomains.includes(raw)) {
      setDomainInput('');
      return;
    }
    setTrustedDomains((prev) => [...prev, raw]);
    setDomainInput('');
    domainInputRef.current?.focus();
  };

  const removeDomain = (domain: string) =>
    setTrustedDomains((prev) => prev.filter((d) => d !== domain));

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {t('SystemAdmin.settings.general.platformName', 'Platform Name')}
          </label>
          <input
            type="text"
            value={generalSettings.platformName}
            onChange={(e) =>
              setGeneralSettings({
                ...generalSettings,
                platformName: e.target.value,
              })
            }
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {t('SystemAdmin.settings.general.supportEmail', 'Support Email')}
          </label>
          <input
            type="email"
            value={generalSettings.supportEmail}
            onChange={(e) =>
              setGeneralSettings({
                ...generalSettings,
                supportEmail: e.target.value,
              })
            }
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {t('SystemAdmin.settings.general.timezone', 'Timezone')}
          </label>
          <select
            value={generalSettings.timezone}
            onChange={(e) =>
              setGeneralSettings({
                ...generalSettings,
                timezone: e.target.value,
              })
            }
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">
              {t(
                'SystemAdmin.settings.general.timezoneOptions.americaNewYork',
                'Eastern Time (ET)'
              )}
            </option>
            <option value="America/Los_Angeles">
              {t(
                'SystemAdmin.settings.general.timezoneOptions.americaLosAngeles',
                'Pacific Time (PT)'
              )}
            </option>
            <option value="Europe/London">
              {t(
                'SystemAdmin.settings.general.timezoneOptions.europeLondon',
                'London (GMT)'
              )}
            </option>
            <option value="Asia/Ho_Chi_Minh">
              {t(
                'SystemAdmin.settings.general.timezoneOptions.asiaHoChiMinh',
                'Vietnam (ICT)'
              )}
            </option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {t(
              'SystemAdmin.settings.general.defaultLanguage',
              'Default Language'
            )}
          </label>
          <div className="flex gap-2">
            {SYSTEM_LANGUAGE_OPTIONS.map((option) => {
              const isSelected = generalSettings.language === option.code;

              return (
                <button
                  key={option.code}
                  type="button"
                  onClick={() =>
                    setGeneralSettings({
                      ...generalSettings,
                      language: option.code,
                    })
                  }
                  className={`flex-1 flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all text-sm ${
                    isSelected
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold leading-none">
                      {option.flag}
                    </span>
                    <div className="text-left">
                      <p className="font-semibold">
                        {t(option.nativeLabelKey, option.nativeLabelFallback)}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {t(option.labelKey, option.labelFallback)}
                      </p>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {t(
              'SystemAdmin.settings.general.minAdvanceBookingHours',
              'Minimum advance booking time (hours)'
            )}
          </label>
          <input
            type="number"
            min={0.5}
            step={0.5}
            max={72}
            value={generalSettings.minAdvanceBookingHours}
            onChange={(e) =>
              setGeneralSettings({
                ...generalSettings,
                minAdvanceBookingHours: parseFloat(e.target.value) || 0.5,
              })
            }
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {t(
              'SystemAdmin.settings.general.aiQuotaUnitPrice',
              'AI Quota Unit Price (VND per quota)'
            )}
          </label>
          <input
            type="number"
            min={1}
            step={1000}
            value={generalSettings.aiQuotaUnitPrice}
            onChange={(e) =>
              setGeneralSettings({
                ...generalSettings,
                aiQuotaUnitPrice: parseFloat(e.target.value) || 0,
              })
            }
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {t(
              'SystemAdmin.settings.general.aiQuotaUnitPriceHint',
              'Total purchase cost = quantity x unit price.'
            )}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {t(
              'SystemAdmin.settings.general.freeAiQuota',
              'Free AI Quota (Per Patient)'
            )}
          </label>
          <input
            type="number"
            min={0}
            step={1}
            value={generalSettings.freeAiQuota}
            onChange={(e) =>
              setGeneralSettings({
                ...generalSettings,
                freeAiQuota: parseInt(e.target.value) || 0,
              })
            }
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {t(
              'SystemAdmin.settings.general.partTimeMaxSlotsPerDay',
              'Part-time max slots per day'
            )}
          </label>
          <input
            type="number"
            min={1}
            step={1}
            value={generalSettings.partTimeMaxSlotsPerDay}
            onChange={(e) =>
              setGeneralSettings({
                ...generalSettings,
                partTimeMaxSlotsPerDay: parseInt(e.target.value, 10) || 1,
              })
            }
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {t(
              'SystemAdmin.settings.general.partTimeMaxSlotsPerDayHint',
              'Global daily quota for all part-time ophthalmologist slots.'
            )}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {t(
              'SystemAdmin.settings.general.fullTimeSlotWindowDays',
              'Full-time generation window (days)'
            )}
          </label>
          <input
            type="number"
            min={1}
            step={1}
            value={generalSettings.fullTimeSlotWindowDays}
            onChange={(e) =>
              setGeneralSettings({
                ...generalSettings,
                fullTimeSlotWindowDays: parseInt(e.target.value, 10) || 1,
              })
            }
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {t(
              'SystemAdmin.settings.general.fullTimeSlotWindowDaysHint',
              'Number of forward days Hangfire keeps generated for full-time schedules.'
            )}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {t(
              'SystemAdmin.settings.general.fullTimeMinSlotCost',
              'Full-time minimum slot cost (VND)'
            )}
          </label>
          <input
            type="number"
            min={0}
            step={1000}
            value={generalSettings.fullTimeMinSlotCost}
            onChange={(e) =>
              setGeneralSettings({
                ...generalSettings,
                fullTimeMinSlotCost: parseInt(e.target.value, 10) || 0,
              })
            }
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {t(
              'SystemAdmin.settings.general.fullTimeMaxSlotCost',
              'Full-time maximum slot cost (VND)'
            )}
          </label>
          <input
            type="number"
            min={0}
            step={1000}
            value={generalSettings.fullTimeMaxSlotCost}
            onChange={(e) =>
              setGeneralSettings({
                ...generalSettings,
                fullTimeMaxSlotCost: parseInt(e.target.value, 10) || 0,
              })
            }
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {t(
              'SystemAdmin.settings.general.fullTimeMaxSlotCostHint',
              'Auto-generated full-time slot cost is clamped between min and max.'
            )}
          </p>
        </div>
        <div className="md:col-span-2">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800/60">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
              {t(
                'SystemAdmin.settings.general.pricingBands.title',
                'Part-time pricing bands by experience'
              )}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              {t(
                'SystemAdmin.settings.general.pricingBands.description',
                'Update min/max price for each seeded experience band.'
              )}
            </p>

            {pricingBands.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t(
                  'SystemAdmin.settings.general.pricingBands.empty',
                  'No pricing bands found.'
                )}
              </p>
            ) : (
              <div className="space-y-3">
                {pricingBands.map((band) => (
                  <div
                    key={band.id}
                    className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end rounded-lg border border-slate-200 dark:border-slate-700 p-3 bg-white dark:bg-slate-900"
                  >
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                        {t(
                          'SystemAdmin.settings.general.pricingBands.experienceBand',
                          'Experience band'
                        )}
                      </label>
                      <input
                        type="text"
                        value={t(
                          'SystemAdmin.settings.general.pricingBands.experienceBandValue',
                          '{{min}} - {{max}} years',
                          {
                            min: band.minYearsExperience,
                            max: band.maxYearsExperience,
                          }
                        )}
                        readOnly
                        disabled
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                        {t(
                          'SystemAdmin.settings.general.pricingBands.minPrice',
                          'Min price (VND)'
                        )}
                      </label>
                      <input
                        type="number"
                        min={1}
                        step={1000}
                        value={band.minPrice}
                        onChange={(e) =>
                          handlePricingBandChange(
                            band.id,
                            'minPrice',
                            parseInt(e.target.value, 10) || 0
                          )
                        }
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                        {t(
                          'SystemAdmin.settings.general.pricingBands.maxPrice',
                          'Max price (VND)'
                        )}
                      </label>
                      <input
                        type="number"
                        min={1}
                        step={1000}
                        value={band.maxPrice}
                        onChange={(e) =>
                          handlePricingBandChange(
                            band.id,
                            'maxPrice',
                            parseInt(e.target.value, 10) || 0
                          )
                        }
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="md:col-span-2">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t(
              'SystemAdmin.settings.general.aiQuotaBillingNote',
              'This unit price is used directly by backend billing when purchasing AI quota.'
            )}
          </p>
        </div>
      </div>

      {/* Trusted Medical Domains */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            {t(
              'SystemAdmin.settings.general.trustedDomains.title',
              'Trusted Medical Domains for AI Resources'
            )}
          </label>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t(
              'SystemAdmin.settings.general.trustedDomains.descriptionPrefix',
              'Google search results will be restricted to these domains (e.g.'
            )}{' '}
            <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">
              vinmec.com
            </code>
            {t(
              'SystemAdmin.settings.general.trustedDomains.descriptionSuffix',
              ').'
            )}
          </p>
        </div>

        {/* Domain tags */}
        <div className="flex flex-wrap gap-2 min-h-[40px] p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          {trustedDomains.length === 0 && (
            <span className="text-xs text-slate-400 italic">
              {t(
                'SystemAdmin.settings.general.trustedDomains.empty',
                'No domains configured - using built-in defaults.'
              )}
            </span>
          )}
          {trustedDomains.map((domain) => (
            <span
              key={domain}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
            >
              <Globe className="w-3 h-3" />
              {domain}
              <button
                type="button"
                onClick={() => removeDomain(domain)}
                className="hover:text-red-500 transition-colors ml-0.5"
                aria-label={t(
                  'SystemAdmin.settings.general.trustedDomains.removeDomainAria',
                  'Remove {{domain}}',
                  {
                    domain,
                  }
                )}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>

        {/* Add domain input */}
        <div className="flex gap-2">
          <input
            ref={domainInputRef}
            type="text"
            value={domainInput}
            onChange={(e) => setDomainInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addDomain();
              }
            }}
            placeholder={t(
              'SystemAdmin.settings.general.trustedDomains.placeholder',
              'e.g. benhvienmathanoi.vn'
            )}
            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
          />
          <button
            type="button"
            onClick={addDomain}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-medium text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t('SystemAdmin.settings.general.trustedDomains.add', 'Add')}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
        <div>
          <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-400">
            {t(
              'SystemAdmin.settings.general.maintenanceMode.title',
              'Maintenance Mode'
            )}
          </h4>
          <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
            {t(
              'SystemAdmin.settings.general.maintenanceMode.description',
              'Enable to temporarily disable user access for system maintenance'
            )}
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={generalSettings.maintenanceMode}
            onChange={(e) =>
              setGeneralSettings({
                ...generalSettings,
                maintenanceMode: e.target.checked,
              })
            }
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-amber-500"></div>
        </label>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-4">
      {[
        {
          key: 'emailNotifications',
          label: t(
            'SystemAdmin.settings.notifications.items.emailNotifications.label',
            'Email Notifications'
          ),
          description: t(
            'SystemAdmin.settings.notifications.items.emailNotifications.description',
            'Receive email notifications for important events'
          ),
        },
        {
          key: 'screeningAlerts',
          label: t(
            'SystemAdmin.settings.notifications.items.screeningAlerts.label',
            'Screening Alerts'
          ),
          description: t(
            'SystemAdmin.settings.notifications.items.screeningAlerts.description',
            'Get notified when new screenings need review'
          ),
        },
        {
          key: 'systemAlerts',
          label: t(
            'SystemAdmin.settings.notifications.items.systemAlerts.label',
            'System Alerts'
          ),
          description: t(
            'SystemAdmin.settings.notifications.items.systemAlerts.description',
            'Receive alerts about system health and issues'
          ),
        },
        {
          key: 'weeklyReports',
          label: t(
            'SystemAdmin.settings.notifications.items.weeklyReports.label',
            'Weekly Reports'
          ),
          description: t(
            'SystemAdmin.settings.notifications.items.weeklyReports.description',
            'Receive weekly summary reports via email'
          ),
        },
        {
          key: 'marketingEmails',
          label: t(
            'SystemAdmin.settings.notifications.items.marketingEmails.label',
            'Marketing Emails'
          ),
          description: t(
            'SystemAdmin.settings.notifications.items.marketingEmails.description',
            'Receive product updates and announcements'
          ),
        },
      ].map((item) => (
        <div
          key={item.key}
          className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
        >
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              {item.label}
            </h4>
            <p className="text-xs text-slate-500 mt-1">{item.description}</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={
                notificationSettings[
                  item.key as keyof typeof notificationSettings
                ]
              }
              onChange={(e) =>
                setNotificationSettings({
                  ...notificationSettings,
                  [item.key]: e.target.checked,
                })
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
          </label>
        </div>
      ))}
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
            {t(
              'SystemAdmin.settings.security.requireTwoFactor.title',
              'Require Two-Factor Authentication'
            )}
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            {t(
              'SystemAdmin.settings.security.requireTwoFactor.description',
              'Require all users to enable 2FA for their accounts'
            )}
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={securitySettings.twoFactorRequired}
            onChange={(e) =>
              setSecuritySettings({
                ...securitySettings,
                twoFactorRequired: e.target.checked,
              })
            }
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {t(
              'SystemAdmin.settings.security.sessionTimeout',
              'Session Timeout (minutes)'
            )}
          </label>
          <input
            type="number"
            value={securitySettings.sessionTimeout}
            onChange={(e) =>
              setSecuritySettings({
                ...securitySettings,
                sessionTimeout: parseInt(e.target.value) || 30,
              })
            }
            min={5}
            max={120}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {t(
              'SystemAdmin.settings.security.minimumPasswordLength',
              'Minimum Password Length'
            )}
          </label>
          <input
            type="number"
            value={securitySettings.passwordMinLength}
            onChange={(e) =>
              setSecuritySettings({
                ...securitySettings,
                passwordMinLength: parseInt(e.target.value) || 8,
              })
            }
            min={6}
            max={32}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {t(
              'SystemAdmin.settings.security.maxLoginAttempts',
              'Max Login Attempts'
            )}
          </label>
          <input
            type="number"
            value={securitySettings.maxLoginAttempts}
            onChange={(e) =>
              setSecuritySettings({
                ...securitySettings,
                maxLoginAttempts: parseInt(e.target.value) || 5,
              })
            }
            min={3}
            max={10}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {t(
              'SystemAdmin.settings.security.ipWhitelist',
              'IP Whitelist (comma separated)'
            )}
          </label>
          <input
            type="text"
            value={securitySettings.ipWhitelist}
            onChange={(e) =>
              setSecuritySettings({
                ...securitySettings,
                ipWhitelist: e.target.value,
              })
            }
            placeholder={t(
              'SystemAdmin.settings.security.ipWhitelistPlaceholder',
              '192.168.1.1, 10.0.0.1'
            )}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
          />
        </div>
      </div>
    </div>
  );

  const renderDataSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                {t(
                  'SystemAdmin.settings.data.databaseBackup.title',
                  'Database Backup'
                )}
              </h4>
              <p className="text-xs text-slate-500">
                {t(
                  'SystemAdmin.settings.data.databaseBackup.lastBackup',
                  'Last backup: 2 hours ago'
                )}
              </p>
            </div>
          </div>
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-all">
            <RefreshCw className="w-4 h-4" />
            {t(
              'SystemAdmin.settings.data.databaseBackup.createNow',
              'Create Backup Now'
            )}
          </button>
        </div>

        <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                {t('SystemAdmin.settings.data.exportData.title', 'Export Data')}
              </h4>
              <p className="text-xs text-slate-500">
                {t(
                  'SystemAdmin.settings.data.exportData.description',
                  'Download all system data'
                )}
              </p>
            </div>
          </div>
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-all">
            <Mail className="w-4 h-4" />
            {t(
              'SystemAdmin.settings.data.exportData.exportToEmail',
              'Export to Email'
            )}
          </button>
        </div>
      </div>

      <div className="p-6 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
            <Lock className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-red-800 dark:text-red-400">
              {t('SystemAdmin.settings.data.dangerZone.title', 'Danger Zone')}
            </h4>
            <p className="text-xs text-red-600 dark:text-red-500">
              {t(
                'SystemAdmin.settings.data.dangerZone.description',
                'Irreversible actions - proceed with caution'
              )}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2.5 rounded-lg border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 font-medium text-sm transition-all">
            {t(
              'SystemAdmin.settings.data.dangerZone.clearCache',
              'Clear Cache'
            )}
          </button>
          <button className="px-4 py-2.5 rounded-lg border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 font-medium text-sm transition-all">
            {t(
              'SystemAdmin.settings.data.dangerZone.resetStatistics',
              'Reset Statistics'
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'general':
        return renderGeneralSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'security':
        return renderSecuritySettings();
      case 'data':
        return renderDataSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader
          title={t('SystemAdmin.settings.page.title', 'System Settings')}
          description={t(
            'SystemAdmin.settings.page.description',
            'Configure system-wide settings and preferences'
          )}
          actions={
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:opacity-90 text-slate-900 font-bold text-sm transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
            >
              {isSaving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSaving
                ? t('SystemAdmin.settings.page.actions.saving', 'Saving...')
                : t(
                    'SystemAdmin.settings.page.actions.saveChanges',
                    'Save Changes'
                  )}
            </button>
          }
        />

        <main className="flex-1 overflow-y-auto">
          <div className="px-6 md:px-10 py-6 max-w-[1200px] mx-auto w-full">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Settings Navigation */}
              <div className="lg:w-64 flex-shrink-0">
                <nav className="space-y-1">
                  {settingSections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                        activeSection === section.id
                          ? 'bg-primary/10 text-primary'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span
                        className={
                          activeSection === section.id ? 'text-primary' : ''
                        }
                      >
                        {section.icon}
                      </span>
                      <div>
                        <p className="text-sm font-medium">
                          {t(section.titleKey, section.titleFallback)}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {t(
                            section.descriptionKey,
                            section.descriptionFallback
                          )}
                        </p>
                      </div>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Settings Content */}
              <div className="flex-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {(() => {
                      const active = settingSections.find(
                        (s) => s.id === activeSection
                      );
                      if (!active) return null;
                      return t(active.titleKey, active.titleFallback);
                    })()}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    {(() => {
                      const active = settingSections.find(
                        (s) => s.id === activeSection
                      );
                      if (!active) return null;
                      return t(
                        active.descriptionKey,
                        active.descriptionFallback
                      );
                    })()}
                  </p>
                </div>
                {renderContent()}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
