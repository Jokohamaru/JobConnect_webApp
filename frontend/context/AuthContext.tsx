'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { post, tokenManager } from '@/lib/api-client';

export enum UserRole {
  CANDIDATE = 'CANDIDATE',
  RECRUITER = 'RECRUITER',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
}

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

interface RegisterResponse {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const accessToken = tokenManager.getAccessToken();
      
      if (accessToken) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/users/me`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          if (response.ok) {
            const userData = await response.json();
            setUser({
              id: userData.id,
              email: userData.email,
              full_name: userData.full_name,
              role: userData.role,
            });
          } else {
            tokenManager.clearTokens();
          }
        } catch (error) {
          console.error('Failed to restore session:', error);
          tokenManager.clearTokens();
        }
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await post<LoginResponse>('/auth/login', {
        email,
        password,
      }, { skipAuth: true });

      if (response.error) {
        throw new Error(response.error);
      }

      if (!response.data) {
        throw new Error('Đăng nhập thất bại');
      }

      tokenManager.setTokens(
        response.data.access_token,
        response.data.refresh_token
      );

      setUser(response.data.user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = (): void => {
    tokenManager.clearTokens();
    setUser(null);
  };

  const register = async (data: RegisterData): Promise<void> => {
    try {
      const response = await post<RegisterResponse>('/auth/register', data, {
        skipAuth: true,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      if (!response.data) {
        throw new Error('Đăng ký thất bại');
      }

      await login(data.email, data.password);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
