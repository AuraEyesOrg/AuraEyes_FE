import { useState, useEffect } from 'react';
import { Search, Download, Eye } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import OrganisationHeader from '../components/OrganisationHeader';
import type { OrganisationData } from '../types/organisation.types';

export default function PatientsPage() {
  const [data, setData] = useState<OrganisationData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    import('@/data/organisation-mock.json').then((module) => {
      setData(module.default as OrganisationData);
    });
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-[var(--bg-primary)]">
        <div className="text-gray-900 dark:text-white">Loading...</div>
      </div>
    );
  }

  const filteredPatients = data.recentPatients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' || patient.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getPriorityBadge = (priority: string) => {
    const colors = {
      high: 'bg-red-500/20 text-red-500',
      medium: 'bg-yellow-500/20 text-yellow-500',
      low: 'bg-green-500/20 text-green-500',
    };
    return colors[priority as keyof typeof colors] || colors.low;
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      'pending-review': 'bg-yellow-500/20 text-yellow-500',
      reviewed: 'bg-green-500/20 text-green-500',
      archived: 'bg-gray-500/20 text-gray-500',
    };
    return colors[status as keyof typeof colors] || colors['pending-review'];
  };

  return (
    <div className="flex h-screen w-full bg-[var(--bg-primary)]">
      <Sidebar pendingCount={data.dashboardStats.pendingReviews.value} />

      <div className="flex-1 h-full overflow-y-auto">
        <OrganisationHeader />

        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Patients
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage patient records and AI predictions
            </p>
          </div>

          {/* Filters & Search */}
          <div className="bg-white dark:bg-[#1e3a5f] rounded-xl p-6 border border-gray-200 dark:border-[#2d4a6f] mb-6">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#0a1f44] border border-gray-300 dark:border-[#2d4a6f] rounded-lg pl-10 pr-4 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-primary"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-gray-50 dark:bg-[#0a1f44] border border-gray-300 dark:border-[#2d4a6f] rounded-lg px-4 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-primary"
              >
                <option value="all">All Status</option>
                <option value="pending-review">Pending Review</option>
                <option value="reviewed">Reviewed</option>
                <option value="archived">Archived</option>
              </select>

              <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors">
                <Download size={18} />
                Export
              </button>
            </div>
          </div>

          {/* Patients Table */}
          <div className="bg-white dark:bg-[#1e3a5f] rounded-xl border border-gray-200 dark:border-[#2d4a6f] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-[#0a1f44]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Last Screening
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      AI Prediction
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Confidence
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-[#2d4a6f]">
                  {filteredPatients.map((patient) => (
                    <tr
                      key={patient.id}
                      className="hover:bg-gray-50 dark:hover:bg-[#0a1f44] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                            {patient.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                              {patient.name}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {patient.id} • {patient.age}y • {patient.gender}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          {new Date(patient.lastScreening).toLocaleDateString(
                            'vi-VN'
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          {patient.aiPrediction}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${patient.confidence}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {patient.confidence}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityBadge(patient.priority)}`}
                        >
                          {patient.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(patient.status)}`}
                        >
                          {patient.status.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
