import { Plane } from "lucide-react";

interface AirplaneLoaderProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  variant?: "page" | "inline";
}

export const AirplaneLoader = ({ 
  message = "Loading flight data...", 
  size = "md",
  variant = "page" 
}: AirplaneLoaderProps) => {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8", 
    lg: "h-12 w-12"
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  };

  if (variant === "inline") {
    return (
      <div className="flex items-center gap-2">
        <Plane className={`${sizeClasses[size]} text-primary animate-airplane-fly`} />
        <span className={`${textSizes[size]} text-muted-foreground animate-pulse-slow`}>
          {message}
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-[200px] flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <Plane className={`${sizeClasses[size]} text-primary animate-airplane-fly`} />
        <div className="absolute top-1/2 left-0 h-0.5 w-16 bg-primary/20 rounded-full animate-pulse-slow" />
      </div>
      <p className={`${textSizes[size]} text-muted-foreground text-center animate-pulse-slow`}>
        {message}
      </p>
    </div>
  );
};

export const SkeletonCard = () => (
  <div className="animate-pulse bg-card border rounded-lg p-6">
    <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
    <div className="h-8 bg-muted rounded w-1/2 mb-4"></div>
    <div className="space-y-2">
      <div className="h-3 bg-muted rounded w-full"></div>
      <div className="h-3 bg-muted rounded w-3/4"></div>
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 5 }: { rows?: number }) => (
  <div className="animate-pulse">
    <div className="h-10 bg-muted rounded mb-4"></div>
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          <div className="h-4 bg-muted rounded flex-1"></div>
          <div className="h-4 bg-muted rounded w-20"></div>
          <div className="h-4 bg-muted rounded w-16"></div>
        </div>
      ))}
    </div>
  </div>
);