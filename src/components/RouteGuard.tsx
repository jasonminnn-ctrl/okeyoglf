/**
 * RouteGuard — Protects authenticated routes and operator-only routes.
 * Now handles async session loading from Supabase Auth.
 */

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface RouteGuardProps {
  requiredRole?: "operator";
}

export function RouteGuard({ requiredRole }: RouteGuardProps) {
  const { role, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground text-sm">세션 확인 중...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole === "operator" && role !== "operator") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
