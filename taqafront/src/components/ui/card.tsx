import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Props interfaces for Card, CardTitle, and CardDescription
interface CardProps {
  children?: ReactNode;
  className?: string;
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

interface CardDescriptionProps {
  children: ReactNode;
  className?: string;
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

// Card Component - unified version with both implementations
const Card: React.FC<CardProps> = ({ children, className = "" }) => {
  return (
    <div 
      data-slot="card"
      className={cn(
        "rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] shadow-theme-sm",
        className
      )}
    >
      {children}
    </div>
  );
};

// CardHeader Component - for compatibility with imported components
const CardHeader: React.FC<CardHeaderProps> = ({ children, className = "" }) => {
  return (
    <div className={cn("flex flex-col space-y-1.5 p-6", className)}>
      {children}
    </div>
  );
};

// CardContent Component - for compatibility with imported components
const CardContent: React.FC<CardContentProps> = ({ children, className = "" }) => {
  return (
    <div className={cn("p-6 pt-0", className)}>
      {children}
    </div>
  );
};

// CardTitle Component
const CardTitle: React.FC<CardTitleProps> = ({ children, className = "" }) => {
  return (
    <h4 className={cn("mb-1 font-medium text-gray-800 text-theme-xl dark:text-white/90", className)}>
      {children}
    </h4>
  );
};

// CardDescription Component
const CardDescription: React.FC<CardDescriptionProps> = ({ children, className = "" }) => {
  return (
    <p className={cn("text-sm text-gray-500 dark:text-gray-400", className)}>
      {children}
    </p>
  );
};

// Named exports for better flexibility and compatibility
export { Card, CardHeader, CardContent, CardTitle, CardDescription };
