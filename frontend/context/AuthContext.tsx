"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// Cấu trúc dữ liệu User giải mã từ Token
export interface User {
  id: number;
  email: string;
  role: number;
  fullName: string;
  // Bạn có thể thêm các field khác nếu backend trả về trong token payload
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hàm giải mã JWT Token đơn giản (không cần cài thêm thư viện)
const decodeJwt = (token: string): User | null => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    const decoded = JSON.parse(jsonPayload);
    // Backend trả về: { sub: user.id, email: user.email, role: user.user_role }
    return {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      fullName: decoded.name, // Thêm dòng này
    };
  } catch (error) {
    console.error("Failed to decode token", error);
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Để tránh chớp nhoáng UI

  useEffect(() => {
    // Chạy một lần khi load trang để kiểm tra xem đã có token trong localStorage chưa
    const token = localStorage.getItem("access_token");
    if (token) {
      const decodedUser = decodeJwt(token);
      if (decodedUser) {
        setIsAuthenticated(true);
        setUser(decodedUser);
      } else {
        // Token không hợp lệ, xóa đi
        localStorage.removeItem("access_token");
      }
    }
    setIsLoading(false);
  }, []);

  const login = (token: string) => {
    localStorage.setItem("access_token", token);
    const decodedUser = decodeJwt(token);
    if (decodedUser) {
      setIsAuthenticated(true);
      setUser(decodedUser);
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    setIsAuthenticated(false);
    setUser(null);
  };

  // Tránh render children ngay lập tức nếu đang check localStorage
  // Tuy nhiên để SSR chạy tốt với Next.js, ta vẫn có thể render và chờ useEffect cập nhật state
  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
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
