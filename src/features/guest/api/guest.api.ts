import axios from 'axios';
import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';

interface ApiEnvelope<T> {
  data?: T;
  result?: T;
  payload?: T;
}

type ServiceScope = 'api' | 'root';

export interface GuestOverviewMetrics {
  ophthalmologistCount: number | null;
  organisationCount: number | null;
  availableSlotCount: number | null;
  eyeHealthResourceCount: number | null;
}

export interface GuestServiceCheckTarget {
  endpoint: string;
  scope: ServiceScope;
  params?: Record<string, string | number | boolean>;
}

export type GuestServiceHealthStatus = 'online' | 'offline' | 'degraded';

export interface GuestServiceHealthResult {
  status: GuestServiceHealthStatus;
  responseTime?: number;
}

const DEFAULT_LIST_QUERY = {
  pageNumber: 1,
  pageSize: 1,
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const toNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
};

const extractCountFromRecord = (
  record: Record<string, unknown>
): number | null => {
  const countFields = [
    'totalCount',
    'total',
    'count',
    'totalItems',
    'TotalCount',
    'Total',
    'Count',
    'TotalItems',
  ] as const;

  for (const field of countFields) {
    const parsed = toNumber(record[field]);
    if (parsed !== null) {
      return parsed;
    }
  }

  const items = record.items ?? record.Items;
  if (Array.isArray(items)) {
    return items.length;
  }

  return null;
};

const extractCount = (payload: unknown): number | null => {
  if (!isRecord(payload)) {
    return null;
  }

  const directCount = extractCountFromRecord(payload);
  if (directCount !== null) {
    return directCount;
  }

  const nestedCandidates = [
    payload.data,
    payload.result,
    payload.payload,
    payload.value,
    payload.Data,
  ];

  for (const candidate of nestedCandidates) {
    if (!isRecord(candidate)) {
      continue;
    }

    const nestedCount = extractCountFromRecord(candidate);
    if (nestedCount !== null) {
      return nestedCount;
    }
  }

  return null;
};

const resolveRootBaseUrl = (): string => {
  const configuredApiBase =
    (import.meta.env.VITE_API_END_POINT as string) ?? '';
  return configuredApiBase.replace(/\/api\/?$/i, '');
};

const toAbsoluteRootUrl = (endpoint: string): string => {
  const normalizedEndpoint = endpoint.startsWith('/')
    ? endpoint
    : `/${endpoint}`;
  return `${resolveRootBaseUrl()}${normalizedEndpoint}`;
};

const fetchPublicCount = async (endpoint: string): Promise<number | null> => {
  try {
    const response = await api.get<ApiEnvelope<unknown>>(endpoint, {
      params: DEFAULT_LIST_QUERY,
    });
    return extractCount(response.data);
  } catch {
    return null;
  }
};

export const fetchGuestOverviewMetrics =
  async (): Promise<GuestOverviewMetrics> => {
    const [
      ophthalmologistCount,
      organisationCount,
      availableSlotCount,
      eyeHealthResourceCount,
    ] = await Promise.all([
      fetchPublicCount(API_ENDPOINTS.PUBLIC.PATIENT_SEARCH.OPHTHALMOLOGISTS),
      fetchPublicCount(API_ENDPOINTS.PUBLIC.PATIENT_SEARCH.ORGANISATIONS),
      fetchPublicCount(API_ENDPOINTS.PUBLIC.PATIENT_SEARCH.AVAILABLE_SLOTS),
      fetchPublicCount(API_ENDPOINTS.PUBLIC.RESOURCES.EYE_HEALTH),
    ]);

    return {
      ophthalmologistCount,
      organisationCount,
      availableSlotCount,
      eyeHealthResourceCount,
    };
  };

export const checkGuestServiceHealth = async (
  target: GuestServiceCheckTarget
): Promise<GuestServiceHealthResult> => {
  const startedAt = performance.now();

  try {
    const requestConfig = {
      timeout: 10000,
      params: target.params,
      validateStatus: (status: number) => status < 500,
    };

    const response =
      target.scope === 'root'
        ? await axios.get(toAbsoluteRootUrl(target.endpoint), requestConfig)
        : await api.get(target.endpoint, requestConfig);

    const responseTime = Math.round(performance.now() - startedAt);

    if (response.status === 200) {
      return {
        status: 'online',
        responseTime,
      };
    }

    if (response.status >= 400 && response.status < 500) {
      return {
        status: 'degraded',
        responseTime,
      };
    }

    return {
      status: 'offline',
      responseTime,
    };
  } catch {
    return {
      status: 'offline',
    };
  }
};
