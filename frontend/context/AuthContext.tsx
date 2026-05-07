"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authService } from "@/lib/auth-service";

// Cấu trúc dữ liệu User giải mã từ Token
export interface User {
  id: string;
  email: string;
  role: string; // "ADMIN" | "CANDIDATE" | "RECRUITER"
  fullName?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
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

    // Backend trả về: { sub: user.id, email: user.email, role: user.role }
    return {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      fullName: decoded.name || decoded.fullName,
    };
  } catch (error) {
    console.error("Failed to decode token", error);
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Chạy một lần khi load trang để kiểm tra xem đã có token trong localStorage chưa
    const token = authService.getToken();
    if (token) {
      const decodedUser = decodeJwt(token);
      if (decodedUser) {
        setIsAuthenticated(true);
        setUser(decodedUser);
      } else {
        // Token không hợp lệ, xóa đi
        authService.removeToken();
      }
    }
    setIsLoading(false);
  }, []);

  const login = (token: string) => {
    authService.saveToken(token);
    const decodedUser = decodeJwt(token);
    if (decodedUser) {
      setIsAuthenticated(true);
      setUser(decodedUser);
    }
  };

  const logout = () => {
    authService.removeToken();
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, isLoading, login, logout }}>
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

