"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
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

// ─── JWT Helpers ──────────────────────────────────────────────────────────────

const decodeJwt = (token: string): (User & { exp?: number }) | null => {
  try {
    const decoded = authService.decodeToken(token);
    if (!decoded) return null;

    const firstName = decoded.firstName || null;
    const lastName = decoded.lastName || null;
    const fullName =
      [firstName, lastName].filter(Boolean).join(" ") ||
      decoded.name ||
      decoded.fullName ||
      null;

    return {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      fullName,
      firstName,
      lastName,
      avaUrl: decoded.avaUrl || null,
      exp: decoded.exp,
    };
  } catch (error) {
    console.error("Failed to decode token", error);
    return null;
  }
};

/** Returns true if the JWT exp claim is in the past (with 10s buffer) */
const isExpired = (token: string): boolean => {
  try {
    const decoded = decodeJwt(token);
    if (!decoded?.exp) return true;
    return Date.now() / 1000 > decoded.exp - 10;
  } catch {
    return true;
  }
};

/** Milliseconds until the token expires */
const msUntilExpiry = (token: string): number => {
  try {
    const decoded = decodeJwt(token);
    if (!decoded?.exp) return 0;
    return Math.max(0, decoded.exp * 1000 - Date.now() - 10_000);
  } catch {
    return 0;
  }
};

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const expiryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const performLogout = () => {
    if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current);
    authService.removeToken();
    logoutHelper.clearAllAuthData();
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
  };

  const scheduleExpiry = (tok: string) => {
    if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current);
    const ms = msUntilExpiry(tok);
    if (ms <= 0) return;
    expiryTimerRef.current = setTimeout(() => {
      console.warn("Token expired — logging out automatically");
      performLogout();
    }, ms);
  };

  // ── On mount: restore session from localStorage ──
  useEffect(() => {
    const storedToken = authService.getToken();
    if (storedToken) {
      if (isExpired(storedToken)) {
        // Token has expired — clear it silently so user gets redirected to login
        console.warn("Stored token expired, clearing session");
        authService.removeToken();
        logoutHelper.clearAllAuthData();
      } else {
        const decodedUser = decodeJwt(storedToken);
        if (decodedUser) {
          setIsAuthenticated(true);
          setUser(decodedUser);
          setToken(storedToken);
          scheduleExpiry(storedToken);
        } else {
          authService.removeToken();
        }
      }
    }
    setIsLoading(false);

    return () => {
      if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = (newToken: string) => {
    authService.saveToken(newToken);
    const decodedUser = decodeJwt(newToken);
    if (decodedUser) {
      setIsAuthenticated(true);
      setUser(decodedUser);
      setToken(newToken);
      scheduleExpiry(newToken);
    }
  };

  const logout = () => {
    performLogout();
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, token, isLoading, login, logout }}
    >
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
