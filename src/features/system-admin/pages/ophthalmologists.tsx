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
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  Wallet,
  Activity,
  Circle,
  FileText,
  X,
  Pencil,
  Trash2,
  ShieldCheck,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import StatsCard from '../components/StatsCard';
import DataTable, { type TableColumn } from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
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
import { leavePoliciesApi, type LeavePolicy } from '../api/leave-policies.api';

type VerificationStatus =
  | 'PendingVerification'
  | 'PendingUpdate'
  | 'Approved'
  | 'Rejected';

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
}

const calculateCommissionAmount = (
  actualMonthlySalary: number | null | undefined,
  commissionRate: number | null | undefined
): number | null => {
  if (actualMonthlySalary == null || actualMonthlySalary <= 0) {
    return null;
  }

  if (commissionRate == null || commissionRate <= 0) {
    return null;
  }

  // Accept both 5 (percent) and 0.05 (fraction) representations.
  const normalizedRate =
    commissionRate > 1 ? commissionRate / 100 : commissionRate;
  return actualMonthlySalary * normalizedRate;
};

/** Map API item to UI Ophthalmologist model */
const mapToUiModel = (
  item: OphthalmologistListItem,
  locale: 'en-US' | 'vi-VN',
  ratingSummary?: FeedbackRatingSummary | null
): Ophthalmologist => ({
  ...item,
  name: item.fullName,
  status: item.isVerified ? 'available' : 'unavailable',
  totalRequests: 0,
  pendingRequests: 0,
  completedRequests: 0,
  monthlyEarnings: item.actualMonthlySalary ?? 0,
  totalEarnings: 0,
  pendingPayouts: 0,
  averageRating: Number(
    item.ratingAverage ?? ratingSummary?.ratingAverage ?? 0
  ),
  totalReviews: Number(item.ratingCount ?? ratingSummary?.ratingCount ?? 0),
  joinedAt: new Date(item.createdAt).toLocaleDateString(locale),
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

  const verificationLabels: Record<VerificationStatus, string> = useMemo(
    () => ({
      Approved: t(
        'SystemAdmin.ophthalmologists.verification.verified',
        'Verified'
      ),
      PendingVerification: t(
        'SystemAdmin.ophthalmologists.verification.pending',
        'Pending'
      ),
      PendingUpdate: t(
        'SystemAdmin.ophthalmologists.verification.pendingUpdate',
        'Pending Update'
      ),
      Rejected: t(
        'SystemAdmin.ophthalmologists.verification.rejected',
        'Rejected'
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
  const [verificationFilter, setVerificationFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<Ophthalmologist | null>(
    null
  );
  const [pendingTotalCount, setPendingTotalCount] = useState(0);

  // Reject modal state
  const [rejectingDoctor, setRejectingDoctor] =
    useState<Ophthalmologist | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectSubmitting, setRejectSubmitting] = useState(false);
  const [rejectError, setRejectError] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [payingSalary, setPayingSalary] = useState(false);
  const [updatingEmployment, setUpdatingEmployment] = useState(false);
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

  // Leave Policy state
  const [leavePolicies, setLeavePolicies] = useState<LeavePolicy[]>([]);
  const [applyingPolicyDoctor, setApplyingPolicyDoctor] =
    useState<Ophthalmologist | null>(null);
  const [selectedPolicyId, setSelectedPolicyId] = useState<string>('');
  const [applyingPolicy, setApplyingPolicy] = useState(false);

  // Load data from real API
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const apiVerificationStatus =
        verificationFilter === 'all' ? undefined : verificationFilter;
      const result = await ophthalmologistApi.getOphthalmologists(
        pageNumber,
        10,
        searchQuery || undefined,
        apiVerificationStatus
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
  }, [pageNumber, searchQuery, verificationFilter, locale]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Load Leave Policies
  useEffect(() => {
    leavePoliciesApi
      .getPaged(1, 100)
      .then((r) => setLeavePolicies(r.items))
      .catch((e) => console.error('Failed to load leave policies', e));
  }, []);

  // Load total pending count for tab badge (independent of current page filter)
  useEffect(() => {
    ophthalmologistApi
      .getOphthalmologists(1, 1, undefined, 'PendingVerification,PendingUpdate')
      .then((r) => setPendingTotalCount(r.totalCount))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedDoctor) return;
    setSelectedEmploymentType(selectedDoctor.employmentType);
    setSelectedConsultationFee(selectedDoctor.consultationFee ?? 0);
  }, [selectedDoctor]);

  // Calculate stats
  const totalDoctors = totalCount;
  const verifiedDoctors = ophthalmologists.filter(
    (o) => o.verificationStatus === 'Approved'
  ).length;
  const pendingVerification = ophthalmologists.filter(
    (o) =>
      o.verificationStatus === 'PendingVerification' ||
      o.verificationStatus === 'PendingUpdate'
  ).length;
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
    if (tab === 'requests')
      setVerificationFilter('PendingVerification,PendingUpdate');
    else if (tab === 'overview') setVerificationFilter('all');
  };

  const handleVerify = async (doctorId: string) => {
    try {
      await ophthalmologistApi.verifyOphthalmologist(doctorId, true);
      setPendingTotalCount((c) => Math.max(0, c - 1));
      loadData();
    } catch (error) {
      console.error('Failed to verify doctor:', error);
    }
  };

  const handlePaySalary = async (doctor: Ophthalmologist) => {
    if (doctor.actualMonthlySalary == null || doctor.actualMonthlySalary <= 0) {
      toast.error(
        t(
          'SystemAdmin.ophthalmologists.toasts.invalidSalaryForPayout',
          'Doctor has no valid actual salary to payout.'
        )
      );
      return;
    }

    setPayingSalary(true);
    try {
      await ophthalmologistApi.paySalary(
        doctor.id,
        doctor.actualMonthlySalary,
        `Salary payout (${new Date().toISOString().slice(0, 7)})`
      );
      toast.success(
        t(
          'SystemAdmin.ophthalmologists.toasts.paySalarySuccess',
          'Salary paid to doctor wallet successfully.'
        )
      );
      await loadData();
    } catch (error) {
      console.error('Failed to pay salary:', error);
      toast.error(
        extractApiErrorMessage(
          error,
          t(
            'SystemAdmin.ophthalmologists.toasts.paySalaryError',
            'Failed to pay salary. Please try again.'
          )
        )
      );
    } finally {
      setPayingSalary(false);
    }
  };

  const handleUpdateEmploymentType = async () => {
    if (!selectedDoctor) return;

    if (
      selectedEmploymentType === selectedDoctor.employmentType &&
      selectedConsultationFee === selectedDoctor.consultationFee
    ) {
      toast.info(
        t(
          'SystemAdmin.ophthalmologists.toasts.noChanges',
          'No changes detected.'
        )
      );
      return;
    }

    setUpdatingEmployment(true);
    try {
      await ophthalmologistApi.updateEmploymentType({
        id: selectedDoctor.id,
        yearsOfExperience: selectedDoctor.yearsOfExperience,
        bio: selectedDoctor.bio ?? undefined,
        employmentType: selectedEmploymentType,
        consultationFee: selectedConsultationFee,
      });

      setSelectedDoctor((prev) =>
        prev
          ? {
              ...prev,
              employmentType: selectedEmploymentType,
              consultationFee: selectedConsultationFee,
            }
          : prev
      );
      setOphthalmologists((prev) =>
        prev.map((doctor) =>
          doctor.id === selectedDoctor.id
            ? {
                ...doctor,
                employmentType: selectedEmploymentType,
                consultationFee: selectedConsultationFee,
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
      setUpdatingEmployment(false);
    }
  };

  const closeDoctorDetail = () => {
    setSelectedDoctor(null);
    setUpdatingEmployment(false);
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

  const handleRejectClick = (doctor: Ophthalmologist) => {
    setRejectingDoctor(doctor);
    setRejectReason('');
    setRejectError('');
  };

  const handleRejectCancel = () => {
    if (rejectSubmitting) return;
    setRejectingDoctor(null);
    setRejectReason('');
    setRejectError('');
  };

  const handleRejectSubmit = async () => {
    if (!rejectingDoctor) return;
    if (!rejectReason.trim()) {
      setRejectError(
        t(
          'SystemAdmin.ophthalmologists.rejectModal.validation.reasonRequired',
          'Please enter a rejection reason.'
        )
      );
      return;
    }
    setRejectSubmitting(true);
    setRejectError('');
    try {
      await ophthalmologistApi.verifyOphthalmologist(
        rejectingDoctor.id,
        false,
        rejectReason.trim()
      );
      setRejectingDoctor(null);
      setPendingTotalCount((c) => Math.max(0, c - 1));
      loadData();
    } catch (error) {
      setRejectError(
        extractApiErrorMessage(
          error,
          t(
            'SystemAdmin.ophthalmologists.toasts.rejectError',
            'Rejection failed. Please try again.'
          )
        )
      );
    } finally {
      setRejectSubmitting(false);
    }
  };

  const handleApplyPolicySubmit = async () => {
    if (!applyingPolicyDoctor || !selectedPolicyId) return;

    setApplyingPolicy(true);
    try {
      await leavePoliciesApi.apply(selectedPolicyId, applyingPolicyDoctor.id);
      toast.success(
        t(
          'SystemAdmin.ophthalmologists.toasts.applyPolicySuccess',
          'Leave policy applied successfully.'
        )
      );
      setApplyingPolicyDoctor(null);
      setSelectedPolicyId('');
      loadData();
    } catch (error) {
      console.error('Failed to apply policy:', error);
      toast.error(
        extractApiErrorMessage(
          error,
          t(
            'SystemAdmin.ophthalmologists.toasts.applyPolicyError',
            'Failed to apply policy. Please try again.'
          )
        )
      );
    } finally {
      setApplyingPolicy(false);
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const doctorsForExport = await exportApi.getOphthalmologists({
        searchTerm: searchQuery || undefined,
        verificationStatus:
          verificationFilter === 'all' ? undefined : verificationFilter,
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
              'SystemAdmin.ophthalmologists.export.columns.verificationStatus',
              'Verification Status'
            ),
            value: (row: Ophthalmologist) => row.verificationStatus,
          },
          {
            header: t(
              'SystemAdmin.ophthalmologists.export.columns.isVerified',
              'Is Verified'
            ),
            value: (row: Ophthalmologist) =>
              row.isVerified
                ? t('SystemAdmin.ophthalmologists.export.values.yes', 'Yes')
                : t('SystemAdmin.ophthalmologists.export.values.no', 'No'),
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
              'SystemAdmin.ophthalmologists.export.columns.yearsOfExperience',
              'Years of Experience'
            ),
            value: (row: Ophthalmologist) => row.yearsOfExperience,
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
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
              {row.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)}
            </div>
            {/* Status indicator dot */}
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${statusConfig[row.status].dotColor}`}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {row.name}
            </span>
            <span className="text-xs text-slate-500">
              {t(
                'SystemAdmin.ophthalmologists.table.values.yearsExperience',
                '{{count}} years exp.',
                { count: row.yearsOfExperience }
              )}
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
        'SystemAdmin.ophthalmologists.table.columns.verification',
        'Verification'
      ),
      accessor: 'verificationStatus',
      render: (value) => {
        const statusMap: Record<
          VerificationStatus,
          { status: 'success' | 'warning' | 'error' }
        > = {
          Approved: { status: 'success' },
          PendingVerification: { status: 'warning' },
          PendingUpdate: { status: 'warning' },
          Rejected: { status: 'error' },
        };
        const config = statusMap[value as VerificationStatus];
        return (
          <StatusBadge
            status={config?.status ?? 'warning'}
            label={
              verificationLabels[value as VerificationStatus] ?? String(value)
            }
          />
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
      header: t(
        'SystemAdmin.ophthalmologists.table.columns.dealTerms',
        'Deal Terms'
      ),
      accessor: 'commissionRate',
      render: (_, row) => {
        const commissionAmount = calculateCommissionAmount(
          row.actualMonthlySalary,
          row.commissionRate
        );

        return (
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              {row.commissionRate != null
                ? `${row.commissionRate}%`
                : t('SystemAdmin.common.notAvailable', 'N/A')}
            </span>
            <span className="text-xs text-primary font-medium">
              {row.consultationFee
                ? formatCurrency(row.consultationFee, vndCurrencyOptions)
                : t(
                    'SystemAdmin.ophthalmologists.table.values.feePending',
                    'Fee pending'
                  )}
            </span>
          </div>
        );
      },
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
          {(row.verificationStatus === 'PendingVerification' ||
            row.verificationStatus === 'PendingUpdate') && (
            <>
              <button
                onClick={() => handleVerify(row.id)}
                className="text-emerald-500 hover:text-emerald-600 transition-colors p-1"
                title={t(
                  'SystemAdmin.ophthalmologists.table.actions.approveVerification',
                  'Approve Verification'
                )}
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleRejectClick(row)}
                className="text-red-500 hover:text-red-600 transition-colors p-1"
                title={t(
                  'SystemAdmin.ophthalmologists.table.actions.rejectVerification',
                  'Reject Verification'
                )}
              >
                <XCircle className="w-4 h-4" />
              </button>
            </>
          )}
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
                    setApplyingPolicyDoctor(row);
                    setSelectedPolicyId('');
                    setActionMenuDoctorId(null);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {t(
                    'SystemAdmin.ophthalmologists.table.actions.applyPolicy',
                    'Apply Leave Policy'
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
      count: pendingTotalCount,
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
                  { count: verifiedDoctors }
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
                value={pendingVerification}
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
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                      {tab.count}
                    </span>
                  )}
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
                {/* Verification Filter */}
                <div className="relative">
                  <select
                    value={verificationFilter}
                    onChange={(e) => setVerificationFilter(e.target.value)}
                    className="appearance-none pl-4 pr-10 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer transition-all shadow-sm hover:border-slate-300 dark:hover:border-slate-600"
                  >
                    <option value="all">
                      {t(
                        'SystemAdmin.ophthalmologists.filters.verification.all',
                        'All Verification'
                      )}
                    </option>
                    <option value="PendingVerification,PendingUpdate">
                      {t(
                        'SystemAdmin.ophthalmologists.filters.verification.pending',
                        'Pending'
                      )}
                    </option>
                    <option value="Approved">
                      {t(
                        'SystemAdmin.ophthalmologists.filters.verification.approved',
                        'Approved'
                      )}
                    </option>
                    <option value="Rejected">
                      {t(
                        'SystemAdmin.ophthalmologists.filters.verification.rejected',
                        'Rejected'
                      )}
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

      {/* ── Reject Modal ───────────────────────────────────────────────── */}
      {rejectingDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleRejectCancel}
          />
          <div className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl m-4 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-red-100 dark:bg-red-900/30">
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {t(
                      'SystemAdmin.ophthalmologists.rejectModal.title',
                      'Reject verification'
                    )}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[220px]">
                    {rejectingDoctor.name}
                  </p>
                </div>
              </div>
              <button
                onClick={handleRejectCancel}
                disabled={rejectSubmitting}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              {/* Credential docs quick-access */}
              {(rejectingDoctor.licenseUrl || rejectingDoctor.degreeUrl) && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <FileText className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <div className="flex gap-4 text-sm">
                    {rejectingDoctor.licenseUrl && (
                      <a
                        href={rejectingDoctor.licenseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-medium"
                      >
                        {t(
                          'SystemAdmin.ophthalmologists.rejectModal.links.viewLicense',
                          'View license'
                        )}
                      </a>
                    )}
                    {rejectingDoctor.degreeUrl && (
                      <a
                        href={rejectingDoctor.degreeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-medium"
                      >
                        {t(
                          'SystemAdmin.ophthalmologists.rejectModal.links.viewDegree',
                          'View degree'
                        )}
                      </a>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {t(
                    'SystemAdmin.ophthalmologists.rejectModal.reasonLabel',
                    'Rejection reason'
                  )}{' '}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => {
                    setRejectReason(e.target.value);
                    if (rejectError) setRejectError('');
                  }}
                  rows={4}
                  placeholder={t(
                    'SystemAdmin.ophthalmologists.rejectModal.reasonPlaceholder',
                    'Enter rejection reason (for example: unclear license photo, insufficient credentials...)'
                  )}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-red-400/50 focus:border-red-400 outline-none transition-all text-sm resize-none"
                />
                {rejectError && (
                  <p className="text-xs text-red-500 font-medium">
                    {rejectError}
                  </p>
                )}
              </div>

              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  {t(
                    'SystemAdmin.ophthalmologists.rejectModal.hint',
                    'The rejection reason will be emailed to the doctor. Please provide clear details so they can update the profile.'
                  )}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <button
                onClick={handleRejectCancel}
                disabled={rejectSubmitting}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                {t(
                  'SystemAdmin.ophthalmologists.rejectModal.actions.cancel',
                  'Cancel'
                )}
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={rejectSubmitting || !rejectReason.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {rejectSubmitting ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                {t(
                  'SystemAdmin.ophthalmologists.rejectModal.actions.confirm',
                  'Confirm rejection'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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

              {/* Rejection Reason */}
              {selectedDoctor.verificationStatus === 'Rejected' &&
                selectedDoctor.rejectionReason && (
                  <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-1">
                      {t(
                        'SystemAdmin.ophthalmologists.detail.sections.rejectionReason',
                        'Rejection Reason'
                      )}
                    </h3>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {selectedDoctor.rejectionReason}
                    </p>
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

              <div>
                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">
                  {t(
                    'SystemAdmin.ophthalmologists.detail.sections.contractDealTerms',
                    'Contract Deal Terms'
                  )}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 mb-1">
                      {t(
                        'SystemAdmin.ophthalmologists.detail.contract.employment',
                        'Employment'
                      )}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <select
                        value={selectedEmploymentType}
                        onChange={(e) =>
                          setSelectedEmploymentType(
                            e.target.value as 'FullTime' | 'PartTime'
                          )
                        }
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      >
                        <option value="FullTime">
                          {t(
                            'SystemAdmin.ophthalmologists.detail.contract.employmentType.fullTime',
                            'Full-time'
                          )}
                        </option>
                        <option value="PartTime">
                          {t(
                            'SystemAdmin.ophthalmologists.detail.contract.employmentType.partTime',
                            'Part-time'
                          )}
                        </option>
                      </select>
                      <button
                        onClick={handleUpdateEmploymentType}
                        disabled={
                          updatingEmployment ||
                          selectedEmploymentType ===
                            selectedDoctor.employmentType
                        }
                        className="px-3 py-2 rounded-lg text-xs font-semibold text-white bg-primary hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {updatingEmployment
                          ? t(
                              'SystemAdmin.ophthalmologists.detail.contract.actions.saving',
                              'Saving...'
                            )
                          : t(
                              'SystemAdmin.ophthalmologists.detail.contract.actions.save',
                              'Save'
                            )}
                      </button>
                    </div>
                    {selectedDoctor.workingHoursPerWeek !== undefined && (
                      <p className="text-xs text-slate-500 mt-1">
                        {t(
                          'SystemAdmin.ophthalmologists.detail.contract.hoursPerWeek',
                          '{{count}}h/week',
                          { count: selectedDoctor.workingHoursPerWeek }
                        )}
                      </p>
                    )}
                  </div>
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 mb-1">
                      {t(
                        'SystemAdmin.ophthalmologists.detail.contract.consultationFee',
                        'Consultation Fee'
                      )}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="relative flex-1">
                        <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="number"
                          value={selectedConsultationFee}
                          onChange={(e) =>
                            setSelectedConsultationFee(Number(e.target.value))
                          }
                          className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-400">
                        VND
                      </span>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 mb-1">
                      {t(
                        'SystemAdmin.ophthalmologists.detail.contract.commission',
                        'Commission'
                      )}
                    </p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                      {selectedDoctor.commissionRate != null
                        ? `${selectedDoctor.commissionRate}%`
                        : t(
                            'SystemAdmin.ophthalmologists.detail.contract.pending',
                            'Pending'
                          )}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 mb-1">
                      {t(
                        'SystemAdmin.ophthalmologists.detail.contract.expectedSalary',
                        'Expected Salary'
                      )}
                    </p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                      {selectedDoctor.expectedMonthlySalary !== undefined
                        ? formatCurrency(
                            selectedDoctor.expectedMonthlySalary,
                            vndCurrencyOptions
                          )
                        : t('SystemAdmin.common.notAvailable', 'N/A')}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 mb-1">
                      {t(
                        'SystemAdmin.ophthalmologists.detail.contract.actualSalary',
                        'Actual Salary'
                      )}
                    </p>
                    <p className="text-lg font-bold text-emerald-600">
                      {selectedDoctor.actualMonthlySalary != null
                        ? formatCurrency(
                            selectedDoctor.actualMonthlySalary,
                            vndCurrencyOptions
                          )
                        : t(
                            'SystemAdmin.ophthalmologists.detail.contract.pending',
                            'Pending'
                          )}
                    </p>
                    {selectedDoctor.actualMonthlySalary != null &&
                      selectedDoctor.actualMonthlySalary > 0 && (
                        <button
                          onClick={() => handlePaySalary(selectedDoctor)}
                          disabled={payingSalary}
                          className="mt-3 inline-flex items-center justify-center px-3 py-2 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {payingSalary
                            ? t(
                                'SystemAdmin.ophthalmologists.detail.contract.actions.paying',
                                'Paying...'
                              )
                            : t(
                                'SystemAdmin.ophthalmologists.detail.contract.actions.paySalaryToWallet',
                                'Pay salary to wallet'
                              )}
                        </button>
                      )}
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

      {/* Apply Leave Policy Modal */}
      {applyingPolicyDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                {t(
                  'SystemAdmin.ophthalmologists.applyPolicyModal.title',
                  'Apply Leave Policy'
                )}
              </h3>
              <button
                onClick={() => setApplyingPolicyDoctor(null)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                  {applyingPolicyDoctor.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {applyingPolicyDoctor.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {t(
                      'SystemAdmin.ophthalmologists.applyPolicyModal.currentLeave',
                      'Current leave fund: {{count}} days',
                      { count: applyingPolicyDoctor.availableLeaveDays }
                    )}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {t(
                    'SystemAdmin.ophthalmologists.applyPolicyModal.selectPolicy',
                    'Select Compensation Policy'
                  )}
                </label>
                <select
                  value={selectedPolicyId}
                  onChange={(e) => setSelectedPolicyId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:ring-2 focus:ring-primary outline-none transition-all"
                >
                  <option value="">
                    {t(
                      'SystemAdmin.ophthalmologists.applyPolicyModal.placeholder',
                      '-- Choose a policy --'
                    )}
                  </option>
                  {leavePolicies.map((policy) => (
                    <option key={policy.id} value={policy.id}>
                      {policy.name} (+{policy.additionalDays} days)
                    </option>
                  ))}
                </select>
                {selectedPolicyId && (
                  <p className="text-xs text-slate-500 px-1 mt-1">
                    {leavePolicies.find((p) => p.id === selectedPolicyId)
                      ?.description ||
                      t(
                        'SystemAdmin.ophthalmologists.applyPolicyModal.noDescription',
                        'No description available'
                      )}
                  </p>
                )}
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-end gap-3">
              <button
                onClick={() => setApplyingPolicyDoctor(null)}
                className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                {t('SystemAdmin.common.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleApplyPolicySubmit}
                disabled={applyingPolicy || !selectedPolicyId}
                className="px-6 py-2 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {applyingPolicy
                  ? t('SystemAdmin.common.applying', 'Applying...')
                  : t('SystemAdmin.common.apply', 'Apply')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
