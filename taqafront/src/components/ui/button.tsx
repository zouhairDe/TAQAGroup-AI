import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Button variants function for external use
export const buttonVariants = (props?: { variant?: "primary" | "outline"; size?: "sm" | "md" }) => {
  const variant = props?.variant || "primary";
  const size = props?.size || "md";
  
  const sizeClasses = {
    sm: "px-4 py-3 text-sm",
    md: "px-5 py-3.5 text-sm",
  };

  const variantClasses = {
    primary: "bg-taqa-electric-blue text-white shadow-theme-xs hover:bg-taqa-navy disabled:bg-taqa-electric-blue/50",
    outline: "bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300",
  };

  return cn(
    "inline-flex items-center justify-center font-medium gap-2 rounded-lg transition",
    sizeClasses[size],
    variantClasses[variant]
  );
};

interface ButtonProps {
  children: ReactNode; // Button text or content
  size?: "sm" | "md"; // Button size
  variant?: "primary" | "outline"; // Button variant
  startIcon?: ReactNode; // Icon before the text
  endIcon?: ReactNode; // Icon after the text
  onClick?: () => void; // Click handler
  disabled?: boolean; // Disabled state
  className?: string; // Custom classes
  type?: "button" | "submit" | "reset"; // Button type
}

const Button: React.FC<ButtonProps> = ({
  children,
  size = "md",
  variant = "primary",
  startIcon,
  endIcon,
  onClick,
  className = "",
  disabled = false,
  type = "button",
}) => {


  return (
    <button
      type={type}
      className={cn(
        buttonVariants({ variant, size }),
        className,
        disabled && "cursor-not-allowed opacity-50"
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {startIcon && <span className="flex items-center">{startIcon}</span>}
      {children}
      {endIcon && <span className="flex items-center">{endIcon}</span>}
    </button>
  );
};

export default Button;
