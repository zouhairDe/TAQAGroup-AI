import React, { ReactNode } from "react";

// Props interfaces for Card, CardTitle, and CardDescription
interface CardProps {
  children?: ReactNode; // Optional additional content
}

interface CardTitleProps {
  children: ReactNode;
}

interface CardDescriptionProps {
  children: ReactNode;
}

// Card Component
const Card: React.FC<CardProps> = ({ children }) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-6 py-5 dark:border-gray-800 dark:bg-white/[0.03]">
      {children}
    </div>
  );
};

// CardTitle Component
const CardTitle: React.FC<CardTitleProps> = ({ children }) => {
  return (
    <h4 className="mb-1 font-medium text-gray-800 text-theme-xl dark:text-white/90">
      {children}
    </h4>
  );
};

// CardDescription Component
const CardDescription: React.FC<CardDescriptionProps> = ({ children }) => {
  return <p className="text-sm text-gray-500 dark:text-gray-400">{children}</p>;
};

// Named exports for better flexibility
export { Card, CardTitle, CardDescription };
