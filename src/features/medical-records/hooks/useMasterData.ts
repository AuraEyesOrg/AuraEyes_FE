import { useQuery } from '@tanstack/react-query';
import { masterDataApi } from '../api/master-data.api';

// Static data that never changes - cache indefinitely (Infinity staleTime)
const STATIC_OPTIONS = {
  staleTime: Infinity,
  gcTime: Infinity, // keep in cache forever for the session
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: 2,
};

// Geographic cascades: provinces of a country rarely change - cache 24h
const GEO_OPTIONS = {
  staleTime: 24 * 60 * 60 * 1000,
  gcTime: 24 * 60 * 60 * 1000,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  retry: 2,
};

export function useCountries() {
  return useQuery({
    queryKey: ['master-data', 'countries'],
    queryFn: masterDataApi.getCountries,
    ...STATIC_OPTIONS,
  });
}

export function useProvinces(enabled: boolean = true) {
  return useQuery({
    queryKey: ['master-data', 'provinces'],
    queryFn: masterDataApi.getProvinces,
    enabled,
    ...STATIC_OPTIONS,
  });
}

export function useDistricts(
  provinceCode: number | undefined | null,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['master-data', 'districts', provinceCode],
    queryFn: () => masterDataApi.getDistricts(provinceCode!),
    enabled: enabled && !!provinceCode,
    ...GEO_OPTIONS,
  });
}

export function useWards(
  districtCode: number | undefined | null,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['master-data', 'wards', districtCode],
    queryFn: () => masterDataApi.getWards(districtCode!),
    enabled: enabled && !!districtCode,
    ...GEO_OPTIONS,
  });
}
