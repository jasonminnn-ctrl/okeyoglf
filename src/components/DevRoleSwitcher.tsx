/**
 * DevRoleSwitcher — Shows current auth role in DEV mode (read-only).
 * Role switching is no longer possible with real Supabase Auth.
 * To test operator role, assign via user_roles table directly.
 */

import { useAuth } from "@/contexts/AuthContext";
import { Shield, User } from "lucide-react";

const IS_DEV = import.meta.env.DEV;

export function DevRoleSwitcher() {
  const { role, user } = useAuth();

  if (!IS_DEV || !user) return null;

  return (
    <div className="flex items-center gap-1.5 rounded-md border border-dashed border-amber-500/40 bg-amber-500/5 px-2 py-1">
      <span className="text-[9px] text-amber-500 font-mono mr-1">DEV</span>
      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
        {role === "operator" ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
        <span>{role === "operator" ? "운영자" : "고객"}</span>
      </div>
      <span className="text-[9px] text-muted-foreground truncate max-w-[120px]">{user.email}</span>
    </div>
  );
}
