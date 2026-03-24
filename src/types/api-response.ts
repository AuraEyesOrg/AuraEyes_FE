export interface ApiResponse<T> {
  data: T;
  success?: boolean;
  succeeded?: boolean;
  message?: string;
  errors?: string[] | null;
  timestamp?: string;
}

export type ApiResponseMaybeWrapped<T> = T | ApiResponse<T>;

export function unwrapApiData<T>(payload: ApiResponseMaybeWrapped<T>): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    const wrapped = payload as ApiResponse<T>;
    if (wrapped.data !== undefined) {
      return wrapped.data;
    }
  }

  return payload as T;
}
