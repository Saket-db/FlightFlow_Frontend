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
}

export const KPICard = ({
  title,
  value,
  change,
  icon,
  trend = "neutral",
  status = "neutral"
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
    neutral: "text-black"
  };

  return (
    <div className={cn(
      "rounded-lg border p-6 transition-all duration-200 hover:shadow-md",
      statusColors[status]
    )}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-black">{title}</p>
          <p className="text-3xl font-bold font-mono text-black">{value}</p>
          {change && (
            <p className={cn("text-xs flex items-center gap-1", trendColors[trend])}>
              {trend === "up" && "↗"} 
              {trend === "down" && "↘"}
              {change.value > 0 ? "+" : ""}{change.value}% {change.period}
            </p>
          )}
        </div>
        {icon && (
          <div className="text-black">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};