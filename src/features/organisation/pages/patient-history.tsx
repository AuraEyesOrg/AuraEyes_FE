import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Eye,
  FileText,
  Loader2,
  ScanEye,
  UserRound,
} from 'lucide-react';
import Spinner from '@/components/ui/spinner';
import { unwrapApiData } from '@/types/api-response';
import { resolvePathWithLocale } from '@/i18n/middleware';
import Sidebar from '../components/Sidebar';
import OrganisationHeader from '../components/OrganisationHeader';
import {
  getOrganisationRecentPatients,
  type OrganisationRecentPatientDto,
} from '../api/patients.api';
import {
  orgScreeningApi,
  type OrgScreeningHistoryItem,
} from '../api/screening.api';
import type { OrgScreeningSessionDetail } from '../types/screening-result.types';

function getRiskClass(riskLevel?: string): string {
  const normalized = riskLevel?.toLowerCase();

  if (normalized === 'high') {
    return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
  }

  if (normalized === 'moderate') {
    return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
  }

  return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
}

function getStatusClass(status: OrgScreeningHistoryItem['status']): string {
  if (status === 'completed') {
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
  }

  if (status === 'saved') {
    return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
  }

  return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
}

function formatStatus(status: OrgScreeningHistoryItem['status']): string {
  if (status === 'completed') return 'Completed';
  if (status === 'saved') return 'Saved';
  return 'Pending';
}

export default function OrganisationPatientHistoryPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const highlightedScreeningId = searchParams.get('screeningId');
  const [selectedScreeningId, setSelectedScreeningId] = useState<string | null>(
    highlightedScreeningId
  );

  const patientsQuery = useQuery({
    queryKey: ['organisation-patients', 'recent'],
    queryFn: getOrganisationRecentPatients,
    staleTime: 30_000,
  });

  const screeningHistoryQuery = useQuery({
    queryKey: ['org-screening-history', 'patient-timeline'],
    queryFn: () => orgScreeningApi.getHistory(100),
    staleTime: 30_000,
  });

  const patient = useMemo<OrganisationRecentPatientDto | null>(() => {
    if (!patientId) return null;
    return (
      (patientsQuery.data ?? []).find((item) => item.id === patientId) ?? null
    );
  }, [patientsQuery.data, patientId]);

  const patientHistory = useMemo(() => {
    if (!patientId) return [];
    return (screeningHistoryQuery.data ?? []).filter(
      (item) => item.patientId === patientId
    );
  }, [screeningHistoryQuery.data, patientId]);

  useEffect(() => {
    if (patientHistory.length === 0) {
      setSelectedScreeningId(null);
      return;
    }

    if (
      highlightedScreeningId &&
      patientHistory.some((item) => item.screeningId === highlightedScreeningId)
    ) {
      setSelectedScreeningId(highlightedScreeningId);
      return;
    }

    if (
      selectedScreeningId &&
      patientHistory.some((item) => item.screeningId === selectedScreeningId)
    ) {
      return;
    }

    setSelectedScreeningId(patientHistory[0].screeningId);
  }, [highlightedScreeningId, patientHistory, selectedScreeningId]);

  const selectedHistoryItem = useMemo(() => {
    if (!selectedScreeningId) return null;
    return (
      patientHistory.find((item) => item.screeningId === selectedScreeningId) ??
      null
    );
  }, [patientHistory, selectedScreeningId]);

  const screeningDetailQuery = useQuery({
    queryKey: ['org-screening-detail', selectedScreeningId],
    enabled: Boolean(selectedScreeningId),
    queryFn: async () => {
      if (!selectedScreeningId) return null;
      const response =
        await orgScreeningApi.getSessionDetail(selectedScreeningId);
      return unwrapApiData<OrgScreeningSessionDetail>(response);
    },
  });

  const openScreeningResult = () => {
    if (!selectedScreeningId) return;

    const patientName = patient?.name || selectedHistoryItem?.patientName;

    navigate(
      resolvePathWithLocale(
        `/organisation/screening/result?id=${selectedScreeningId}`
      ),
      patientName
        ? {
            state: {
              patientName,
            },
          }
        : undefined
    );
  };

  const isLoading = patientsQuery.isLoading || screeningHistoryQuery.isLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-(--bg-primary)">
        <Spinner size={36} />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-(--bg-primary)">
      <Sidebar />

      <div className="flex-1 h-full overflow-y-auto">
        <OrganisationHeader pageName="Patient History" />

        <main className="p-6 space-y-6">
          <section className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <button
                type="button"
                onClick={() =>
                  navigate(resolvePathWithLocale('/organisation/patients'))
                }
                className="inline-flex items-center gap-2 text-sm font-medium text-(--text-secondary) hover:text-(--text-primary)"
              >
                <ArrowLeft className="h-4 w-4" /> Back to patients
              </button>

              <h1 className="mt-3 text-2xl font-bold text-(--text-primary)">
                Patient Screening Timeline
              </h1>
              <p className="text-sm text-(--text-secondary)">
                Review every screening session, retinal images, and saved record
                for this patient.
              </p>
            </div>

            {patient && (
              <div className="rounded-2xl border border-(--border-primary) bg-(--bg-secondary) px-5 py-4 min-w-[280px]">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <UserRound className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-(--text-primary)">
                      {patient.name}
                    </p>
                    <p className="text-xs text-(--text-tertiary)">
                      {patient.gender === 'M' ? 'Male' : 'Female'} ·{' '}
                      {patient.age}y
                      {patient.phoneNumber ? ` · ${patient.phoneNumber}` : ''}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,400px)_minmax(0,1fr)]">
            <section className="rounded-2xl border border-(--border-primary) bg-(--bg-secondary) overflow-hidden">
              <div className="px-5 py-4 border-b border-(--border-primary)">
                <h2 className="text-base font-bold text-(--text-primary)">
                  Screening Sessions
                </h2>
                <p className="text-xs text-(--text-tertiary)">
                  {patientHistory.length} sessions found
                </p>
              </div>

              <div className="max-h-[640px] overflow-y-auto p-3 space-y-2">
                {patientHistory.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-(--border-primary) p-4 text-sm text-(--text-tertiary)">
                    This patient has no organisation screening history yet.
                  </div>
                ) : (
                  patientHistory.map((item) => {
                    const selected = selectedScreeningId === item.screeningId;
                    return (
                      <button
                        key={item.screeningId}
                        type="button"
                        onClick={() => setSelectedScreeningId(item.screeningId)}
                        className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                          selected
                            ? 'border-primary bg-primary/5'
                            : 'border-(--border-primary) bg-(--bg-primary) hover:bg-(--bg-tertiary)'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-(--text-primary)">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-(--text-tertiary)">
                              {new Date(item.createdAt).toLocaleTimeString()}
                            </p>
                          </div>

                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(item.status)}`}
                          >
                            {formatStatus(item.status)}
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 font-semibold ${getRiskClass(item.latestRiskLevel)}`}
                          >
                            {item.latestRiskLevel ?? 'Low'}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-(--bg-tertiary) px-2.5 py-1 text-(--text-secondary)">
                            <Eye className="h-3.5 w-3.5" /> {item.imagesCount}{' '}
                            images
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-(--bg-tertiary) px-2.5 py-1 text-(--text-secondary)">
                            <Clock3 className="h-3.5 w-3.5" />
                            {item.confidenceScore
                              ? `${item.confidenceScore}%`
                              : 'N/A'}
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-(--border-primary) bg-(--bg-secondary) overflow-hidden">
              <div className="px-5 py-4 border-b border-(--border-primary) flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-(--text-primary)">
                    Session Detail
                  </h2>
                  <p className="text-xs text-(--text-tertiary)">
                    Retinal images and saved clinical record for the selected
                    session.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openScreeningResult}
                  disabled={!selectedScreeningId}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/20 disabled:opacity-50"
                >
                  <ScanEye className="h-3.5 w-3.5" /> Open review page
                </button>
              </div>

              {!selectedScreeningId ? (
                <div className="p-6 text-sm text-(--text-tertiary)">
                  Select a session from the left to view details.
                </div>
              ) : screeningDetailQuery.isLoading ? (
                <div className="p-10 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : screeningDetailQuery.data ? (
                <div className="p-5 space-y-5">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div className="rounded-xl bg-(--bg-primary) border border-(--border-primary) px-3.5 py-3">
                      <p className="text-xs text-(--text-tertiary)">
                        Created at
                      </p>
                      <p className="text-sm font-semibold text-(--text-primary)">
                        {new Date(
                          screeningDetailQuery.data.createdAt
                        ).toLocaleString()}
                      </p>
                    </div>
                    <div className="rounded-xl bg-(--bg-primary) border border-(--border-primary) px-3.5 py-3">
                      <p className="text-xs text-(--text-tertiary)">
                        Model version
                      </p>
                      <p className="text-sm font-semibold text-(--text-primary)">
                        {screeningDetailQuery.data.modelVersion}
                      </p>
                    </div>
                    <div className="rounded-xl bg-(--bg-primary) border border-(--border-primary) px-3.5 py-3">
                      <p className="text-xs text-(--text-tertiary)">
                        Session status
                      </p>
                      <p className="text-sm font-semibold text-(--text-primary)">
                        {selectedHistoryItem
                          ? formatStatus(selectedHistoryItem.status)
                          : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-(--text-primary) flex items-center gap-2 mb-3">
                      <CalendarDays className="h-4 w-4 text-primary" />
                      Retinal images
                    </h3>
                    {(screeningDetailQuery.data.images ?? []).length === 0 ? (
                      <div className="rounded-xl border border-dashed border-(--border-primary) p-4 text-sm text-(--text-tertiary)">
                        No retinal images were found for this session.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {screeningDetailQuery.data.images.map((image) => (
                          <div
                            key={image.id}
                            className="rounded-xl overflow-hidden border border-(--border-primary) bg-(--bg-primary)"
                          >
                            <img
                              src={image.imageUrl}
                              alt={`Retinal image ${image.eyeSide}`}
                              className="h-40 w-full object-cover"
                            />
                            <div className="px-3 py-2 text-xs text-(--text-secondary) border-t border-(--border-primary)">
                              Eye side: {image.eyeSide}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-(--text-primary) flex items-center gap-2 mb-3">
                      <FileText className="h-4 w-4 text-primary" />
                      Saved record
                    </h3>

                    {screeningDetailQuery.data.latestResult ? (
                      <div className="rounded-xl border border-(--border-primary) bg-(--bg-primary) p-4 space-y-4">
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                          <div>
                            <p className="text-xs text-(--text-tertiary)">
                              Risk level
                            </p>
                            <p className="text-sm font-semibold text-(--text-primary)">
                              {screeningDetailQuery.data.latestResult.riskLevel}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-(--text-tertiary)">
                              Confidence
                            </p>
                            <p className="text-sm font-semibold text-(--text-primary)">
                              {
                                screeningDetailQuery.data.latestResult
                                  .confidenceScore
                              }
                              %
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-(--text-tertiary)">
                              Saved at
                            </p>
                            <p className="text-sm font-semibold text-(--text-primary)">
                              {new Date(
                                screeningDetailQuery.data.latestResult
                                  .assessedAt
                              ).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-(--text-tertiary)">
                            Summary
                          </p>
                          <p className="mt-1 text-sm text-(--text-secondary) whitespace-pre-wrap">
                            {screeningDetailQuery.data.latestResult.summary ||
                              'No summary'}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-(--text-tertiary)">
                            Findings / Note
                          </p>
                          <p className="mt-1 text-sm text-(--text-secondary) whitespace-pre-wrap">
                            {screeningDetailQuery.data.latestResult.findings ||
                              'No findings'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-900/20 dark:border-amber-900/40 dark:text-amber-300">
                        This session is not saved yet. Open the review page to
                        save the record.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-6 text-sm text-(--text-tertiary)">
                  Unable to load this screening detail.
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
