/**
 * AuthContext — Mock role-based auth for customer/operator separation.
 * Provides user role to control sidebar visibility and route access.
 * Designed for future Supabase Auth migration.
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type UserRole = "customer" | "operator";

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextValue {
  user: AuthUser | null;
  role: UserRole;
  isOperator: boolean;
  login: (email: string, password: string, role?: UserRole) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const MOCK_USERS: Record<string, AuthUser> = {
  customer: { id: "user-001", email: "admin@okeygolf.com", name: "관리자", role: "customer" },
  operator: { id: "op-001", email: "operator@okeygolf.com", name: "운영자", role: "operator" },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(MOCK_USERS.customer);

  const login = useCallback((email: string, _password: string, role?: UserRole) => {
    // Mock: operator@okeygolf.com → operator, else customer
    const resolvedRole = role || (email.includes("operator") ? "operator" : "customer");
    setUser(MOCK_USERS[resolvedRole] || MOCK_USERS.customer);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      role: user?.role ?? "customer",
      isOperator: user?.role === "operator",
      login,
      logout,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
