/**
 * System Admin Dashboard API
 * Handles API calls for dashboard data
 */

import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import type {
  ApiResponse,
  SystemAdminDoctorWorkloadPagedResult,
  SystemAdminDoctorWorkloadQueryParams,
  SystemAdminDashboardMetrics,
  SystemAdminPartTimeSlotQuotaUsage,
} from '../types/system-admin.types';

interface AdminUserGrowthMetricDto {
  total: number;
  currentMonth: number;
  previousMonth: number;
  growthPercentage: number;
}

interface AdminPaymentMethodRevenueDto {
  paymentMethod: string;
  amount: number;
  percentage: number;
}

interface AdminRevenuePointDto {
  month?: number;
  date?: string;
  label: string;
  revenue: number;
}

interface AdminPendingActionsDto {
  pendingOphthalmologistVerifications: number;
  pendingWithdrawalRequests: number;
  pendingOrganisationOnboarding: number;
}

interface AdminSystemStatusDto {
  liveConsultationSessions: number;
  apiHealthy: boolean;
  databaseHealthy: boolean;
}

interface AdminBetterStackMonitorDto {
  key: string;
  name: string;
  category: string;
  configured: boolean;
}

interface AdminBetterStackDto {
  enabled: boolean;
  embedUrl?: string | null;
  monitors: AdminBetterStackMonitorDto[];
}

interface AdminTopDoctorDto {
  ophthalmologistId: string;
  name: string;
  revenue: number;
  ratingAverage: number;
  ratingCount: number;
}

interface AdminTopOrganisationDto {
  organisationId: string;
  name: string;
  ratingAverage: number;
  ratingCount: number;
}

interface AdminMetricsDto {
  doctors?: AdminUserGrowthMetricDto;
  organisations?: AdminUserGrowthMetricDto;
  patients?: AdminUserGrowthMetricDto;
  paymentMethodBreakdown?: AdminPaymentMethodRevenueDto[];
  monthlyRevenue?: AdminRevenuePointDto[];
  dailyRevenue?: AdminRevenuePointDto[];
  totalDepositRevenueYear?: number;
  totalPlatformCommissionYear?: number;
  monthlyPlatformCommission?: AdminRevenuePointDto[];
  dailyPlatformCommission?: AdminRevenuePointDto[];
  monthlyNewDoctorCounts?: number[];
  monthlyNewOrganisationCounts?: number[];
  monthlyNewPatientCounts?: number[];
  pendingActions?: AdminPendingActionsDto;
  systemStatus?: AdminSystemStatusDto;
  betterStack?: AdminBetterStackDto;
  topDoctorsByConsultationRevenue?: AdminTopDoctorDto[];
  topOrganisationsByRating?: AdminTopOrganisationDto[];
}

interface AdminPartTimeSlotQuotaUsageDto {
  date: string;
  usedSlots: number;
  quota: number;
  remainingSlots: number;
}

interface AdminDoctorWorkloadListItemDto {
  doctorId: string;
  doctorName: string;
  email?: string | null;
  employmentType: 'FULL_TIME' | 'PART_TIME';
  periodType: 'WEEK' | 'MONTH';
  periodStart: string;
  periodEnd: string;
  requiredHours: number;
  actualHours: number;
  completionRate: number;
  status: 'OK' | 'UNDER';
  warningFlag: boolean;
}

interface TodaySummaryDto {
  totalAppointments: number;
  checkedInPatients: number;
  completedVisits: number;
  noShowCount: number;
}

interface SlotUtilizationDto {
  totalSlots: number;
  bookedSlots: number;
  remainingCapacity: number;
  utilizationRate: number;
}

interface LiveQueueItemDto {
  visitId: string;
  patientName: string;
  status: string;
  assignedDoctorName?: string;
  waitingTimeMinutes: number;
  checkedInAt?: string;
}

interface DoctorStatusDto {
  doctorId: string;
  doctorName: string;
  currentStatus: string;
  patientsHandledToday: number;
  activeLoad: number;
}

interface AdminPagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export const dashboardApi = {
  async getMetrics(): Promise<SystemAdminDashboardMetrics> {
    try {
      const response = await api.get<ApiResponse<AdminMetricsDto>>(
        API_ENDPOINTS.SYSTEM_ADMIN.DASHBOARD.STATS
      );
      const data = response.data.data;
      if (!data) {
        throw new Error('Dashboard metrics response is empty.');
      }

      const defaultGrowthMetric: AdminUserGrowthMetricDto = {
        total: 0,
        currentMonth: 0,
        previousMonth: 0,
        growthPercentage: 0,
      };

      const paymentMethodBreakdown = data.paymentMethodBreakdown ?? [];
      const monthlyRevenue = data.monthlyRevenue ?? [];
      const dailyRevenue = data.dailyRevenue ?? [];
      const monthlyPlatformCommission = data.monthlyPlatformCommission ?? [];
      const dailyPlatformCommission = data.dailyPlatformCommission ?? [];
      const topDoctorsByConsultationRevenue =
        data.topDoctorsByConsultationRevenue ?? [];
      const topOrganisationsByRating = data.topOrganisationsByRating ?? [];

      return {
        doctors: data.doctors ?? defaultGrowthMetric,
        organisations: data.organisations ?? defaultGrowthMetric,
        patients: data.patients ?? defaultGrowthMetric,
        paymentMethods: paymentMethodBreakdown.map((item) => ({
          name: item.paymentMethod,
          value: Number(item.amount ?? 0),
        })),
        monthlyRevenue: monthlyRevenue.map((item) => ({
          label: item.label,
          value: Number(item.revenue ?? 0),
        })),
        dailyRevenue: dailyRevenue.map((item) => ({
          label: item.label,
          value: Number(item.revenue ?? 0),
        })),
        totalDepositRevenueYear: Number(data.totalDepositRevenueYear ?? 0),
        totalPlatformCommissionYear: Number(
          data.totalPlatformCommissionYear ?? 0
        ),
        monthlyPlatformCommission: monthlyPlatformCommission.map((item) => ({
          label: item.label,
          value: Number(item.revenue ?? 0),
        })),
        dailyPlatformCommission: dailyPlatformCommission.map((item) => ({
          label: item.label,
          value: Number(item.revenue ?? 0),
        })),
        monthlyNewDoctorCounts: data.monthlyNewDoctorCounts ?? [],
        monthlyNewOrganisationCounts: data.monthlyNewOrganisationCounts ?? [],
        monthlyNewPatientCounts: data.monthlyNewPatientCounts ?? [],
        pendingActions: {
          pendingOphthalmologistVerifications:
            data.pendingActions?.pendingOphthalmologistVerifications ?? 0,
          pendingWithdrawalRequests:
            data.pendingActions?.pendingWithdrawalRequests ?? 0,
          pendingOrganisationOnboarding:
            data.pendingActions?.pendingOrganisationOnboarding ?? 0,
        },
        systemStatus: {
          liveConsultationSessions:
            data.systemStatus?.liveConsultationSessions ?? 0,
          apiHealthy: data.systemStatus?.apiHealthy ?? true,
          databaseHealthy: data.systemStatus?.databaseHealthy ?? false,
        },
        betterStack: {
          enabled: data.betterStack?.enabled ?? false,
          embedUrl: data.betterStack?.embedUrl ?? null,
          monitors: (data.betterStack?.monitors ?? []).map((item) => ({
            key: item.key,
            name: item.name,
            category: item.category,
            configured: Boolean(item.configured),
          })),
        },
        topDoctorsByConsultationRevenue: topDoctorsByConsultationRevenue.map(
          (d) => ({
            ophthalmologistId: d.ophthalmologistId,
            name: d.name,
            revenue: Number(d.revenue ?? 0),
            ratingAverage: Number(d.ratingAverage ?? 0),
            ratingCount: d.ratingCount ?? 0,
          })
        ),
        topOrganisationsByRating: topOrganisationsByRating.map((o) => ({
          organisationId: o.organisationId,
          name: o.name,
          ratingAverage: Number(o.ratingAverage ?? 0),
          ratingCount: o.ratingCount ?? 0,
        })),
      };
    } catch (error) {
      console.error('Failed to fetch dashboard metrics:', error);
      throw error;
    }
  },

  async getPartTimeSlotUsage(
    fromDate: string,
    toDate: string
  ): Promise<SystemAdminPartTimeSlotQuotaUsage[]> {
    try {
      const response = await api.get<
        ApiResponse<AdminPartTimeSlotQuotaUsageDto[]>
      >(API_ENDPOINTS.SYSTEM_ADMIN.DASHBOARD.PART_TIME_SLOT_USAGE, {
        params: {
          fromDate,
          toDate,
        },
      });

      const rows = response.data.data ?? [];
      return rows.map((item) => ({
        date: item.date,
        usedSlots: Number(item.usedSlots ?? 0),
        quota: Number(item.quota ?? 0),
        remainingSlots: Number(item.remainingSlots ?? 0),
      }));
    } catch (error) {
      console.error('Failed to fetch part-time slot quota usage:', error);
      throw error;
    }
  },

  async getDoctorWorkloads(
    params: SystemAdminDoctorWorkloadQueryParams
  ): Promise<SystemAdminDoctorWorkloadPagedResult> {
    try {
      const response = await api.get<
        ApiResponse<AdminPagedResult<AdminDoctorWorkloadListItemDto>>
      >(API_ENDPOINTS.SYSTEM_ADMIN.DASHBOARD.DOCTOR_WORKLOADS, {
        params: {
          periodType: params.periodType,
          date: params.date,
          searchTerm: params.searchTerm || undefined,
          employmentType: params.employmentType || undefined,
          status: params.status || undefined,
          warningOnly: params.warningOnly ?? false,
          pageNumber: params.pageNumber ?? 1,
          pageSize: params.pageSize ?? 10,
        },
      });

      const pagedResult = response.data.data;
      if (!pagedResult) {
        return {
          items: [],
          pageNumber: params.pageNumber ?? 1,
          pageSize: params.pageSize ?? 10,
          totalPages: 0,
          totalCount: 0,
          hasPrevious: false,
          hasNext: false,
        };
      }

      return {
        items: (pagedResult.items ?? []).map((item) => ({
          doctorId: item.doctorId,
          doctorName: item.doctorName,
          email: item.email ?? null,
          employmentType: item.employmentType,
          periodType: item.periodType,
          periodStart: item.periodStart,
          periodEnd: item.periodEnd,
          requiredHours: Number(item.requiredHours ?? 0),
          actualHours: Number(item.actualHours ?? 0),
          completionRate: Number(item.completionRate ?? 0),
          status: item.status,
          warningFlag: Boolean(item.warningFlag),
        })),
        pageNumber: pagedResult.pageNumber ?? 1,
        pageSize: pagedResult.pageSize ?? 10,
        totalPages: pagedResult.totalPages ?? 0,
        totalCount: pagedResult.totalCount ?? 0,
        hasPrevious: Boolean(pagedResult.hasPrevious),
        hasNext: Boolean(pagedResult.hasNext),
      };
    } catch (error) {
      console.error('Failed to fetch doctor workloads:', error);
      throw error;
    }
  },

  async getTodaySummary(): Promise<TodaySummaryDto> {
    const response = await api.get<ApiResponse<TodaySummaryDto>>(
      API_ENDPOINTS.SYSTEM_ADMIN.DASHBOARD.TODAY_SUMMARY
    );
    const data = response.data.data;
    return {
      totalAppointments: data?.totalAppointments ?? 0,
      checkedInPatients: data?.checkedInPatients ?? 0,
      completedVisits: data?.completedVisits ?? 0,
      noShowCount: data?.noShowCount ?? 0,
    };
  },

  async getSlotUtilization(): Promise<SlotUtilizationDto> {
    const response = await api.get<ApiResponse<SlotUtilizationDto>>(
      API_ENDPOINTS.SYSTEM_ADMIN.DASHBOARD.SLOT_UTILIZATION
    );
    const data = response.data.data;
    return {
      totalSlots: data?.totalSlots ?? 0,
      bookedSlots: data?.bookedSlots ?? 0,
      remainingCapacity: data?.remainingCapacity ?? 0,
      utilizationRate: data?.utilizationRate ?? 0,
    };
  },

  async getLiveQueue(): Promise<LiveQueueItemDto[]> {
    const response = await api.get<ApiResponse<LiveQueueItemDto[]>>(
      API_ENDPOINTS.SYSTEM_ADMIN.DASHBOARD.LIVE_QUEUE
    );
    const data = response.data.data ?? [];
    return data.map((item) => ({
      visitId: item.visitId,
      patientName: item.patientName,
      status: item.status,
      assignedDoctorName: item.assignedDoctorName,
      waitingTimeMinutes: item.waitingTimeMinutes ?? 0,
      checkedInAt: item.checkedInAt,
    }));
  },

  async getDoctorStatus(): Promise<DoctorStatusDto[]> {
    const response = await api.get<ApiResponse<DoctorStatusDto[]>>(
      API_ENDPOINTS.SYSTEM_ADMIN.DASHBOARD.DOCTOR_STATUS
    );
    const data = response.data.data ?? [];
    return data.map((item) => ({
      doctorId: item.doctorId,
      doctorName: item.doctorName,
      currentStatus: item.currentStatus,
      patientsHandledToday: item.patientsHandledToday ?? 0,
      activeLoad: item.activeLoad ?? 0,
    }));
  },
};
