/**
 * AuthContext — Mock role-based auth for customer/operator separation.
 * Provides user role to control sidebar visibility and route access.
 * Designed for future backend Auth migration.
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
const AUTH_STORAGE_KEY = "okeygolf-auth-user";

const MOCK_USERS: Record<string, AuthUser> = {
  customer: { id: "user-001", email: "admin@okeygolf.com", name: "관리자", role: "customer" },
  operator: { id: "op-001", email: "operator@okeygolf.com", name: "운영자", role: "operator" },
};

const readStoredUser = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as AuthUser;
    if (parsed?.role !== "customer" && parsed?.role !== "operator") return null;

    return MOCK_USERS[parsed.role];
  } catch {
    return null;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());

  const login = useCallback((email: string, _password: string, role?: UserRole) => {
    const resolvedRole = role || (email.includes("operator") ? "operator" : "customer");
    const nextUser = MOCK_USERS[resolvedRole] || MOCK_USERS.customer;

    setUser(nextUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
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
