import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { AlertTriangle, CheckCircle } from "lucide-react";
import React from "react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getSeverityLabel = (severity: string) => {
  switch (severity) {
    case "critical": return "Critique";
    case "medium": return "Normale";
    case "low": return "Faible";
    default: return severity;
  }
};

export const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "critical": return "text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/20";
    case "medium": return "text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20";
    case "low": return "text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/20";
    default: return "text-gray-700 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20";
  }
};

export const getSeverityIcon = (severity: string): React.ReactNode => {
  switch (severity) {
    case "critical": return React.createElement(AlertTriangle, { className: "h-6 w-6" });
    case "medium": return React.createElement(AlertTriangle, { className: "h-6 w-6" });
    case "low": return React.createElement(CheckCircle, { className: "h-6 w-6" });
    default: return React.createElement(AlertTriangle, { className: "h-6 w-6" });
  }
};

export const getStatusLabel = (status: string) => {
  switch (status) {
    case "new": return "Nouvelle";
    case "in_progress": return "En cours";
    case "resolved": return "Résolue";
    case "closed": return "Fermée";
    default: return status;
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case "new": return "text-blue-700 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20";
    case "in_progress": return "text-orange-700 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20";
    case "resolved": return "text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/20";
    case "closed": return "text-gray-700 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20";
    default: return "text-gray-700 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20";
  }
};
