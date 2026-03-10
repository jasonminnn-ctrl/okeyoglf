/**
 * RouteGuard — Protects operator-only routes from customer access.
 */

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface RouteGuardProps {
  requiredRole: "operator";
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
