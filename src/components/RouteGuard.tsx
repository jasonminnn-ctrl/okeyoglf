/**
 * RouteGuard — Protects authenticated routes and operator-only routes.
 */

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface RouteGuardProps {
  requiredRole?: "operator";
}

export function RouteGuard({ requiredRole }: RouteGuardProps) {
  const { role, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole === "operator" && role !== "operator") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
