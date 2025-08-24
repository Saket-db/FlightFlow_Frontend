import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    period: string;
  };
  icon?: ReactNode;
  trend?: "up" | "down" | "neutral";
  status?: "success" | "warning" | "danger" | "neutral";
  loading?: boolean;
}

export const KPICard = ({
  title,
  value,
  change,
  icon,
  trend = "neutral",
  status = "neutral",
  loading = false
}: KPICardProps) => {
  const statusColors = {
    success: "border-success/20 bg-success/5 text-success-foreground",
    warning: "border-warning/20 bg-warning/5 text-warning-foreground", 
    danger: "border-danger/20 bg-danger/5 text-danger-foreground",
    neutral: "border-border bg-card text-card-foreground"
  };

  const trendColors = {
    up: "text-success",
    down: "text-danger", 
    neutral: "text-muted-foreground"
  };

  if (loading) {
    return (
      <div className="bg-card border rounded-lg p-6 animate-pulse">
        <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
        <div className="h-8 bg-muted rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-muted rounded w-1/3"></div>
      </div>
    );
  }

  return (
    <div className={cn(
      "rounded-lg border p-6 transition-all duration-200 hover:shadow-md",
      statusColors[status]
    )}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold font-mono">{value}</p>
          {change && (
            <p className={cn("text-xs flex items-center gap-1", trendColors[trend])}>
              {trend === "up" && "↗"} 
              {trend === "down" && "↘"}
              {change.value > 0 ? "+" : ""}{change.value}% {change.period}
            </p>
          )}
        </div>
        {icon && (
          <div className="text-muted-foreground/60">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};