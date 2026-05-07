"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireRole?: string[];
  redirectTo?: string;
}

export default function AuthGuard({
  children,
  requireAuth = false,
  requireRole,
  redirectTo = "/auth/login",
}: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, isLoading } = useAuth();

  useEffect(() => {
    // Wait for loading to finish
    if (isLoading) return;

    // If auth is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      const loginUrl = `${redirectTo}?redirect=${encodeURIComponent(pathname)}`;
      router.push(loginUrl);
      return;
    }

    // If specific role is required
    if (requireRole && user && !requireRole.includes(user.role)) {
      router.push("/unauthorized");
      return;
    }
  }, [isAuthenticated, user, isLoading, requireAuth, requireRole, router, pathname, redirectTo]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If auth is required but user is not authenticated, don't render children
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // If specific role is required but user doesn't have it, don't render children
  if (requireRole && user && !requireRole.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
