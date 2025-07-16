"use client";

import React from "react";
import Link from "next/link";

// TailAdmin Card Components (matching template exactly)
interface CardProps {
  children?: React.ReactNode;
  className?: string;
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = "" }) => {
  return (
    <div className={`rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 ${className}`}>
      {children}
    </div>
  );
};

const CardTitle: React.FC<CardTitleProps> = ({ children, className = "" }) => {
  return (
    <h4 className={`mb-1 font-medium text-gray-800 text-xl dark:text-white/90 ${className}`}>
      {children}
    </h4>
  );
};

const CardDescription: React.FC<CardDescriptionProps> = ({ children, className = "" }) => {
  return <p className={`text-sm text-gray-500 dark:text-gray-400 ${className}`}>{children}</p>;
};

// Action Cards Data
const actionsData = [
  {
    id: 1,
    title: "Nouvelle Anomalie",
    description: "Signaler une nouvelle anomalie détectée sur site",
    href: "/anomalies/new",
    iconBg: "bg-blue-50 text-blue-500 dark:bg-blue-500/10",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M14 4C14.5523 4 15 4.44772 15 5V13H23C23.5523 13 24 13.4477 24 14C24 14.5523 23.5523 15 23 15H15V23C15 23.5523 14.5523 24 14 24C13.4477 24 13 23.5523 13 23V15H5C4.44772 15 4 14.5523 4 14C4 13.4477 4.44772 13 5 13H13V5C13 4.44772 13.4477 4 14 4Z"
          fill="currentColor"
        />
      </svg>
    ),
    showLink: true
  },
  {
    id: 2,
    title: "Planification",
    description: "Gérer les tâches de maintenance planifiées",
    href: "/planning",
    iconBg: "bg-orange-50 text-orange-500 dark:bg-orange-500/10",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8 2C8.55228 2 9 2.44772 9 3V4H19V3C19 2.44772 19.4477 2 20 2C20.5523 2 21 2.44772 21 3V4H22C23.1046 4 24 4.89543 24 6V22C24 23.1046 23.1046 24 22 24H6C4.89543 24 4 23.1046 4 22V6C4 4.89543 4.89543 4 6 4H7V3C7 2.44772 7.44772 2 8 2ZM6 10V22H22V10H6ZM8 12C8.55228 12 9 12.4477 9 13C9 13.5523 8.55228 14 8 14C7.44772 14 7 13.5523 7 13C7 12.4477 7.44772 12 8 12ZM13 12C13.5523 12 14 12.4477 14 13C14 13.5523 13.5523 14 13 14C12.4477 14 12 13.5523 12 13C12 12.4477 12.4477 12 13 12Z"
          fill="currentColor"
        />
      </svg>
    ),
    showLink: false
  },
  {
    id: 3,
    title: "Analyses",
    description: "Consulter les rapports et analyses de performance",
    href: "/analytics",
    iconBg: "bg-purple-50 text-purple-500 dark:bg-purple-500/10",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M4 6C4 4.89543 4.89543 4 6 4H10C11.1046 4 12 4.89543 12 6V22C12 23.1046 11.1046 24 10 24H6C4.89543 24 4 23.1046 4 22V6ZM6 6V22H10V6H6ZM16 10C16 8.89543 16.8954 8 18 8H22C23.1046 8 24 8.89543 24 10V22C24 23.1046 23.1046 24 22 24H18C16.8954 24 16 23.1046 16 22V10ZM18 10V22H22V10H18Z"
          fill="currentColor"
        />
      </svg>
    ),
    showLink: true
  },
  {
    id: 4,
    title: "Équipes",
    description: "Gérer les équipes et affectations techniques",
    href: "/teams",
    iconBg: "bg-green-50 text-green-500 dark:bg-green-500/10",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M14 4C16.2091 4 18 5.79086 18 8C18 10.2091 16.2091 12 14 12C11.7909 12 10 10.2091 10 8C10 5.79086 11.7909 4 14 4ZM14 6C12.8954 6 12 6.89543 12 8C12 9.10457 12.8954 10 14 10C15.1046 10 16 9.10457 16 8C16 6.89543 15.1046 6 14 6ZM8 14C9.10457 14 10 14.8954 10 16V22C10 23.1046 9.10457 24 8 24C6.89543 24 6 23.1046 6 22V16C6 14.8954 6.89543 14 8 14ZM20 14C21.1046 14 22 14.8954 22 16V22C22 23.1046 21.1046 24 20 24C18.8954 24 18 23.1046 18 22V16C18 14.8954 18.8954 14 20 14Z"
          fill="currentColor"
        />
      </svg>
    ),
    showLink: false
  }
];

// Enhanced recent actions with more industrial context
const recentActions = [
  {
    action: "Anomalie critique ABO-2024-158 détectée par IA",
    time: "Il y a 2 min",
    user: "Système IA",
    type: "ai",
    priority: "critical"
  },
  {
    action: "REX complété - Optimisation ventilation",
    time: "Il y a 8 min",
    user: "Youssef Bennani",
    type: "rex",
    priority: "normal"
  },
  {
    action: "Maintenance préventive planifiée T1",
    time: "Il y a 15 min",
    user: "Fatima Zahra",
    type: "maintenance",
    priority: "normal"
  },
  {
    action: "Import Oracle: 24 nouvelles anomalies",
    time: "Il y a 1h",
    user: "Système",
    type: "import",
    priority: "normal"
  },
  {
    action: "Prédiction panne compresseur C3",
    time: "Il y a 2h",
    user: "IA Prédictive",
    type: "prediction",
    priority: "warning"
  }
];

// System status indicators
const systemStatus = {
  oracle: { status: "connected", lastSync: "Il y a 5 min" },
  maximo: { status: "connected", lastSync: "Il y a 12 min" },
  iot: { status: "connected", sensors: 156 },
  ai: { status: "active", predictions: 8 },
  mobile: { status: "active", users: 24 }
};

const getActionTypeIcon = (type: string) => {
  switch (type) {
    case "ai": return Brain;
    case "rex": return Shield;
    case "maintenance": return Calendar;
    case "import": return Database;
    case "prediction": return TrendingUp;
    default: return Bell;
  }
};

const getActionTypeColor = (type: string, priority: string) => {
  if (priority === "critical") return "text-red-600";
  if (priority === "warning") return "text-yellow-600";
  
  switch (type) {
    case "ai": return "text-purple-600";
    case "rex": return "text-teal-600";
    case "maintenance": return "text-orange-600";
    case "import": return "text-blue-600";
    case "prediction": return "text-cyan-600";
    default: return "text-gray-600";
  }
};

// Quick Actions Component using TailAdmin template structure
export default function QuickActions() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Actions Rapides
        </h3>
            </div>
      <div className="p-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {actionsData.map((action) => (
            <div
                  key={action.id}
              className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 hover:shadow-lg transition-all duration-200"
            >
              <div>
                <div className={`mb-5 flex h-14 max-w-14 items-center justify-center rounded-[10.5px] ${action.iconBg}`}>
                  {action.icon}
              </div>
              
                <CardTitle>{action.title}</CardTitle>

                <CardDescription className="mb-4">
                  {action.description}
                </CardDescription>

                {action.showLink && (
                  <Link
                    href={action.href}
                    className="inline-flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    En savoir plus
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M14.0836 7.99888C14.0838 8.19107 14.0107 8.38334 13.8641 8.53001L9.86678 12.5301C9.57399 12.8231 9.09911 12.8233 8.80612 12.5305C8.51312 12.2377 8.51296 11.7629 8.80575 11.4699L11.526 8.74772L2.66602 8.74772C2.2518 8.74772 1.91602 8.41194 1.91602 7.99772C1.91602 7.58351 2.2518 7.24772 2.66602 7.24772L11.5216 7.24772L8.80576 4.53016C8.51296 4.23718 8.51311 3.7623 8.8061 3.4695C9.09909 3.1767 9.57396 3.17685 9.86676 3.46984L13.8292 7.43478C13.9852 7.57222 14.0836 7.77348 14.0836 7.99772C14.0836 7.99811 14.0836 7.9985 14.0836 7.99888Z"
                        fill="currentColor"
                      />
                    </svg>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 