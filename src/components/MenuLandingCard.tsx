import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MenuLandingCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color?: string;
  url?: string;
  onClick?: () => void;
  badge?: string;
  locked?: boolean;
}

export function MenuLandingCard({ title, description, icon: Icon, color = "bg-primary/10 text-primary", url, onClick, badge, locked }: MenuLandingCardProps) {
  const navigate = useNavigate();
  const handleClick = () => {
    if (locked) return;
    if (onClick) onClick();
    else if (url) navigate(url);
  };

  return (
    <Card
      className={cn(
        "bg-card/50 border-border/50 transition-all",
        locked ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
      )}
      onClick={handleClick}
    >
      <CardContent className="pt-5">
        <div className="flex items-start justify-between mb-3">
          <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", color)}>
            {locked ? <Lock className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
          </div>
          {badge && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">{badge}</span>
          )}
        </div>
        <h3 className="font-medium text-sm">{title}</h3>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{description}</p>
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
