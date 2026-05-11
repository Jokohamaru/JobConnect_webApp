// API Service cho Authentication

import { cookies } from './cookies';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    role: 'CANDIDATE' | 'RECRUITER' | 'ADMIN';
  };
}

export interface RegisterRequest {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export const authService = {
  /**
   * Login user
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message || 'Đăng nhập thất bại');
    }

    const data: LoginResponse = await response.json();
    return data;
  },

  /**
   * Register user
   */
  async register(data: RegisterRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message || 'Đăng ký thất bại');
    }

    const result: LoginResponse = await response.json();
    return result;
  },

  /**
   * Save token to localStorage and cookies
   */
  saveToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
      
      // Also save to cookies for middleware (7 days)
      cookies.set('access_token', token, 7);
    }
  },

  /**
   * Get token from localStorage
   */
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  },

  /**
   * Remove token from localStorage and cookies
   */
  removeToken(): void {
    if (typeof window !== 'undefined') {
      // Remove from localStorage
      localStorage.removeItem('access_token');
      
      // Remove from sessionStorage (nếu có)
      sessionStorage.clear();
      
      // Remove from cookies
      cookies.remove('access_token');
      
      // Clear all cookies (optional - xóa tất cả cookies của domain)
      this.clearAllCookies();
    }
  },

  /**
   * Clear all cookies
   */
  clearAllCookies(): void {
    if (typeof window === 'undefined') return;
    
    const allCookies = document.cookie.split(';');
    
    for (let i = 0; i < allCookies.length; i++) {
      const cookie = allCookies[i];
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
      
      // Remove cookie with different path variations
      document.cookie = `${name}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      document.cookie = `${name}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=${window.location.hostname}`;
      document.cookie = `${name}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=.${window.location.hostname}`;
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  /**
   * Decode JWT token
   */
  decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Failed to decode token', error);
      return null;
    }
  },

  /**
   * Get user role from token
   */
  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;

    const decoded = this.decodeToken(token);
    return decoded?.role || null;
  },
};
