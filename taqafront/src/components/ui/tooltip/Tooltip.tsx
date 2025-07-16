import type React from "react";
import type { ReactNode } from "react";

type TooltipPosition = "top" | "right" | "bottom" | "left";
type TooltipTheme = "light" | "dark";

interface TooltipProps {
  children: ReactNode;
  content: string;
  position?: TooltipPosition;
  theme?: TooltipTheme;
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = "top",
  theme = "light",
}) => {
  const getPositionClasses = (pos: TooltipPosition) => {
    switch (pos) {
      case "top":
        return "bottom-full left-1/2 mb-2.5 -translate-x-1/2";
      case "right":
        return "left-full top-1/2 ml-2.5 -translate-y-1/2";
      case "bottom":
        return "top-full left-1/2 mt-2.5 -translate-x-1/2";
      case "left":
        return "right-full top-1/2 mr-2.5 -translate-y-1/2";
    }
  };

  const getArrowClasses = (pos: TooltipPosition) => {
    switch (pos) {
      case "top":
        return "-bottom-1 left-1/2 -translate-x-1/2";
      case "right":
        return "-left-1.5 top-1/2 -translate-y-1/2";
      case "bottom":
        return "-top-1 left-1/2 -translate-x-1/2";
      case "left":
        return "-right-1.5 top-1/2 -translate-y-1/2";
    }
  };

  const getThemeClasses = (themeType: TooltipTheme) => {
    return themeType === "light"
      ? "bg-white text-gray-700 dark:bg-[#1E2634] dark:text-white"
      : "text-white bg-[#1E2634]";
  };

  return (
    <div className="relative inline-block group">
      {children}
      <div
        className={`invisible absolute z-30 opacity-0 transition-opacity duration-300 group-hover:visible group-hover:opacity-100 ${getPositionClasses(
          position
        )}`}
      >
        <div className="relative">
          <div
            className={`${getThemeClasses(
              theme
            )} whitespace-nowrap rounded-lg  px-3 py-2 text-xs font-medium text-gray-700 drop-shadow-4xl dark:bg-[#1E2634] dark:text-white`}
          >
            {content}
          </div>
          <div
            className={`absolute h-3 w-4 rotate-45 ${getThemeClasses(
              theme
            )} ${getArrowClasses(position)}`}
          ></div>
        </div>
      </div>
    </div>
  );
};
