import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import type { ApiResponse } from '@/types/api-response';
import { unwrapApiData } from '@/types/api-response';

export interface Province {
  name: string;
  code: number;
}

export interface District {
  name: string;
  code: number;
}

export interface Ward {
  name: string;
  code: number;
}

export interface Country {
  name: string;
  isoCode: string;
}

export const masterDataApi = {
  getProvinces: async () => {
    const response = await api.get<ApiResponse<Province[]>>(
      API_ENDPOINTS.MASTER_DATA.PROVINCES
    );
    return unwrapApiData<Province[]>(response.data);
  },
  getDistricts: async (provinceCode: number) => {
    const response = await api.get<ApiResponse<District[]>>(
      API_ENDPOINTS.MASTER_DATA.DISTRICTS(provinceCode)
    );
    return unwrapApiData<District[]>(response.data);
  },
  getWards: async (districtCode: number) => {
    const response = await api.get<ApiResponse<Ward[]>>(
      API_ENDPOINTS.MASTER_DATA.WARDS(districtCode)
    );
    return unwrapApiData<Ward[]>(response.data);
  },
  getCountries: async () => {
    const response = await api.get<ApiResponse<Country[]>>(
      API_ENDPOINTS.MASTER_DATA.COUNTRIES
    );
    return unwrapApiData<Country[]>(response.data);
  },
};
