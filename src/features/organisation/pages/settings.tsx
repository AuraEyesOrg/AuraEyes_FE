import { useState, useEffect } from 'react';
import { Save, Building, Users, Bell, Lock, Database } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import OrganisationHeader from '../components/OrganisationHeader';
import { OrganisationData } from '../types/organisation.types';

export default function SettingsPage() {
  const [data, setData] = useState<OrganisationData | null>(null);
  const [activeTab, setActiveTab] = useState('clinic');

  useEffect(() => {
    import('@/data/organisation-mock.json').then((module) => {
      setData(module.default as OrganisationData);
    });
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a1929]">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const tabs = [
    { id: 'clinic', label: 'Clinic Info', icon: Building },
    { id: 'users', label: 'Users & Roles', icon: Users },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'data', label: 'Data Management', icon: Database },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a1929]">
      <Sidebar pendingCount={data.dashboardStats.pendingReviews.value} />

      <div className="ml-48">
        <OrganisationHeader />

        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your clinic configuration and preferences
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Tabs Sidebar */}
            <div className="bg-white dark:bg-[#1e3a5f] rounded-xl p-4 border border-gray-200 dark:border-[#2d4a6f] h-fit">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#0a1f44]'
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
              <div className="bg-white dark:bg-[#1e3a5f] rounded-xl p-6 border border-gray-200 dark:border-[#2d4a6f]">
                {activeTab === 'clinic' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Clinic Information
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                            Clinic Name
                          </label>
                          <input
                            type="text"
                            defaultValue={data.clinic.name}
                            className="w-full bg-gray-50 dark:bg-[#0a1f44] border border-gray-300 dark:border-[#2d4a6f] rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                            Location
                          </label>
                          <input
                            type="text"
                            defaultValue={data.clinic.location}
                            className="w-full bg-gray-50 dark:bg-[#0a1f44] border border-gray-300 dark:border-[#2d4a6f] rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                            Administrator
                          </label>
                          <input
                            type="text"
                            defaultValue={data.clinic.admin}
                            className="w-full bg-gray-50 dark:bg-[#0a1f44] border border-gray-300 dark:border-[#2d4a6f] rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                            Contact Email
                          </label>
                          <input
                            type="email"
                            placeholder="clinic@auravision.vn"
                            className="w-full bg-gray-50 dark:bg-[#0a1f44] border border-gray-300 dark:border-[#2d4a6f] rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            placeholder="+84 28 xxxx xxxx"
                            className="w-full bg-gray-50 dark:bg-[#0a1f44] border border-gray-300 dark:border-[#2d4a6f] rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'users' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Team Members
                      </h3>

                      <div className="space-y-4">
                        {data.doctors.map((doctor) => (
                          <div
                            key={doctor.id}
                            className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-[#0a1f44] border border-gray-200 dark:border-[#2d4a6f]"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                                {doctor.name.split(' ').pop()?.charAt(0)}
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {doctor.name}
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                  {doctor.specialty}
                                </div>
                              </div>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {doctor.patientsReviewed} patients reviewed
                            </div>
                          </div>
                        ))}

                        <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#0a1f44] dark:bg-[#0a1f44] light:bg-gray-50 border-2 border-dashed border-[#2d4a6f] dark:border-[#2d4a6f] light:border-gray-300 rounded-lg text-gray-400 dark:text-gray-400 light:text-gray-600 hover:border-primary hover:text-primary transition-colors">
                          <Users size={20} />
                          Add Team Member
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
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
                            className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-[#0a1f44] border border-gray-200 dark:border-[#2d4a6f]"
                          >
                            <div>
                              <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                                {item.label}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
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
                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Security Settings
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                            Two-Factor Authentication
                          </label>
                          <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-[#0a1f44] border border-gray-200 dark:border-[#2d4a6f]">
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              Enable 2FA for enhanced security
                            </span>
                            <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors text-sm">
                              Enable
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                            Session Timeout
                          </label>
                          <select className="w-full bg-gray-50 dark:bg-[#0a1f44] border border-gray-300 dark:border-[#2d4a6f] rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-primary">
                            <option>15 minutes</option>
                            <option>30 minutes</option>
                            <option>1 hour</option>
                            <option>2 hours</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'data' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Data Management
                      </h3>

                      <div className="space-y-4">
                        <div className="p-4 rounded-lg bg-gray-50 dark:bg-[#0a1f44] border border-gray-200 dark:border-[#2d4a6f]">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                              Export Patient Data
                            </span>
                            <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors text-sm">
                              Export
                            </button>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Download all patient records and screening results
                          </p>
                        </div>

                        <div className="p-4 rounded-lg bg-gray-50 dark:bg-[#0a1f44] border border-gray-200 dark:border-[#2d4a6f]">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                              Data Retention Policy
                            </span>
                            <button className="px-4 py-2 bg-gray-100 dark:bg-[#1e3a5f] border border-gray-300 dark:border-[#2d4a6f] text-gray-900 dark:text-white rounded-lg hover:border-primary transition-colors text-sm">
                              Configure
                            </button>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Set how long patient data is stored
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-[#2d4a6f]">
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
