import React from "react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-8 w-8", 
  lg: "h-12 w-12",
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  className,
  text,
}) => {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="flex flex-col items-center gap-3">
        {/* TAQA-branded spinner */}
        <div className={cn("relative", sizeClasses[size])}>
          {/* Outer ring */}
          <div 
            className={cn(
              "absolute inset-0 border-2 border-taqa-electric-blue/20 rounded-full",
              sizeClasses[size]
            )}
          />
          {/* Spinning part */}
          <div 
            className={cn(
              "absolute inset-0 border-2 border-transparent border-t-taqa-electric-blue rounded-full animate-spin",
              sizeClasses[size]
            )}
          />
          {/* Center dot */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-taqa-navy rounded-full" />
        </div>
        
        {/* Loading text */}
        {text && (
          <p className="text-sm text-muted-foreground animate-pulse">
            {text}
          </p>
        )}
      </div>
    </div>
  );
}; 