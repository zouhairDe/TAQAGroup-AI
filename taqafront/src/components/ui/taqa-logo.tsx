import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface TAQALogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  priority?: boolean;
  variant?: "light" | "dark" | "auto"; // light = black text, dark = white text, auto = follows theme
}

const sizeClasses = {
  sm: "h-6",
  md: "h-10", 
  lg: "h-14",
  xl: "h-20",
};

export const TAQALogo: React.FC<TAQALogoProps> = ({
  className,
  size = "md",
  priority = false,
  variant = "auto",
}) => {
  const getLogoSrc = () => {
    if (variant === "light") {
      return "/logo-simple.svg"; // Dark text for light backgrounds
    } else if (variant === "dark") {
      return "/logo-simple-dark.svg"; // White text for dark backgrounds
    }
    // Auto variant - use CSS to show/hide based on theme
    return null;
  };

  const logoSrc = getLogoSrc();

  if (variant === "auto") {
    // Auto variant with theme-aware display
    return (
      <div className={cn("flex items-center", sizeClasses[size], className)}>
        {/* Light theme logo (dark text) */}
        <Image
          src="/logo-simple.svg"
          alt="TAQA Morocco"
          width={137.6}
          height={46}
          className="h-full w-auto dark:hidden"
          priority={priority}
        />
        {/* Dark theme logo (white text) */}
        <Image
          src="/logo-simple-dark.svg"
          alt="TAQA Morocco"
          width={137.6}
          height={46}
          className="h-full w-auto hidden dark:block"
          priority={priority}
        />
      </div>
    );
  }

  // Fixed variant
  return (
    <div className={cn("flex items-center", sizeClasses[size], className)}>
    </div>
  );
}; 