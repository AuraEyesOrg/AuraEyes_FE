import { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search, XCircle, Plus, ScanEye, Pencil, History } from 'lucide-react';
import { toast } from 'react-toastify';
import Spinner from '@/components/ui/spinner';
import { resolvePathWithLocale } from '@/i18n/middleware';
import Sidebar from '../components/Sidebar';
import OrganisationHeader from '../components/OrganisationHeader';
import AvatarFallback from '@/components/ui/avatar-fallback';
import CreateWalkInPatientModal from '../components/CreateWalkInPatientModal';
import UpdatePatientContactModal from '../components/UpdatePatientContactModal';
import {
  getOrganisationRecentPatients,
  type OrganisationRecentPatientDto,
} from '../api/patients.api';

function normalize(s: string | null | undefined): string {
  return (s ?? '').trim().toLowerCase();
}

function getRiskBadge(priority: string) {
  const p = normalize(priority);
  if (p === 'high')
    return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
  if (p === 'medium')
    return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
  return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
}

export default function PatientsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] =
    useState<OrganisationRecentPatientDto | null>(null);

  const patientsQuery = useQuery({
    queryKey: ['organisation-patients', 'recent'],
    queryFn: getOrganisationRecentPatients,
    staleTime: 30_000,
  });

  const patients = patientsQuery.data ?? [];

  const filteredPatients = useMemo(() => {
    const q = normalize(searchTerm);
    if (!q) return patients;
    return patients.filter(
      (p) =>
        normalize(p.name).includes(q) ||
        (p.phoneNumber && normalize(p.phoneNumber).includes(q))
    );
  }, [patients, searchTerm]);

  const clearDisabled = searchTerm.trim() === '';

  useEffect(() => {
    if (patientsQuery.isError) {
      toast.error('Unable to load patients.');
    }
  }, [patientsQuery.isError]);

  if (patientsQuery.isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-(--bg-primary)">
        <Spinner size={36} />
      </div>
    );
  }

  if (patientsQuery.isError) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-(--bg-primary)">
        <div className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
          <div className="font-medium mb-3">Unable to load patients</div>
          <button
            type="button"
            onClick={() => patientsQuery.refetch()}
            className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const handleScreenPatient = (patientId: string) => {
    navigate(
      resolvePathWithLocale(`/organisation/screening?patientId=${patientId}`)
    );
  };

  const handleViewPatientHistory = (patientId: string) => {
    navigate(
      resolvePathWithLocale(`/organisation/patients/${patientId}/history`)
    );
  };

  return (
    <div className="flex h-screen w-full bg-(--bg-primary)">
      <Sidebar />

      <div className="flex-1 h-full overflow-y-auto">
        <OrganisationHeader pageName="Patients" />

        <main className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-2xl font-bold text-(--text-primary)">
                  Patients
                </h1>
                <p className="text-sm text-(--text-secondary)">
                  Manage your organisation's patient records and screenings
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsWalkInModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition shadow-lg shadow-primary/25 shrink-0"
            >
              <Plus className="w-4 h-4" /> Walk-in Patient
            </button>
          </div>

          {/* Search Bar */}
          <div className="rounded-2xl bg-(--bg-secondary) border border-(--border-primary) p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-(--text-tertiary)"
                />
                <input
                  type="text"
                  placeholder="Search by name or phone number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-(--bg-primary) border border-(--border-primary) rounded-xl pl-11 pr-4 py-2.5 text-sm text-(--text-primary) placeholder:text-(--text-tertiary) focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                />
              </div>

              <button
                type="button"
                onClick={() => setSearchTerm('')}
                disabled={clearDisabled}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-(--border-primary) bg-(--bg-primary) text-(--text-secondary) hover:bg-(--bg-tertiary) disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <XCircle size={16} />
                Clear
              </button>
            </div>
          </div>

          {/* Results summary */}
          <p className="text-sm text-(--text-tertiary) mb-3 px-1">
            {filteredPatients.length} patient
            {filteredPatients.length !== 1 ? 's' : ''} found
          </p>

          {/* Patient Table */}
          <div className="rounded-2xl bg-(--bg-secondary) border border-(--border-primary) overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-(--border-primary)">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-(--text-tertiary) uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-(--text-tertiary) uppercase tracking-wider">
                      Last Screening
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-(--text-tertiary) uppercase tracking-wider">
                      AI Prediction
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-(--text-tertiary) uppercase tracking-wider">
                      Risk
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-(--text-tertiary) uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--border-primary)">
                  {filteredPatients.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-12 text-center text-sm text-(--text-tertiary)"
                      >
                        No patients match your search.
                      </td>
                    </tr>
                  ) : (
                    filteredPatients.map(
                      (patient: OrganisationRecentPatientDto) => (
                        <tr
                          key={patient.id}
                          className="hover:bg-(--bg-tertiary) transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <AvatarFallback
                                fullName={patient.name}
                                avatarUrl={`${import.meta.env.VITE_AVATAR_FALLBACK_URL}${encodeURIComponent(patient.id.slice(0, 8))}`}
                                size="w-10 h-10"
                              />
                              <div>
                                <div className="text-sm font-semibold text-(--text-primary)">
                                  {patient.name}
                                </div>
                                <div className="text-xs text-(--text-tertiary)">
                                  {patient.age}y ·{' '}
                                  {patient.gender === 'M' ? 'Male' : 'Female'}
                                  {patient.phoneNumber &&
                                    ` · ${patient.phoneNumber}`}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-(--text-secondary)">
                              {patient.lastScreening
                                ? new Date(
                                    patient.lastScreening
                                  ).toLocaleDateString('vi-VN')
                                : '—'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-(--text-secondary)">
                              {patient.aiPrediction || '—'}
                            </div>
                            {patient.confidence > 0 && (
                              <div className="flex items-center gap-2 mt-1">
                                <div className="w-16 h-1.5 bg-(--border-primary) rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-primary rounded-full"
                                    style={{ width: `${patient.confidence}%` }}
                                  />
                                </div>
                                <span className="text-xs text-(--text-tertiary)">
                                  {patient.confidence}%
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${getRiskBadge(patient.priority)}`}
                            >
                              {patient.priority || 'low'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingPatient(patient)}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-(--bg-tertiary) px-3.5 py-1.5 text-xs font-semibold text-(--text-secondary) transition hover:bg-(--bg-primary)"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                                Edit Contact
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleViewPatientHistory(patient.id)
                                }
                                className="inline-flex items-center gap-1.5 rounded-lg bg-(--bg-tertiary) px-3.5 py-1.5 text-xs font-semibold text-(--text-secondary) transition hover:bg-(--bg-primary)"
                              >
                                <History className="h-3.5 w-3.5" />
                                View History
                              </button>
                              <button
                                type="button"
                                onClick={() => handleScreenPatient(patient.id)}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/20"
                              >
                                <ScanEye className="h-3.5 w-3.5" />
                                Screen Now
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <CreateWalkInPatientModal
            isOpen={isWalkInModalOpen}
            onClose={() => setIsWalkInModalOpen(false)}
            onSuccess={() => {
              setIsWalkInModalOpen(false);
              patientsQuery.refetch();
            }}
          />

          <UpdatePatientContactModal
            isOpen={editingPatient !== null}
            patient={editingPatient}
            onClose={() => setEditingPatient(null)}
            onSuccess={() => {
              setEditingPatient(null);
              patientsQuery.refetch();
            }}
          />
        </main>
      </div>
    </div>
  );
}
