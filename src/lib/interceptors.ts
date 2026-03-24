import {
  AxiosHeaders,
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import axios from 'axios';
import useAuthStore from '@/store/auth-store';
import { getItem } from './local-storage';
import { router } from './router';

export interface ConsoleError {
  status: number;
  data: unknown;
}

type FailedQueueItem = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';
const AUTH_BASE_URL = '/auth';

let isRefreshing = false;
let failedQueue: FailedQueueItem[] = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((request) => {
    if (error || !token) {
      request.reject(error);
      return;
    }

    request.resolve(token);
  });

  failedQueue = [];
};

const logoutAndRedirect = () => {
  useAuthStore.getState().logout();
  router.navigate('/login', { replace: true });
};

const shouldSkipRefresh = (config?: InternalAxiosRequestConfig) => {
  const url = config?.url ?? '';
  return (
    url.includes(`${AUTH_BASE_URL}/login`) ||
    url.includes(`${AUTH_BASE_URL}/google-login`) ||
    url.includes(`${AUTH_BASE_URL}/refresh`)
  );
};

const refreshAccessToken = async () => {
  const accessToken = getItem<string>(TOKEN_KEY);
  const refreshToken = getItem<string>(REFRESH_TOKEN_KEY);

  if (!accessToken || !refreshToken) {
    throw new Error('No tokens available for refresh');
  }

  const response = await axios.post<{
    data?: {
      succeeded?: boolean;
      accessToken?: string;
      refreshToken?: string;
      user?: unknown;
    };
  }>(
    `${import.meta.env.VITE_API_END_POINT as string}${AUTH_BASE_URL}/refresh`,
    {
      accessToken,
      refreshToken,
    }
  );

  const payload = response.data.data;
  if (!payload?.succeeded || !payload.accessToken || !payload.refreshToken) {
    throw new Error('Refresh token request failed');
  }

  window.localStorage.setItem(TOKEN_KEY, JSON.stringify(payload.accessToken));
  window.localStorage.setItem(
    REFRESH_TOKEN_KEY,
    JSON.stringify(payload.refreshToken)
  );

  if (payload.user) {
    window.localStorage.setItem(USER_KEY, JSON.stringify(payload.user));
    useAuthStore.getState().setUser(payload.user as never);
    useAuthStore.getState().setIsAuthenticated(true);
  }

  return payload.accessToken;
};

export const requestInterceptor = (
  config: InternalAxiosRequestConfig
): InternalAxiosRequestConfig => {
  const token = getItem<string>('token');
  config.headers = config.headers ?? new AxiosHeaders();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
};

export const successInterceptor = (response: AxiosResponse): AxiosResponse => {
  return response;
};

export const errorInterceptor = async (
  error: AxiosError
): Promise<AxiosResponse> => {
  const originalRequest = error.config as RetryableRequestConfig | undefined;

  if (
    error.response?.status === 401 &&
    originalRequest &&
    !originalRequest._retry &&
    !shouldSkipRefresh(originalRequest)
  ) {
    if (isRefreshing) {
      const token = await new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      });

      originalRequest.headers = originalRequest.headers ?? new AxiosHeaders();
      originalRequest.headers.set('Authorization', `Bearer ${token}`);
      return axios(originalRequest);
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const token = await refreshAccessToken();
      processQueue(null, token);
      originalRequest.headers = originalRequest.headers ?? new AxiosHeaders();
      originalRequest.headers.set('Authorization', `Bearer ${token}`);
      return axios(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      logoutAndRedirect();
      throw refreshError;
    } finally {
      isRefreshing = false;
    }
  }

  if (error.response) {
    const errorMessage: ConsoleError = {
      status: error.response.status,
      data: error.response.data,
    };
    console.error(errorMessage);
  } else if (error.request) {
    console.error(error.request);
  } else {
    console.error('Error', error.message);
  }

  throw error;
};
