/**
 * Ophthalmologist Management Page
 * System Admin view for managing ophthalmologists - request status, fees, feedback
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Stethoscope,
  UserCheck,
  Clock,
  DollarSign,
  Star,
  Search,
  Download,
  Eye,
  MoreVertical,
  XCircle,
  AlertCircle,
  MessageSquare,
  Wallet,
  Activity,
  Circle,
  Pencil,
  Trash2,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import StatsCard from '../components/StatsCard';
import DataTable, { type TableColumn } from '../components/DataTable';
import { exportApi } from '../api';
import {
  ophthalmologistApi,
  type FeedbackRatingSummary,
  type OphthalmologistListItem,
} from '../api/ophthalmologist.api';
import { formatCurrency, vndCurrencyOptions } from '@/lib/helper';
import { buildTimestampedFileName, downloadXlsxFile } from '@/lib/file-export';
import { extractApiErrorMessage } from '@/lib/api-error';
import { toast } from 'react-toastify';
import ConfirmModal from '@/components/ui/confirm-modal';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';

interface Ophthalmologist extends OphthalmologistListItem {
  // UI mapped fields
  name: string;
  status: 'available' | 'busy' | 'unavailable' | 'fully_booked';
  totalRequests: number;
  pendingRequests: number;
  completedRequests: number;
  monthlyEarnings: number;
  totalEarnings: number;
  pendingPayouts: number;
  averageRating: number;
  totalReviews: number;
  lastActive?: string;
  joinedAt: string;
  newConsultationFee: number;
}

/** Map API item to UI Ophthalmologist model */
const mapToUiModel = (
  item: OphthalmologistListItem,
  locale: 'en-US' | 'vi-VN',
  ratingSummary?: FeedbackRatingSummary | null
): Ophthalmologist => ({
  ...item,
  name: item.fullName,
  status: 'available',
  totalRequests: 0,
  pendingRequests: 0,
  completedRequests: 0,
  monthlyEarnings: 0,
  totalEarnings: 0,
  pendingPayouts: 0,
  averageRating: Number(
    item.ratingAverage ?? ratingSummary?.ratingAverage ?? 0
  ),
  totalReviews: Number(item.ratingCount ?? ratingSummary?.ratingCount ?? 0),
  joinedAt: new Date(item.createdAt).toLocaleDateString(locale),
  newConsultationFee: item.consultationFee ?? 0,
});

type TabType = 'overview' | 'requests' | 'feedback';

type DoctorStatus = 'available' | 'busy' | 'unavailable' | 'fully_booked';

const statusConfig: Record<DoctorStatus, { color: string; dotColor: string }> =
  {
    available: {
      color: 'text-emerald-600 dark:text-emerald-400',
      dotColor: 'bg-emerald-500',
    },
    busy: {
      color: 'text-amber-600 dark:text-amber-400',
      dotColor: 'bg-amber-500',
    },
    unavailable: {
      color: 'text-slate-500 dark:text-slate-400',
      dotColor: 'bg-slate-400',
    },
    fully_booked: {
      color: 'text-red-600 dark:text-red-400',
      dotColor: 'bg-red-500',
    },
  };

export default function OphthalmologistsPage() {
  const { t } = useSafeTranslation();
  const { i18n } = useTranslation();
  const locale: 'en-US' | 'vi-VN' = i18n.resolvedLanguage?.startsWith('en')
    ? 'en-US'
    : 'vi-VN';
  const doctorStatusLabels: Record<DoctorStatus, string> = useMemo(
    () => ({
      available: t(
        'SystemAdmin.ophthalmologists.status.available',
        'Available'
      ),
      busy: t('SystemAdmin.ophthalmologists.status.busy', 'Busy'),
      unavailable: t(
        'SystemAdmin.ophthalmologists.status.unavailable',
        'Unavailable'
      ),
      fully_booked: t(
        'SystemAdmin.ophthalmologists.status.fullyBooked',
        'Fully Booked'
      ),
    }),
    [t]
  );

  const [ophthalmologists, setOphthalmologists] = useState<Ophthalmologist[]>(
    []
  );
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<Ophthalmologist | null>(
    null
  );
  const [isExporting, setIsExporting] = useState(false);
  const [actionMenuDoctorId, setActionMenuDoctorId] = useState<string | null>(
    null
  );
  const [deletingDoctorId, setDeletingDoctorId] = useState<string | null>(null);
  const [deleteTargetDoctor, setDeleteTargetDoctor] =
    useState<Ophthalmologist | null>(null);
  const [selectedEmploymentType, setSelectedEmploymentType] = useState<
    'FullTime' | 'PartTime'
  >('PartTime');
  const [selectedConsultationFee, setSelectedConsultationFee] =
    useState<number>(0);

  // Load data from real API
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await ophthalmologistApi.getOphthalmologists(
        pageNumber,
        10,
        searchQuery || undefined
      );

      const ratingSummaries = await Promise.all(
        result.items.map(async (doctor) => {
          try {
            const summary = await ophthalmologistApi.getRatingSummary(
              doctor.id
            );
            return [doctor.id, summary] as const;
          } catch {
            return [doctor.id, null] as const;
          }
        })
      );

      const ratingSummaryByDoctorId = new Map(ratingSummaries);

      setOphthalmologists(
        result.items.map((doctor) =>
          mapToUiModel(
            doctor,
            locale,
            ratingSummaryByDoctorId.get(doctor.id) ?? null
          )
        )
      );
      setTotalCount(result.totalCount);
      setHasNext(result.hasNext);
      setHasPrevious(result.hasPrevious);
    } catch (error) {
      console.error('Failed to load ophthalmologists:', error);
      setOphthalmologists([]);
    } finally {
      setLoading(false);
    }
  }, [pageNumber, searchQuery, locale]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!selectedDoctor) return;
    setSelectedEmploymentType(selectedDoctor.employmentType);
    const feeValue = Number(selectedDoctor.newConsultationFee) || 0;
    setSelectedConsultationFee(feeValue);
  }, [selectedDoctor]);

  // Calculate stats
  const totalDoctors = totalCount;
  const availableDoctors = ophthalmologists.filter(
    (o) => o.status === 'available'
  ).length;
  const totalPendingRequests = ophthalmologists.reduce(
    (sum, o) => sum + o.pendingRequests,
    0
  );
  const totalMonthlyEarnings = ophthalmologists.reduce(
    (sum, o) => sum + o.monthlyEarnings,
    0
  );
  const averageRating =
    ophthalmologists.length > 0
      ? (
          ophthalmologists.reduce((sum, o) => sum + o.averageRating, 0) /
          ophthalmologists.length
        ).toFixed(1)
      : '0';

  // Client-side status filter (verification + search is server-side)
  const filteredOphthalmologists = ophthalmologists.filter((doctor) => {
    const matchesStatus =
      statusFilter === 'all' || doctor.status === statusFilter;
    return matchesStatus;
  });

  // Handle verification actions
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setPageNumber(1);
  };

  const handleVerify = async (doctorId: string) => {
    try {
      await ophthalmologistApi.verifyOphthalmologist(doctorId, true);
      loadData();
    } catch (error) {
      console.error('Failed to verify doctor:', error);
    }
  };

  const handleUpdateEmploymentType = async () => {
    if (!selectedDoctor) return;

    if (
      selectedEmploymentType === selectedDoctor.employmentType &&
      selectedConsultationFee === selectedDoctor.newConsultationFee
    ) {
      toast.info(
        t(
          'SystemAdmin.ophthalmologists.toasts.noChanges',
          'No changes detected.'
        )
      );
      return;
    }

    try {
      await ophthalmologistApi.updateEmploymentType({
        id: selectedDoctor.id,
        bio: selectedDoctor.bio ?? undefined,
        employmentType: selectedEmploymentType,
        consultationFee: selectedConsultationFee,
      });

      setSelectedDoctor((prev) =>
        prev
          ? {
              ...prev,
              employmentType: selectedEmploymentType,
              newConsultationFee: selectedConsultationFee,
            }
          : prev
      );
      setOphthalmologists((prev) =>
        prev.map((doctor) =>
          doctor.id === selectedDoctor.id
            ? {
                ...doctor,
                employmentType: selectedEmploymentType,
                newConsultationFee: selectedConsultationFee,
              }
            : doctor
        )
      );

      toast.success(
        t(
          'SystemAdmin.ophthalmologists.toasts.updateEmploymentSuccess',
          'Employment type updated successfully.'
        )
      );
      await loadData();
    } catch (error) {
      console.error('Failed to update employment type:', error);
      toast.error(
        extractApiErrorMessage(
          error,
          t(
            'SystemAdmin.ophthalmologists.toasts.updateEmploymentError',
            'Failed to update employment type. Please try again.'
          )
        )
      );
    } finally {
      setSelectedDoctor(null);
    }
  };

  const closeDoctorDetail = () => {
    setSelectedDoctor(null);
  };

  const handleDeleteDoctor = async () => {
    if (!deleteTargetDoctor) return;

    setDeletingDoctorId(deleteTargetDoctor.id);
    try {
      await ophthalmologistApi.deleteOphthalmologist(deleteTargetDoctor.id);
      if (selectedDoctor?.id === deleteTargetDoctor.id) {
        closeDoctorDetail();
      }
      toast.success(
        t(
          'SystemAdmin.ophthalmologists.toasts.deleteSuccess',
          'Doctor deleted successfully.'
        )
      );
      await loadData();
    } catch (error) {
      console.error('Failed to delete doctor:', error);
      toast.error(
        extractApiErrorMessage(
          error,
          t(
            'SystemAdmin.ophthalmologists.toasts.deleteError',
            'Failed to delete doctor. Please try again.'
          )
        )
      );
    } finally {
      setDeletingDoctorId(null);
      setDeleteTargetDoctor(null);
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const doctorsForExport = await exportApi.getOphthalmologists({
        searchTerm: searchQuery || undefined,
      });

      const mappedDoctors = doctorsForExport
        .map((doctor) => mapToUiModel(doctor, locale))
        .filter((doctor) =>
          statusFilter === 'all' ? true : doctor.status === statusFilter
        );

      if (mappedDoctors.length === 0) {
        toast.info(
          t(
            'SystemAdmin.ophthalmologists.toasts.noDataForExport',
            'No ophthalmologists available for export.'
          )
        );
        return;
      }

      await downloadXlsxFile(
        mappedDoctors,
        [
          {
            header: t(
              'SystemAdmin.ophthalmologists.export.columns.ophthalmologistId',
              'Ophthalmologist ID'
            ),
            value: (row: Ophthalmologist) => row.id,
          },
          {
            header: t(
              'SystemAdmin.ophthalmologists.export.columns.fullName',
              'Full Name'
            ),
            value: (row: Ophthalmologist) => row.fullName,
          },
          {
            header: t(
              'SystemAdmin.ophthalmologists.export.columns.email',
              'Email'
            ),
            value: (row: Ophthalmologist) => row.email,
          },
          {
            header: t(
              'SystemAdmin.ophthalmologists.export.columns.phone',
              'Phone'
            ),
            value: (row: Ophthalmologist) => row.phone ?? '',
          },
          {
            header: t(
              'SystemAdmin.ophthalmologists.export.columns.activeStatus',
              'Active Status'
            ),
            value: (row: Ophthalmologist) =>
              row.isActive
                ? t(
                    'SystemAdmin.ophthalmologists.export.values.active',
                    'Active'
                  )
                : t(
                    'SystemAdmin.ophthalmologists.export.values.inactive',
                    'Inactive'
                  ),
          },
          {
            header: t(
              'SystemAdmin.ophthalmologists.export.columns.organisation',
              'Organisation'
            ),
            value: (row: Ophthalmologist) => row.organisationName ?? '',
          },
          {
            header: t(
              'SystemAdmin.ophthalmologists.export.columns.createdAt',
              'Created At'
            ),
            value: (row: Ophthalmologist) => row.createdAt,
          },
        ],
        buildTimestampedFileName('system-admin-ophthalmologists', 'xlsx'),
        t('SystemAdmin.ophthalmologists.export.sheetName', 'Ophthalmologists')
      );
      toast.success(
        t(
          'SystemAdmin.ophthalmologists.toasts.exportSuccess',
          'Exported {{count}} ophthalmologists.',
          { count: mappedDoctors.length }
        )
      );
    } catch (error) {
      console.error('Failed to export ophthalmologists:', error);
      toast.error(
        extractApiErrorMessage(
          error,
          t(
            'SystemAdmin.ophthalmologists.toasts.exportError',
            'Failed to export ophthalmologists. Please try again.'
          )
        )
      );
    } finally {
      setIsExporting(false);
    }
  };

  const ophthalmologistColumns: TableColumn<Ophthalmologist>[] = [
    {
      header: t('SystemAdmin.ophthalmologists.table.columns.doctor', 'Doctor'),
      accessor: 'name',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300">
            {(row.fullName || row.email || 'U').charAt(0).toUpperCase()}
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              {row.fullName || row.email || '—'}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: t('SystemAdmin.ophthalmologists.table.columns.status', 'Status'),
      accessor: 'status',
      render: (value) => {
        const config = statusConfig[value as DoctorStatus];
        return (
          <div className="flex items-center gap-2">
            <Circle className={`w-2 h-2 fill-current ${config.color}`} />
            <span className={`text-sm font-medium ${config.color}`}>
              {doctorStatusLabels[value as DoctorStatus] ?? String(value)}
            </span>
          </div>
        );
      },
    },
    {
      header: t(
        'SystemAdmin.ophthalmologists.table.columns.requests',
        'Requests'
      ),
      accessor: 'pendingRequests',
      render: (_, row) => (
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-slate-900 dark:text-white">
            {t(
              'SystemAdmin.ophthalmologists.table.values.pendingRequests',
              '{{count}} pending',
              { count: row.pendingRequests }
            )}
          </span>
          <span className="text-xs text-slate-500">
            {t(
              'SystemAdmin.ophthalmologists.table.values.totalRequests',
              '{{count}} total',
              { count: row.totalRequests }
            )}
          </span>
        </div>
      ),
    },
    {
      header: t(
        'SystemAdmin.ophthalmologists.table.columns.monthlyEarnings',
        'Monthly Earnings'
      ),
      accessor: 'monthlyEarnings',
      render: (value) => (
        <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
          {formatCurrency(value as number, vndCurrencyOptions)}
        </span>
      ),
    },
    {
      header: t('SystemAdmin.ophthalmologists.table.columns.rating', 'Rating'),
      accessor: 'averageRating',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span className="text-sm font-semibold text-slate-900 dark:text-white">
            {row.averageRating}
          </span>
          <span className="text-xs text-slate-500">({row.totalReviews})</span>
        </div>
      ),
    },
    {
      header: t(
        'SystemAdmin.ophthalmologists.table.columns.actions',
        'Actions'
      ),
      accessor: () => null,
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedDoctor(row)}
            className="text-slate-500 hover:text-primary transition-colors p-1"
            title={t(
              'SystemAdmin.ophthalmologists.table.actions.viewDetails',
              'View Details'
            )}
          >
            <Eye className="w-4 h-4" />
          </button>
          <div className="relative">
            <button
              onClick={() =>
                setActionMenuDoctorId((current) =>
                  current === row.id ? null : row.id
                )
              }
              className="text-slate-500 hover:text-primary transition-colors p-1"
              title={t(
                'SystemAdmin.ophthalmologists.table.actions.moreActions',
                'More actions'
              )}
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            {actionMenuDoctorId === row.id && (
              <div className="absolute right-0 mt-1 w-44 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg z-20 overflow-hidden">
                <button
                  onClick={() => {
                    setSelectedDoctor(row);
                    setActionMenuDoctorId(null);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                >
                  <Pencil className="w-4 h-4" />
                  {t(
                    'SystemAdmin.ophthalmologists.table.actions.update',
                    'Update'
                  )}
                </button>
                <button
                  onClick={() => {
                    setDeleteTargetDoctor(row);
                    setActionMenuDoctorId(null);
                  }}
                  disabled={deletingDoctorId === row.id}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50/80 dark:hover:bg-red-900/30 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4" />
                  {deletingDoctorId === row.id
                    ? t(
                        'SystemAdmin.ophthalmologists.table.actions.deleting',
                        'Deleting...'
                      )
                    : t(
                        'SystemAdmin.ophthalmologists.table.actions.delete',
                        'Delete'
                      )}
                </button>
              </div>
            )}
          </div>
        </div>
      ),
    },
  ];

  const tabs = [
    {
      id: 'overview' as const,
      label: t('SystemAdmin.ophthalmologists.tabs.overview', 'Overview'),
      icon: Activity,
    },
    {
      id: 'requests' as const,
      label: t(
        'SystemAdmin.ophthalmologists.tabs.pendingVerification',
        'Pending Verification'
      ),
      icon: Clock,
    },
    {
      id: 'feedback' as const,
      label: t('SystemAdmin.ophthalmologists.tabs.feedback', 'Feedback'),
      icon: MessageSquare,
    },
  ];

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader
          title={t(
            'SystemAdmin.ophthalmologists.page.title',
            'Ophthalmologist Management'
          )}
          description={t(
            'SystemAdmin.ophthalmologists.page.description',
            'Manage doctors, monitor consultation requests, earnings, and feedback'
          )}
          actions={
            <div className="flex items-center gap-3">
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                {isExporting
                  ? t(
                      'SystemAdmin.ophthalmologists.actions.exporting',
                      'Exporting...'
                    )
                  : t('SystemAdmin.ophthalmologists.actions.export', 'Export')}
              </button>
            </div>
          }
        />

        <main className="flex-1 overflow-y-auto">
          <div className="px-6 md:px-10 py-6 max-w-[1600px] mx-auto w-full space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <StatsCard
                title={t(
                  'SystemAdmin.ophthalmologists.stats.totalDoctors.title',
                  'Total Doctors'
                )}
                value={totalDoctors}
                icon={Stethoscope}
                description={t(
                  'SystemAdmin.ophthalmologists.stats.totalDoctors.description',
                  '{{count}} verified',
                  { count: totalDoctors }
                )}
                variant="primary"
              />
              <StatsCard
                title={t(
                  'SystemAdmin.ophthalmologists.stats.availableNow.title',
                  'Available Now'
                )}
                value={availableDoctors}
                icon={UserCheck}
                description={t(
                  'SystemAdmin.ophthalmologists.stats.availableNow.description',
                  'Ready for consultations'
                )}
                variant="success"
              />
              <StatsCard
                title={t(
                  'SystemAdmin.ophthalmologists.stats.pendingVerification.title',
                  'Pending Verification'
                )}
                value={0}
                icon={AlertCircle}
                description={t(
                  'SystemAdmin.ophthalmologists.stats.pendingVerification.description',
                  'Require review'
                )}
                variant="warning"
              />
              <StatsCard
                title={t(
                  'SystemAdmin.ophthalmologists.stats.pendingRequests.title',
                  'Pending Requests'
                )}
                value={totalPendingRequests}
                icon={Clock}
                description={t(
                  'SystemAdmin.ophthalmologists.stats.pendingRequests.description',
                  'Consultation requests'
                )}
                variant="primary"
              />
              <StatsCard
                title={t(
                  'SystemAdmin.ophthalmologists.stats.monthlyRevenue.title',
                  'Monthly Revenue'
                )}
                value={formatCurrency(totalMonthlyEarnings, vndCurrencyOptions)}
                icon={DollarSign}
                change={12}
                trend="up"
                description={t(
                  'SystemAdmin.ophthalmologists.stats.monthlyRevenue.description',
                  'Platform earnings'
                )}
                variant="success"
              />
            </div>

            {/* Additional Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    {t(
                      'SystemAdmin.ophthalmologists.overview.averageRating.title',
                      'Average Rating'
                    )}
                  </h3>
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">
                    {averageRating}
                  </span>
                  <span className="text-sm text-slate-500">/ 5.0</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {t(
                    'SystemAdmin.ophthalmologists.overview.averageRating.basedOnReviews',
                    'Based on {{count}} reviews',
                    {
                      count: ophthalmologists.reduce(
                        (sum, o) => sum + o.totalReviews,
                        0
                      ),
                    }
                  )}
                </p>
              </div>

              <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    {t(
                      'SystemAdmin.ophthalmologists.overview.totalConsultations.title',
                      'Total Consultations'
                    )}
                  </h3>
                  <UserCheck className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">
                    {ophthalmologists.reduce(
                      (sum, o) => sum + o.completedRequests,
                      0
                    )}
                  </span>
                  <span className="text-sm text-slate-500">
                    {t(
                      'SystemAdmin.ophthalmologists.overview.totalConsultations.completed',
                      'completed'
                    )}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {t(
                    'SystemAdmin.ophthalmologists.overview.totalConsultations.totalRequests',
                    '{{count}} total requests',
                    {
                      count: ophthalmologists.reduce(
                        (sum, o) => sum + o.totalRequests,
                        0
                      ),
                    }
                  )}
                </p>
              </div>

              <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    {t(
                      'SystemAdmin.ophthalmologists.overview.pendingPayouts.title',
                      'Pending Payouts'
                    )}
                  </h3>
                  <Wallet className="w-5 h-5 text-amber-500" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="min-w-0 break-words leading-tight text-3xl font-bold text-slate-900 dark:text-white">
                    {formatCurrency(
                      ophthalmologists.reduce(
                        (sum, o) => sum + o.pendingPayouts,
                        0
                      ),
                      vndCurrencyOptions
                    )}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {t(
                    'SystemAdmin.ophthalmologists.overview.pendingPayouts.description',
                    'Awaiting transfer to doctors'
                  )}
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search & Filters */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="relative flex-1 min-w-[280px] max-w-lg">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t(
                    'SystemAdmin.ophthalmologists.filters.searchPlaceholder',
                    'Search by name or email...'
                  )}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
                />
              </div>

              <div className="flex items-center gap-3">
                {/* Status Filter */}
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none pl-4 pr-10 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer transition-all shadow-sm hover:border-slate-300 dark:hover:border-slate-600"
                  >
                    <option value="all">
                      {t(
                        'SystemAdmin.ophthalmologists.filters.status.all',
                        'All Status'
                      )}
                    </option>
                    <option value="available">
                      {doctorStatusLabels.available}
                    </option>
                    <option value="busy">{doctorStatusLabels.busy}</option>
                    <option value="fully_booked">
                      {doctorStatusLabels.fully_booked}
                    </option>
                    <option value="unavailable">
                      {doctorStatusLabels.unavailable}
                    </option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg
                      className="w-4 h-4 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Table */}
            {activeTab === 'feedback' ? (
              <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 flex flex-col items-center justify-center text-center gap-3">
                <MessageSquare className="w-12 h-12 text-slate-300" />
                <p className="text-slate-500 font-medium">
                  {t(
                    'SystemAdmin.ophthalmologists.feedback.state.inProgress',
                    'Feedback feature is under development'
                  )}
                </p>
                <p className="text-slate-400 text-sm">
                  {t(
                    'SystemAdmin.ophthalmologists.feedback.state.comingSoon',
                    'Coming soon'
                  )}
                </p>
              </div>
            ) : (
              <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                {activeTab === 'requests' && (
                  <div className="px-5 py-3 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                      {t(
                        'SystemAdmin.ophthalmologists.requestsBanner.pendingDoctors',
                        '{{count}} doctors are waiting for credential review',
                        { count: totalCount }
                      )}
                    </span>
                    <span className="ml-auto text-xs text-amber-500">
                      {t(
                        'SystemAdmin.ophthalmologists.requestsBanner.hint',
                        'View attached documents in detail rows (eye icon)'
                      )}
                    </span>
                  </div>
                )}
                <DataTable<Ophthalmologist>
                  columns={ophthalmologistColumns}
                  data={filteredOphthalmologists}
                  keyExtractor={(row) => row.id}
                  isLoading={loading}
                  emptyMessage={
                    activeTab === 'requests'
                      ? t(
                          'SystemAdmin.ophthalmologists.states.noPendingRequests',
                          'No records are waiting for verification'
                        )
                      : t(
                          'SystemAdmin.ophthalmologists.states.empty',
                          'No ophthalmologists found'
                        )
                  }
                />
              </div>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
              <span>
                {t(
                  'SystemAdmin.ophthalmologists.pagination.showing',
                  'Showing {{shown}} of {{total}} doctors',
                  {
                    shown: filteredOphthalmologists.length,
                    total: totalCount,
                  }
                )}
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={!hasPrevious}
                  onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t(
                    'SystemAdmin.ophthalmologists.pagination.previous',
                    'Previous'
                  )}
                </button>
                <span className="px-2 font-medium">
                  {t(
                    'SystemAdmin.ophthalmologists.pagination.page',
                    'Page {{page}}',
                    {
                      page: pageNumber,
                    }
                  )}
                </span>
                <button
                  disabled={!hasNext}
                  onClick={() => setPageNumber((p) => p + 1)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('SystemAdmin.ophthalmologists.pagination.next', 'Next')}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Doctor Detail Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={closeDoctorDetail}
          />
          <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl m-4">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-lg">
                      {selectedDoctor.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)}
                    </div>
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${statusConfig[selectedDoctor.status].dotColor}`}
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      {selectedDoctor.name}
                    </h2>
                    <p className="text-sm text-slate-500">
                      {selectedDoctor.email}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Circle
                        className={`w-2 h-2 fill-current ${statusConfig[selectedDoctor.status].color}`}
                      />
                      <span
                        className={`text-xs font-medium ${statusConfig[selectedDoctor.status].color}`}
                      >
                        {doctorStatusLabels[selectedDoctor.status]}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={closeDoctorDetail}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5 text-slate-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <p className="text-xs text-slate-500 mb-1">
                    {t(
                      'SystemAdmin.ophthalmologists.detail.stats.totalRequests',
                      'Total Requests'
                    )}
                  </p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    {selectedDoctor.totalRequests}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <p className="text-xs text-slate-500 mb-1">
                    {t(
                      'SystemAdmin.ophthalmologists.detail.stats.pending',
                      'Pending'
                    )}
                  </p>
                  <p className="text-xl font-bold text-amber-600">
                    {selectedDoctor.pendingRequests}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <p className="text-xs text-slate-500 mb-1">
                    {t(
                      'SystemAdmin.ophthalmologists.detail.stats.monthlyEarnings',
                      'Monthly Earnings'
                    )}
                  </p>
                  <p className="text-xl font-bold text-emerald-600">
                    {formatCurrency(
                      selectedDoctor.monthlyEarnings,
                      vndCurrencyOptions
                    )}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <p className="text-xs text-slate-500 mb-1">
                    {t(
                      'SystemAdmin.ophthalmologists.detail.stats.rating',
                      'Rating'
                    )}
                  </p>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-xl font-bold text-slate-900 dark:text-white">
                      {selectedDoctor.averageRating}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {selectedDoctor.bio && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                    {t(
                      'SystemAdmin.ophthalmologists.detail.sections.bio',
                      'Bio'
                    )}
                  </h3>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {selectedDoctor.bio}
                  </p>
                </div>
              )}

              {/* Documents */}
              {(selectedDoctor.licenseUrl || selectedDoctor.degreeUrl) && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">
                    {t(
                      'SystemAdmin.ophthalmologists.detail.sections.uploadedDocuments',
                      'Uploaded Documents'
                    )}
                  </h3>
                  <div className="flex gap-4">
                    {selectedDoctor.licenseUrl && (
                      <a
                        href={selectedDoctor.licenseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        {t(
                          'SystemAdmin.ophthalmologists.detail.links.viewLicense',
                          'View License'
                        )}
                      </a>
                    )}
                    {selectedDoctor.degreeUrl && (
                      <a
                        href={selectedDoctor.degreeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        {t(
                          'SystemAdmin.ophthalmologists.detail.links.viewDegree',
                          'View Degree'
                        )}
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Financial Summary */}
              <div>
                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">
                  {t(
                    'SystemAdmin.ophthalmologists.detail.sections.financialSummary',
                    'Financial Summary'
                  )}
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 mb-1">
                      {t(
                        'SystemAdmin.ophthalmologists.detail.financial.totalEarnings',
                        'Total Earnings'
                      )}
                    </p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                      {formatCurrency(
                        selectedDoctor.totalEarnings,
                        vndCurrencyOptions
                      )}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 mb-1">
                      {t(
                        'SystemAdmin.ophthalmologists.detail.financial.thisMonth',
                        'This Month'
                      )}
                    </p>
                    <p className="text-lg font-bold text-emerald-600">
                      {formatCurrency(
                        selectedDoctor.monthlyEarnings,
                        vndCurrencyOptions
                      )}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 mb-1">
                      {t(
                        'SystemAdmin.ophthalmologists.detail.financial.pendingPayout',
                        'Pending Payout'
                      )}
                    </p>
                    <p className="text-lg font-bold text-amber-600">
                      {formatCurrency(
                        selectedDoctor.pendingPayouts,
                        vndCurrencyOptions
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contract & Employment */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                  {t(
                    'SystemAdmin.ophthalmologists.detail.sections.contractEmployment',
                    'Contract & Employment'
                  )}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 mb-1">
                      {t(
                        'SystemAdmin.ophthalmologists.detail.contract.employmentType',
                        'Employment Type'
                      )}
                    </p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {selectedDoctor.employmentType ||
                        t('SystemAdmin.common.notAvailable', 'N/A')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deleteTargetDoctor}
        title={t(
          'SystemAdmin.ophthalmologists.deleteModal.title',
          'Delete ophthalmologist?'
        )}
        message={t(
          'SystemAdmin.ophthalmologists.deleteModal.message',
          'Are you sure you want to delete doctor {{name}}? The profile will be marked as inactive.',
          { name: deleteTargetDoctor?.name ?? '' }
        )}
        confirmLabel={t(
          'SystemAdmin.ophthalmologists.deleteModal.confirmLabel',
          'Delete'
        )}
        cancelLabel={t(
          'SystemAdmin.ophthalmologists.deleteModal.cancelLabel',
          'Cancel'
        )}
        tone="danger"
        isLoading={
          !!deleteTargetDoctor && deletingDoctorId === deleteTargetDoctor.id
        }
        onCancel={() => setDeleteTargetDoctor(null)}
        onConfirm={handleDeleteDoctor}
      />
    </div>
  );
}
