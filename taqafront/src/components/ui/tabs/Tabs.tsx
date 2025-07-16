"use client";
import React, { createContext, useContext, ReactNode } from "react";

interface TabsContextType {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({ value, onValueChange, children }) => {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div>{children}</div>
    </TabsContext.Provider>
  );
};

interface TabsListProps {
  children: ReactNode;
  className?: string;
}

export const TabsList: React.FC<TabsListProps> = ({ children, className = "" }) => {
  return (
    <div className={`flex bg-gray-100 dark:bg-gray-800/50 p-1 rounded-lg ${className}`}>
      {children}
    </div>
  );
};

interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, children, className = "" }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger must be used within Tabs");

  const { value: currentValue, onValueChange } = context;
  const isActive = currentValue === value;

  return (
    <button
      onClick={() => onValueChange(value)}
      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
        isActive
          ? "bg-white text-gray-900 shadow-sm dark:bg-white/10 dark:text-white"
          : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
      } ${className}`}
    >
      {children}
    </button>
  );
};

interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export const TabsContent: React.FC<TabsContentProps> = ({ value, children, className = "" }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsContent must be used within Tabs");

  const { value: currentValue } = context;
  
  if (currentValue !== value) return null;

  return <div className={className}>{children}</div>;
}; 