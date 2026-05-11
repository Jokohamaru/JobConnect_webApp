"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authService } from "@/lib/auth-service";
import { logoutHelper } from "@/lib/logout-helper";

// Cấu trúc dữ liệu User giải mã từ Token
export interface User {
  id: string;
  email: string;
  role: string; // "ADMIN" | "CANDIDATE" | "RECRUITER"
  fullName?: string;
  firstName?: string | null;
  lastName?: string | null;
  avaUrl?: string | null; // Avatar URL
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hàm giải mã JWT Token đơn giản (không cần cài thêm thư viện)
const decodeJwt = (token: string): User | null => {
  try {
    const decoded = authService.decodeToken(token);
    if (!decoded) return null;

    // Backend trả về: { sub: user.id, email: user.email, role: user.role, firstName, lastName, avaUrl }
    const firstName = decoded.firstName || null;
    const lastName = decoded.lastName || null;
    const fullName = [firstName, lastName].filter(Boolean).join(' ') || decoded.name || decoded.fullName || null;
    
    return {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      fullName,
      firstName,
      lastName,
      avaUrl: decoded.avaUrl || null,
    };
  } catch (error) {
    console.error("Failed to decode token", error);
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Chạy một lần khi load trang để kiểm tra xem đã có token trong localStorage chưa
    const storedToken = authService.getToken();
    if (storedToken) {
      const decodedUser = decodeJwt(storedToken);
      if (decodedUser) {
        setIsAuthenticated(true);
        setUser(decodedUser);
        setToken(storedToken);
      } else {
        // Token không hợp lệ, xóa đi
        authService.removeToken();
      }
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string) => {
    authService.saveToken(newToken);
    const decodedUser = decodeJwt(newToken);
    if (decodedUser) {
      setIsAuthenticated(true);
      setUser(decodedUser);
      setToken(newToken);
    }
  };

  const logout = () => {
    // Remove token from localStorage and cookies
    authService.removeToken();
    
    // Clear all auth data (localStorage, sessionStorage, cookies)
    logoutHelper.clearAllAuthData();
    
    // Clear auth state
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

