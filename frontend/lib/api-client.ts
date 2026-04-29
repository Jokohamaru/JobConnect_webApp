/**
 * API Client for JobConnect Frontend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const tokenManager = {
  getAccessToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setTokens: (accessToken: string, refreshToken: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  clearTokens: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  statusCode?: number;
}

interface RequestConfig extends RequestInit {
  skipAuth?: boolean;
}

export async function request<T = any>(
  endpoint: string,
  config: RequestConfig = {}
): Promise<ApiResponse<T>> {
  const { skipAuth = false, ...fetchConfig } = config;
  
  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchConfig.headers as Record<string, string>),
  };

  if (!skipAuth) {
    const accessToken = tokenManager.getAccessToken();
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
  }

  try {
    const response = await fetch(url, {
      ...fetchConfig,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        error: errorData.message || `Request failed with status ${response.status}`,
        statusCode: response.status,
      };
    }

    if (response.status === 204) {
      return { data: null as T, statusCode: 204 };
    }

    const data = await response.json();
    return { data, statusCode: response.status };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Network error',
      statusCode: 0,
    };
  }
}

export async function get<T = any>(
  endpoint: string,
  config?: RequestConfig
): Promise<ApiResponse<T>> {
  return request<T>(endpoint, {
    ...config,
    method: 'GET',
  });
}

export async function post<T = any>(
  endpoint: string,
  data?: any,
  config?: RequestConfig
): Promise<ApiResponse<T>> {
  return request<T>(endpoint, {
    ...config,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

export async function patch<T = any>(
  endpoint: string,
  data?: any,
  config?: RequestConfig
): Promise<ApiResponse<T>> {
  return request<T>(endpoint, {
    ...config,
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  });
}

export async function del<T = any>(
  endpoint: string,
  config?: RequestConfig
): Promise<ApiResponse<T>> {
  return request<T>(endpoint, {
    ...config,
    method: 'DELETE',
  });
}
