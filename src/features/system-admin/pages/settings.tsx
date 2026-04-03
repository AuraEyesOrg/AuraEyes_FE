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
} from 'lucide-react';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import {
  useSystemSettings,
  useUpdateSystemSettings,
} from '../api/system-settings.api';

interface SettingSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const settingSections: SettingSection[] = [
  {
    id: 'general',
    title: 'General Settings',
    description: 'Configure basic system settings',
    icon: <SettingsIcon className="w-5 h-5" />,
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Manage notification preferences',
    icon: <Bell className="w-5 h-5" />,
  },
  {
    id: 'security',
    title: 'Security',
    description: 'Security and authentication settings',
    icon: <Shield className="w-5 h-5" />,
  },
  {
    id: 'data',
    title: 'Data Management',
    description: 'Backup, export, and data retention',
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

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const domainInputRef = useRef<HTMLInputElement>(null);

  const { data: systemSettings } = useSystemSettings();
  const updateSettingsMutation = useUpdateSystemSettings();

  // General settings state
  const [generalSettings, setGeneralSettings] = useState({
    platformName: 'AURA Medical',
    supportEmail: 'support@aura.med',
    timezone: 'UTC',
    language: 'en',
    maintenanceMode: false,
    minAdvanceBookingHours: 0.5,
    aiQuotaUnitPrice: 10000,
    defaultPlatformCommission: 0.05,
    freeAiQuota: 3,
  });

  // Trusted medical domains for AI resource search
  const [trustedDomains, setTrustedDomains] = useState<string[]>(
    DEFAULT_TRUSTED_DOMAINS
  );
  const [domainInput, setDomainInput] = useState('');

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
        defaultPlatformCommission: systemSettings['DEFAULT_PLATFORM_COMMISSION']
          ? parseFloat(systemSettings['DEFAULT_PLATFORM_COMMISSION'])
          : 0.05,
        freeAiQuota: systemSettings['FREE_AI_QUOTA']
          ? parseInt(systemSettings['FREE_AI_QUOTA'], 10)
          : 3,
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
      const settingsToUpdate = {
        MIN_ADVANCE_BOOKING_HOURS: Math.max(
          0.5,
          generalSettings.minAdvanceBookingHours
        ).toString(),
        AI_QUOTA_UNIT_PRICE: Math.max(
          1,
          generalSettings.aiQuotaUnitPrice
        ).toString(),
        DEFAULT_PLATFORM_COMMISSION: Math.max(
          0,
          generalSettings.defaultPlatformCommission
        ).toString(),
        FREE_AI_QUOTA: Math.max(0, generalSettings.freeAiQuota).toString(),
        TRUSTED_EYE_HEALTH_DOMAINS: trustedDomains.join(','),
      };
      await updateSettingsMutation.mutateAsync(settingsToUpdate);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
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
            Platform Name
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
            Support Email
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
            Timezone
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
            <option value="America/New_York">Eastern Time (ET)</option>
            <option value="America/Los_Angeles">Pacific Time (PT)</option>
            <option value="Europe/London">London (GMT)</option>
            <option value="Asia/Ho_Chi_Minh">Vietnam (ICT)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Default Language
          </label>
          <select
            value={generalSettings.language}
            onChange={(e) =>
              setGeneralSettings({
                ...generalSettings,
                language: e.target.value,
              })
            }
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
          >
            <option value="en">English</option>
            <option value="vi">Vietnamese</option>
            <option value="fr">French</option>
            <option value="es">Spanish</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Minimum advance booking time (hours)
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
            AI Quota Unit Price (VND per quota)
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
            Total purchase cost = quantity x unit price.
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Default Platform Commission Rate
          </label>
          <input
            type="number"
            min={0}
            max={1}
            step={0.01}
            value={generalSettings.defaultPlatformCommission}
            onChange={(e) =>
              setGeneralSettings({
                ...generalSettings,
                defaultPlatformCommission: parseFloat(e.target.value) || 0,
              })
            }
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Free AI Quota (Per Patient)
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
        <div className="md:col-span-2">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            This unit price is used directly by backend billing when purchasing
            AI quota.
          </p>
        </div>
      </div>

      {/* Trusted Medical Domains */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Trusted Medical Domains for AI Resources
          </label>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Google search results will be restricted to these domains (e.g.{' '}
            <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">
              vinmec.com
            </code>
            ).
          </p>
        </div>

        {/* Domain tags */}
        <div className="flex flex-wrap gap-2 min-h-[40px] p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          {trustedDomains.length === 0 && (
            <span className="text-xs text-slate-400 italic">
              No domains configured — using built-in defaults.
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
                aria-label={`Remove ${domain}`}
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
            placeholder="e.g. benhvienmathanoi.vn"
            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
          />
          <button
            type="button"
            onClick={addDomain}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-medium text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
        <div>
          <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-400">
            Maintenance Mode
          </h4>
          <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
            Enable to temporarily disable user access for system maintenance
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
          label: 'Email Notifications',
          description: 'Receive email notifications for important events',
        },
        {
          key: 'screeningAlerts',
          label: 'Screening Alerts',
          description: 'Get notified when new screenings need review',
        },
        {
          key: 'systemAlerts',
          label: 'System Alerts',
          description: 'Receive alerts about system health and issues',
        },
        {
          key: 'weeklyReports',
          label: 'Weekly Reports',
          description: 'Receive weekly summary reports via email',
        },
        {
          key: 'marketingEmails',
          label: 'Marketing Emails',
          description: 'Receive product updates and announcements',
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
            Require Two-Factor Authentication
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Require all users to enable 2FA for their accounts
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
            Session Timeout (minutes)
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
            Minimum Password Length
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
            Max Login Attempts
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
            IP Whitelist (comma separated)
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
            placeholder="192.168.1.1, 10.0.0.1"
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
                Database Backup
              </h4>
              <p className="text-xs text-slate-500">Last backup: 2 hours ago</p>
            </div>
          </div>
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-all">
            <RefreshCw className="w-4 h-4" />
            Create Backup Now
          </button>
        </div>

        <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                Export Data
              </h4>
              <p className="text-xs text-slate-500">Download all system data</p>
            </div>
          </div>
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-all">
            <Mail className="w-4 h-4" />
            Export to Email
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
              Danger Zone
            </h4>
            <p className="text-xs text-red-600 dark:text-red-500">
              Irreversible actions - proceed with caution
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2.5 rounded-lg border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 font-medium text-sm transition-all">
            Clear Cache
          </button>
          <button className="px-4 py-2.5 rounded-lg border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 font-medium text-sm transition-all">
            Reset Statistics
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
          title="System Settings"
          description="Configure system-wide settings and preferences"
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
              {isSaving ? 'Saving...' : 'Save Changes'}
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
                        <p className="text-sm font-medium">{section.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {section.description}
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
                    {settingSections.find((s) => s.id === activeSection)?.title}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    {
                      settingSections.find((s) => s.id === activeSection)
                        ?.description
                    }
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
