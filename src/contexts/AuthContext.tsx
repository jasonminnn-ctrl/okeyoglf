/**
 * AuthContext — Supabase Auth (Phase 11)
 * Provides user session, role, org_id to the app.
 * Maintains same public API as mock version for backward compat.
 */

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import { toast } from "sonner";

export type UserRole = "customer" | "operator";

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  orgId: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  role: UserRole;
  isOperator: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (email: string, password: string, displayName?: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  orgId: string | null;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const DEFAULT_ORG_ID = "00000000-0000-0000-0000-000000000001";

// ── DB helpers ──

async function fetchProfileOrgId(userId: string): Promise<{ orgId: string; displayName: string | null }> {
  const { data } = await supabase
    .from("profiles" as any)
    .select("org_id, display_name")
    .eq("id", userId)
    .single();

  if (!data) return { orgId: DEFAULT_ORG_ID, displayName: null };
  return { orgId: (data as any).org_id ?? DEFAULT_ORG_ID, displayName: (data as any).display_name };
}

async function fetchUserRole(userId: string): Promise<UserRole> {
  const { data } = await supabase
    .from("user_roles" as any)
    .select("role")
    .eq("user_id", userId);

  if (data?.some((r: any) => r.role === "operator")) return "operator";
  return "customer";
}

async function buildAuthUser(session: Session): Promise<AuthUser> {
  const userId = session.user.id;
  const [profile, role] = await Promise.all([fetchProfileOrgId(userId), fetchUserRole(userId)]);

  return {
    id: userId,
    email: session.user.email ?? "",
    name: profile.displayName ?? session.user.email?.split("@")[0] ?? "",
    role,
    orgId: profile.orgId,
  };
}

// ── Provider ──

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const loadingFailsafe = window.setTimeout(() => {
      if (mounted) setIsLoading(false);
    }, 4000);

    const resolveSession = async (session: Session | null) => {
      try {
        if (session) {
          const authUser = await buildAuthUser(session);
          if (mounted) setUser(authUser);
        } else {
          if (mounted) setUser(null);
        }
      } catch (err) {
        console.error("AuthContext: resolveSession failed", err);
        if (mounted) setUser(null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    // 1) auth listener first (do not await directly in callback)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" && hadSessionRef.current) {
        hadSessionRef.current = false;
        toast.error("세션이 만료되었습니다. 다시 로그인해 주세요.", { duration: 6000 });
      }
      if (session) hadSessionRef.current = true;
      void resolveSession(session);
    });

    // 2) then existing session
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        void resolveSession(session);
      })
      .catch((err) => {
        console.error("AuthContext: getSession failed", err);
        if (mounted) {
          setUser(null);
          setIsLoading(false);
        }
      });

    return () => {
      mounted = false;
      window.clearTimeout(loadingFailsafe);
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return {};
  }, []);

  const signup = useCallback(async (email: string, password: string, displayName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { display_name: displayName },
      },
    });
    if (error) return { error: error.message };
    return {};
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      role: user?.role ?? "customer",
      isOperator: user?.role === "operator",
      login,
      signup,
      logout,
      isAuthenticated: !!user,
      isLoading,
      orgId: user?.orgId ?? null,
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
