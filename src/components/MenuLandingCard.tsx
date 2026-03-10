import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon, Lock, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { FeatureAccessResult } from "@/lib/feature-access";

interface MenuLandingCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color?: string;
  url?: string;
  onClick?: () => void;
  badge?: string;
  locked?: boolean;
  /** Phase 5: feature access result from central policy */
  access?: FeatureAccessResult;
  children?: React.ReactNode;
}

export function MenuLandingCard({ title, description, icon: Icon, color = "bg-primary/10 text-primary", url, onClick, badge, locked, access, children }: MenuLandingCardProps) {
  const navigate = useNavigate();

  // Determine lock state from access policy or legacy prop
  const isHidden = access && !access.visible;
  const isLocked = access ? !access.enabled : !!locked;
  const lockMessage = access?.lockReason;

  if (isHidden) return null;

  const handleClick = () => {
    if (isLocked) return;
    if (onClick) onClick();
    else if (url) navigate(url);
  };

  return (
    <Card
      className={cn(
        "bg-card/50 border-border/50 transition-all",
        isLocked ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
      )}
      onClick={handleClick}
    >
      <CardContent className="pt-5">
        <div className="flex items-start justify-between mb-3">
          <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", isLocked ? "bg-muted/40" : color)}>
            {isLocked ? <Lock className="h-4 w-4 text-muted-foreground" /> : <Icon className="h-4 w-4" />}
          </div>
          <div className="flex items-center gap-1.5">
            {badge && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">{badge}</span>
            )}
            {access?.requiresCredit && access.enabled && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground flex items-center gap-0.5">
                <CreditCard className="h-2.5 w-2.5" /> {access.creditCost}
              </span>
            )}
          </div>
        </div>
        <h3 className="font-medium text-sm">{title}</h3>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{description}</p>
        {isLocked && lockMessage && (
          <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
            <Lock className="h-2.5 w-2.5" /> {lockMessage}
          </p>
        )}
        {children}
      </CardContent>
    </Card>
  );
}

interface MenuLandingGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
}

export function MenuLandingGrid({ children, columns = 3 }: MenuLandingGridProps) {
  return (
    <div className={cn(
      "grid gap-4",
      columns === 2 && "grid-cols-1 md:grid-cols-2",
      columns === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      columns === 4 && "grid-cols-2 lg:grid-cols-4"
    )}>
      {children}
    </div>
  );
}
