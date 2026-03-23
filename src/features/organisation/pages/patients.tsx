import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, XCircle } from 'lucide-react';
import Spinner from '@/components/ui/spinner';
import Sidebar from '../components/Sidebar';
import OrganisationHeader from '../components/OrganisationHeader';
import {
  getOrganisationRecentPatients,
  type OrganisationRecentPatientDto,
} from '../api/patients.api';

function normalize(s: string | null | undefined): string {
  return (s ?? '').trim().toLowerCase();
}

function getPriorityBadge(priority: string) {
  const colors: Record<string, string> = {
    high: 'bg-red-500/20 text-red-600',
    medium: 'bg-yellow-500/20 text-yellow-600',
    low: 'bg-green-500/20 text-green-600',
  };
  return colors[normalize(priority)] ?? colors.low;
}

function getStatusBadge(status: string) {
  const colors: Record<string, string> = {
    'pending-review': 'bg-yellow-500/20 text-yellow-600',
    reviewed: 'bg-green-500/20 text-green-600',
    archived: 'bg-gray-500/20 text-gray-600',
  };
  return colors[normalize(status)] ?? colors['pending-review'];
}

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const patientsQuery = useQuery({
    queryKey: ['organisation-patients', 'recent'],
    queryFn: getOrganisationRecentPatients,
    staleTime: 30_000,
  });

  const patients = patientsQuery.data ?? [];

  const filteredPatients = useMemo(() => {
    const q = normalize(searchTerm);
    const status = filterStatus === 'all' ? 'all' : normalize(filterStatus);

    return patients.filter((p) => {
      const matchesSearch =
        !q || normalize(p.name).includes(q) || normalize(p.id).includes(q);
      const matchesStatus = status === 'all' || normalize(p.status) === status;
      return matchesSearch && matchesStatus;
    });
  }, [patients, searchTerm, filterStatus]);

  const pendingCount = useMemo(
    () =>
      patients.filter((p) => normalize(p.status) === 'pending-review').length,
    [patients]
  );

  const clearDisabled =
    searchTerm.trim() === '' && normalize(filterStatus) === 'all';

  if (patientsQuery.isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-[var(--bg-primary)]">
        <Spinner size={36} />
      </div>
    );
  }

  if (patientsQuery.isError) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-[var(--bg-primary)]">
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-5 text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          <div className="font-medium">Unable to load patients.</div>
          <button
            type="button"
            onClick={() => patientsQuery.refetch()}
            className="mt-3 text-sm font-medium underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[var(--bg-primary)]">
      <Sidebar pendingCount={pendingCount} />

      <div className="flex-1 h-full overflow-y-auto">
        <OrganisationHeader />

        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Patients
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Recent patient screenings and AI predictions for this
              organisation.
            </p>
          </div>

          <div className="bg-white dark:bg-[#1e3a5f] rounded-xl p-6 border border-gray-200 dark:border-[#2d4a6f] mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[220px] relative">
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

              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                }}
                disabled={clearDisabled}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors border border-gray-200 dark:border-[#2d4a6f] bg-white dark:bg-[#1e3a5f] disabled:opacity-50 disabled:cursor-not-allowed"
                title="Clear search and status filter"
              >
                <XCircle size={16} />
                Clear
              </button>
            </div>
          </div>

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
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-[#2d4a6f]">
                  {filteredPatients.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                      >
                        No patients match your search/filters.
                      </td>
                    </tr>
                  ) : (
                    filteredPatients.map(
                      (patient: OrganisationRecentPatientDto) => (
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
                                  {patient.id} • {patient.age}y •{' '}
                                  {patient.gender}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-700 dark:text-gray-300">
                              {new Date(
                                patient.lastScreening
                              ).toLocaleDateString('vi-VN')}
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
                        </tr>
                      )
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
