import { useState } from 'react';
import { Save, Building, Users, Bell, Lock, Database } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import OrganisationHeader from '../components/OrganisationHeader';
import useAuthStore from '@/store/auth-store';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('clinic');
  const displayName = user?.fullName ?? 'Organisation';
  const displayEmail = user?.email ?? '';

  const tabs = [
    { id: 'clinic', label: 'Clinic Info', icon: Building },
    { id: 'users', label: 'Users & Roles', icon: Users },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'data', label: 'Data Management', icon: Database },
  ];

  return (
    <div className="flex h-screen w-full bg-(--bg-primary)">
      <Sidebar />

      <div className="flex-1 h-full overflow-y-auto">
        <OrganisationHeader pageName="Settings" />

        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-(--text-primary) mb-2">
              Settings
            </h1>
            <p className="text-(--text-secondary)">
              Manage your organisation configuration and preferences
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Tabs Sidebar */}
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

            {/* Content Area */}
            <div className="lg:col-span-3">
              <div className="bg-(--bg-secondary) rounded-xl p-6 border border-(--border-primary)">
                {activeTab === 'clinic' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-(--text-primary) mb-4">
                      Organisation Information
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-(--text-tertiary) mb-2">
                          Organisation Name
                        </label>
                        <input
                          type="text"
                          defaultValue={displayName}
                          className="w-full bg-(--bg-primary) border border-(--border-primary) rounded-lg px-4 py-2 text-(--text-primary) focus:outline-none focus:border-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-(--text-tertiary) mb-2">
                          Location
                        </label>
                        <input
                          type="text"
                          placeholder="Enter clinic location"
                          className="w-full bg-(--bg-primary) border border-(--border-primary) rounded-lg px-4 py-2 text-(--text-primary) focus:outline-none focus:border-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-(--text-tertiary) mb-2">
                          Administrator
                        </label>
                        <input
                          type="text"
                          defaultValue={displayName}
                          className="w-full bg-(--bg-primary) border border-(--border-primary) rounded-lg px-4 py-2 text-(--text-primary) focus:outline-none focus:border-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-(--text-tertiary) mb-2">
                          Contact Email
                        </label>
                        <input
                          type="email"
                          defaultValue={displayEmail}
                          placeholder="clinic@auraeyes.vn"
                          className="w-full bg-(--bg-primary) border border-(--border-primary) rounded-lg px-4 py-2 text-(--text-primary) focus:outline-none focus:border-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-(--text-tertiary) mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          placeholder="+84 28 xxxx xxxx"
                          className="w-full bg-(--bg-primary) border border-(--border-primary) rounded-lg px-4 py-2 text-(--text-primary) focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'users' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-(--text-primary) mb-4">
                      Team Members
                    </h3>
                    <p className="text-sm text-(--text-secondary)">
                      Team member management coming soon.
                    </p>
                    <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-(--bg-primary) border-2 border-dashed border-(--border-primary) rounded-lg text-(--text-tertiary) hover:border-primary hover:text-primary transition-colors">
                      <Users size={20} />
                      Add Team Member
                    </button>
                  </div>
                )}

                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-(--text-primary) mb-4">
                      Notification Preferences
                    </h3>

                    <div className="space-y-4">
                      {[
                        {
                          label: 'Critical case alerts',
                          description:
                            'Immediate notification for high-priority cases',
                        },
                        {
                          label: 'Daily summary reports',
                          description: 'Daily digest of screening activities',
                        },
                        {
                          label: 'Appointment reminders',
                          description: 'Reminders for upcoming appointments',
                        },
                        {
                          label: 'System maintenance alerts',
                          description:
                            'Notifications about scheduled maintenance',
                        },
                      ].map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 rounded-lg bg-(--bg-primary) border border-(--border-primary)"
                        >
                          <div>
                            <div className="text-sm font-semibold text-(--text-primary) mb-1">
                              {item.label}
                            </div>
                            <div className="text-xs text-(--text-tertiary)">
                              {item.description}
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              defaultChecked
                            />
                            <div className="w-11 h-6 bg-gray-300 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-(--text-primary) mb-4">
                      Security Settings
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-(--text-tertiary) mb-2">
                          Two-Factor Authentication
                        </label>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-(--bg-primary) border border-(--border-primary)">
                          <span className="text-sm text-(--text-secondary)">
                            Enable 2FA for enhanced security
                          </span>
                          <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors text-sm">
                            Enable
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-(--text-tertiary) mb-2">
                          Session Timeout
                        </label>
                        <select className="w-full bg-(--bg-primary) border border-(--border-primary) rounded-lg px-4 py-2 text-(--text-primary) focus:outline-none focus:border-primary">
                          <option>15 minutes</option>
                          <option>30 minutes</option>
                          <option>1 hour</option>
                          <option>2 hours</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'data' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-(--text-primary) mb-4">
                      Data Management
                    </h3>

                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-(--bg-primary) border border-(--border-primary)">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-(--text-primary)">
                            Export Patient Data
                          </span>
                          <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors text-sm">
                            Export
                          </button>
                        </div>
                        <p className="text-xs text-(--text-tertiary)">
                          Download all patient records and screening results
                        </p>
                      </div>

                      <div className="p-4 rounded-lg bg-(--bg-primary) border border-(--border-primary)">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-(--text-primary)">
                            Data Retention Policy
                          </span>
                          <button className="px-4 py-2 bg-(--bg-secondary) border border-(--border-primary) text-(--text-primary) rounded-lg hover:border-primary transition-colors text-sm">
                            Configure
                          </button>
                        </div>
                        <p className="text-xs text-(--text-tertiary)">
                          Set how long patient data is stored
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <div className="mt-6 pt-6 border-t border-(--border-primary)">
                  <button className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors">
                    <Save size={18} />
                    Save Changes
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
