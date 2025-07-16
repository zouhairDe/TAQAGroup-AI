import React from "react";
import Link from "next/link";

// TailAdmin Badge Component
type BadgeVariant = "light" | "solid";
type BadgeSize = "sm" | "md";
type BadgeColor = "primary" | "success" | "error" | "warning" | "info" | "light" | "dark";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  color?: BadgeColor;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  children: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({
  variant = "light",
  color = "primary",
  size = "md",
  startIcon,
  endIcon,
  children,
}) => {
  const baseStyles =
    "inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium";

  const sizeStyles = {
    sm: "text-xs",
    md: "text-sm",
  };

  const variants = {
    light: {
      primary: "bg-blue-50 text-blue-500 dark:bg-blue-500/15 dark:text-blue-400",
      success: "bg-green-50 text-green-600 dark:bg-green-500/15 dark:text-green-500",
      error: "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-500",
      warning: "bg-orange-50 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400",
      info: "bg-blue-50 text-blue-500 dark:bg-blue-500/15 dark:text-blue-500",
      light: "bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-white/80",
      dark: "bg-gray-500 text-white dark:bg-white/5 dark:text-white",
    },
    solid: {
      primary: "bg-blue-500 text-white dark:text-white",
      success: "bg-green-500 text-white dark:text-white",
      error: "bg-red-500 text-white dark:text-white",
      warning: "bg-orange-500 text-white dark:text-white",
      info: "bg-blue-500 text-white dark:text-white",
      light: "bg-gray-400 dark:bg-white/5 text-white dark:text-white/80",
      dark: "bg-gray-700 text-white dark:text-white",
    },
  };

  const sizeClass = sizeStyles[size];
  const colorStyles = variants[variant][color];

  return (
    <span className={`${baseStyles} ${sizeClass} ${colorStyles}`}>
      {startIcon && <span className="mr-1">{startIcon}</span>}
      {children}
      {endIcon && <span className="ml-1">{endIcon}</span>}
    </span>
  );
};

// Avatar component for assigned users
const AvatarText: React.FC<{ initials: string; color?: string }> = ({ 
  initials, 
  color = "bg-blue-500" 
}) => (
  <div className={`w-8 h-8 ${color} rounded-full flex items-center justify-center text-white text-xs font-medium`}>
    {initials}
  </div>
);

// Anomaly interface
interface Anomaly {
  id: string;
  equipment: string;
  description: string;
  priority: "critical" | "medium" | "low";
  status: "nouvelle" | "en_cours" | "resolue";
  assignedTo: {
    name: string;
    initials: string;
    color: string;
  };
  date: string;
  site: string;
}

// Sample data with better structure
const anomaliesData: Anomaly[] = [
  {
    id: "AN-2024-001",
    equipment: "Turbine T1",
    description: "Vibration anormale détectée sur le rotor principal",
    priority: "critical",
    status: "en_cours",
    assignedTo: {
      name: "Ahmed Bennani",
      initials: "AB",
      color: "bg-blue-500"
    },
    date: "2024-01-15",
    site: "Noor Ouarzazate"
  },
  {
    id: "AN-2024-002",
    equipment: "Compresseur C3",
    description: "Fuite d'huile hydraulique mineure",
    priority: "medium",
    status: "nouvelle",
    assignedTo: {
      name: "Fatima Zahra",
      initials: "FZ",
      color: "bg-green-500"
    },
    date: "2024-01-14",
    site: "Jorf Lasfar"
  },
  {
    id: "AN-2024-003",
    equipment: "Générateur G2",
    description: "Température élevée dans le stator",
    priority: "low",
    status: "resolue",
    assignedTo: {
      name: "Youssef Alami",
      initials: "YA",
      color: "bg-purple-500"
    },
    date: "2024-01-13",
    site: "Noor Midelt"
  },
  {
    id: "AN-2024-004",
    equipment: "Transformateur TR1",
    description: "Isolants dégradés détectés",
    priority: "critical",
    status: "nouvelle",
    assignedTo: {
      name: "Saida Cherif",
      initials: "SC",
      color: "bg-red-500"
    },
    date: "2024-01-16",
    site: "Noor Ouarzazate"
  },
  {
    id: "AN-2024-005",
    equipment: "Pompe P7",
    description: "Performance en baisse - 15%",
    priority: "medium",
    status: "en_cours",
    assignedTo: {
      name: "Omar Benali",
      initials: "OB",
      color: "bg-orange-500"
    },
    date: "2024-01-12",
    site: "Jorf Lasfar"
  }
];

// Utility functions for badge colors
const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case "critical":
      return <Badge color="error" size="sm">Critique</Badge>;
    case "medium":
      return <Badge color="warning" size="sm">Normale</Badge>;
    case "low":
      return <Badge color="success" size="sm">Faible</Badge>;
    default:
      return <Badge color="light" size="sm">-</Badge>;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "nouvelle":
      return <Badge color="info" size="sm">Nouvelle</Badge>;
    case "en_cours":
      return <Badge color="warning" size="sm">En cours</Badge>;
    case "resolue":
      return <Badge color="success" size="sm">Résolue</Badge>;
    default:
      return <Badge color="light" size="sm">-</Badge>;
  }
};

// Arrow Right Icon
const ArrowRightIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
    <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
  </svg>
);

// View/Edit Icons
const ViewIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
  </svg>
);

export default function RecentAnomalies() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white pt-4 dark:border-gray-800 dark:bg-white/[0.03]">
      {/* Header */}
      <div className="flex flex-col gap-4 px-6 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Anomalies Récentes
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Dernières anomalies signalées sur les sites
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd"/>
            </svg>
            Filtrer
          </button>
          <Link
            href="/anomalies"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-500"
          >
            Voir tout
            <ArrowRightIcon />
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="max-w-full overflow-x-auto">
        <table className="w-full border-collapse table-auto">
          {/* Table Header */}
          <thead>
            <tr className="border-t border-gray-200 dark:border-gray-800">
              <th className="px-6 py-3 font-medium text-left text-gray-500 text-sm dark:text-gray-400">
                ID / Équipement
              </th>
              <th className="px-6 py-3 font-medium text-left text-gray-500 text-sm dark:text-gray-400">
                Description
              </th>
              <th className="px-6 py-3 font-medium text-left text-gray-500 text-sm dark:text-gray-400">
                Priorité
              </th>
              <th className="px-6 py-3 font-medium text-left text-gray-500 text-sm dark:text-gray-400">
                Statut
              </th>
              <th className="px-6 py-3 font-medium text-left text-gray-500 text-sm dark:text-gray-400">
                Assigné à
              </th>
              <th className="px-6 py-3 font-medium text-center text-gray-500 text-sm dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {anomaliesData.map((anomaly, index) => (
              <tr
                key={anomaly.id}
                className="border-t border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/[0.02] transition-colors"
              >
                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-400">
                  <div className="flex flex-col">
                    <span className="font-mono text-xs text-gray-500 dark:text-gray-400 mb-1">
                      {anomaly.id}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {anomaly.equipment}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {anomaly.site}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-400 max-w-xs">
                  <div className="truncate" title={anomaly.description}>
                    {anomaly.description}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {anomaly.date}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {getPriorityBadge(anomaly.priority)}
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(anomaly.status)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <AvatarText
                      initials={anomaly.assignedTo.initials}
                      color={anomaly.assignedTo.color}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {anomaly.assignedTo.name}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Technicien
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button 
                      className="text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 p-1"
                      title="Voir détails"
                    >
                      <ViewIcon />
                    </button>
                    <button 
                      className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white p-1"
                      title="Modifier"
                    >
                      <EditIcon />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 