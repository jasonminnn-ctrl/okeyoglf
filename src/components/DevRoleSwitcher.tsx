/**
 * DevRoleSwitcher — Dev/mock-only role toggle.
 * Only renders when AuthContext is using mock auth (import.meta.env.DEV).
 * Never visible in production builds.
 */

import { useAuth, type UserRole } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Shield, User } from "lucide-react";

const IS_DEV = import.meta.env.DEV;

export function DevRoleSwitcher() {
  if (!IS_DEV) return null;

  const { role, login } = useAuth();

  const switchTo = (target: UserRole) => {
    if (role === target) return;
    login(target === "operator" ? "operator@okeygolf.com" : "admin@okeygolf.com", "", target);
  };

  return (
    <div className="flex items-center gap-1.5 rounded-md border border-dashed border-amber-500/40 bg-amber-500/5 px-2 py-1">
      <span className="text-[9px] text-amber-500 font-mono mr-1">DEV</span>
      <button
        onClick={() => switchTo("customer")}
        className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] transition-colors ${
          role === "customer"
            ? "bg-primary/15 text-primary font-medium"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <User className="h-3 w-3" />
        고객
      </button>
      <button
        onClick={() => switchTo("operator")}
        className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] transition-colors ${
          role === "operator"
            ? "bg-primary/15 text-primary font-medium"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Shield className="h-3 w-3" />
        운영자
      </button>
    </div>
  );
}
