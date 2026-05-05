import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import type { ApiResponse } from '@/types/api-response';
import { unwrapApiData } from '@/types/api-response';
import type {
  AuditLogDto,
  Organisation,
  PaginatedResponse,
  User,
} from '../types/system-admin.types';
import type { OphthalmologistListItem } from './ophthalmologist.api';
import type { PatientListItem } from './patient.api';

interface PagedQuery {
  pageNumber: number;
  pageSize: number;
}

export interface UserExportFilters {
  searchTerm?: string;
  role?: string;
  status?: string;
}

export interface PatientExportFilters {
  searchTerm?: string;
  status?: string;
}

export interface OrganisationExportFilters {
  searchTerm?: string;
  orgType?: string;
}

export interface OphthalmologistExportFilters {
  searchTerm?: string;
}

export interface AuditExportFilters {
  searchTerm?: string;
  action?: string;
  entityName?: string;
  userId?: string;
  fromDate?: string;
  toDate?: string;
}

const EXPORT_PAGE_SIZE = 200;

const collectAllPages = async <T>(
  fetchPage: (query: PagedQuery) => Promise<PaginatedResponse<T>>
): Promise<T[]> => {
  const allItems: T[] = [];
  let pageNumber = 1;
  let totalPages = 1;

  while (pageNumber <= totalPages) {
    const page = await fetchPage({ pageNumber, pageSize: EXPORT_PAGE_SIZE });

    allItems.push(...(page.items ?? []));
    totalPages = Math.max(page.totalPages || 1, 1);

    if (!page.hasNext || pageNumber >= totalPages) {
      break;
    }

    pageNumber += 1;
  }

  return allItems;
};

export const exportApi = {
  async getUsers(filters: UserExportFilters = {}): Promise<User[]> {
    return collectAllPages<User>(async ({ pageNumber, pageSize }) => {
      const response = await api.get<ApiResponse<PaginatedResponse<User>>>(
        API_ENDPOINTS.SYSTEM_ADMIN.USERS.LIST,
        {
          params: {
            pageNumber,
            pageSize,
            ...(filters.searchTerm && { searchTerm: filters.searchTerm }),
            ...(filters.role && { role: filters.role }),
            ...(filters.status && { status: filters.status }),
          },
        }
      );

      return unwrapApiData<PaginatedResponse<User>>(response.data);
    });
  },

  async getPatients(
    filters: PatientExportFilters = {}
  ): Promise<PatientListItem[]> {
    return collectAllPages<PatientListItem>(
      async ({ pageNumber, pageSize }) => {
        const response = await api.get<
          ApiResponse<PaginatedResponse<PatientListItem>>
        >(API_ENDPOINTS.SYSTEM_ADMIN.PATIENTS.LIST, {
          params: {
            pageNumber,
            pageSize,
            ...(filters.searchTerm && { searchTerm: filters.searchTerm }),
            ...(filters.status && { status: filters.status }),
          },
        });

        return unwrapApiData<PaginatedResponse<PatientListItem>>(response.data);
      }
    );
  },

  async getOrganisations(
    filters: OrganisationExportFilters = {}
  ): Promise<Organisation[]> {
    return collectAllPages<Organisation>(async ({ pageNumber, pageSize }) => {
      const response = await api.get<
        ApiResponse<PaginatedResponse<Organisation>>
      >(API_ENDPOINTS.SYSTEM_ADMIN.ORGANISATIONS.LIST, {
        params: {
          pageNumber,
          pageSize,
          ...(filters.searchTerm && { searchTerm: filters.searchTerm }),
          ...(filters.orgType && { orgType: filters.orgType }),
        },
      });

      return unwrapApiData<PaginatedResponse<Organisation>>(response.data);
    });
  },

  async getOphthalmologists(
    filters: OphthalmologistExportFilters = {}
  ): Promise<OphthalmologistListItem[]> {
    return collectAllPages<OphthalmologistListItem>(
      async ({ pageNumber, pageSize }) => {
        const response = await api.get<
          ApiResponse<PaginatedResponse<OphthalmologistListItem>>
        >(API_ENDPOINTS.SYSTEM_ADMIN.OPHTHALMOLOGISTS.LIST, {
          params: {
            pageNumber,
            pageSize,
            ...(filters.searchTerm && { searchTerm: filters.searchTerm }),
          },
        });

        return unwrapApiData<PaginatedResponse<OphthalmologistListItem>>(
          response.data
        );
      }
    );
  },

  async getAuditLogs(filters: AuditExportFilters = {}): Promise<AuditLogDto[]> {
    return collectAllPages<AuditLogDto>(async ({ pageNumber, pageSize }) => {
      const response = await api.get<
        ApiResponse<PaginatedResponse<AuditLogDto>>
      >(API_ENDPOINTS.SYSTEM_ADMIN.AUDIT_LOGS.LIST, {
        params: {
          pageNumber,
          pageSize,
          ...(filters.searchTerm && { searchTerm: filters.searchTerm }),
          ...(filters.action && { action: filters.action }),
          ...(filters.entityName && { entityName: filters.entityName }),
          ...(filters.userId && { userId: filters.userId }),
          ...(filters.fromDate && { fromDate: filters.fromDate }),
          ...(filters.toDate && { toDate: filters.toDate }),
        },
      });

      return unwrapApiData<PaginatedResponse<AuditLogDto>>(response.data);
    });
  },
};
