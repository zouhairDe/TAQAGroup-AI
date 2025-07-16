import React from "react";

type BadgeVariant = "light" | "solid" | "outline";
type BadgeSize = "sm" | "md";
type BadgeColor =
  | "primary"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "light"
  | "dark";

interface BadgeProps {
  variant?: BadgeVariant; // Light or solid variant
  size?: BadgeSize; // Badge size
  color?: BadgeColor; // Badge color
  startIcon?: React.ReactNode; // Icon at the start
  endIcon?: React.ReactNode; // Icon at the end
  children: React.ReactNode; // Badge content
  className?: string; // Additional CSS classes
}

const Badge: React.FC<BadgeProps> = ({
  variant = "light",
  color = "primary",
  size = "md",
  startIcon,
  endIcon,
  children,
  className = "",
}) => {
  const baseStyles = "inline-flex items-center px-3 py-1 justify-center gap-1.5 rounded-lg font-medium";

  // Define size styles
  const sizeStyles = {
    sm: "text-xs",
    md: "text-sm",
  };

  // Define color styles for variants
  const variants = {
    light: {
      primary: "bg-taqa-electric-blue/10 text-taqa-electric-blue dark:bg-taqa-electric-blue/15 dark:text-taqa-electric-blue",
      success: "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500",
      error: "bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500",
      warning: "bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-400",
      info: "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
      light: "bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-white/80",
      dark: "bg-gray-500 text-white dark:bg-white/5 dark:text-white",
    },
    solid: {
      primary: "bg-taqa-electric-blue text-white dark:text-white",
      success: "bg-success-500 text-white dark:text-white",
      error: "bg-error-500 text-white dark:text-white",
      warning: "bg-warning-500 text-white dark:text-white",
      info: "bg-blue-500 text-white dark:text-white",
      light: "bg-gray-400 dark:bg-white/5 text-white dark:text-white/80",
      dark: "bg-gray-700 text-white dark:text-white",
    },
    outline: {
      primary: "border border-brand-500 text-brand-500 dark:border-brand-400 dark:text-brand-400",
      success: "border border-success-500 text-success-600 dark:border-success-500 dark:text-success-500",
      error: "border border-error-500 text-error-600 dark:border-error-500 dark:text-error-500",
      warning: "border border-warning-500 text-warning-600 dark:border-warning-500 dark:text-orange-400",
      info: "border border-blue-light-500 text-blue-light-500 dark:border-blue-light-500 dark:text-blue-light-500",
      light: "border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300",
      dark: "border border-gray-500 text-gray-700 dark:border-gray-400 dark:text-gray-300",
    },
  };

  // Get styles based on size and color variant
  const sizeClass = sizeStyles[size];
  const colorStyles = variants[variant][color];
  return (
    <span className={`${baseStyles} ${sizeClass} ${colorStyles} ${className}`}>
      {startIcon && <span className="mr-1">{startIcon}</span>}
      {children}
      {endIcon && <span className="ml-1">{endIcon}</span>}
    </span>
  );
};

export default Badge;
