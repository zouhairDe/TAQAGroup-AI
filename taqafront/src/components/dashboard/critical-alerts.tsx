"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import { 
  AlertTriangle, 
  X, 
  Clock, 
  MapPin,
  Zap,
  ExternalLink,
  Phone,
  Eye,
  ChevronRight
} from "lucide-react";

interface CriticalAlert {
  id: string;
  title: string;
  time: string;
  severity: "critical";
  location: string;
  equipment: string;
  temperature?: string;
  pressure?: string;
  vibration?: string;
  lastReading?: string;
  status: "active" | "assigned" | "investigating" | "resolved";
  actionRequired: boolean;
}

interface CriticalAlertsProps {
  alerts?: CriticalAlert[];
  isLoading?: boolean;
  error?: string;
}

const mockCriticalAlerts: CriticalAlert[] = [
  {
    id: "CRIT-001",
    title: "Arrêt d'urgence - Turbine T1",
    location: "Noor Ouarzazate",
    equipment: "TUR-001-OUA",
    time: "Il y a 5 min",
    severity: "critical",
    temperature: "95°C",
    status: "active",
    actionRequired: true
  },
  {
    id: "CRIT-002", 
    title: "Surchauffe transformateur T3",
    location: "Noor Midelt",
    equipment: "TRA-003-MID",
    time: "Il y a 12 min",
    severity: "critical",
    pressure: "8.5 bar",
    status: "investigating",
    actionRequired: true
  },
  {
    id: "CRIT-003",
    title: "Défaillance système contrôle",
    location: "Noor Atlas",
    equipment: "SCA-001-ATL",
    time: "Il y a 8 min",
    severity: "critical",
    lastReading: "Aucune",
    status: "assigned",
    actionRequired: false
  }
];

const getSeverityConfig = (severity: string) => {
  switch (severity) {
    case 'critical':
      return {
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        leftBorder: 'border-l-red-500',
        iconBg: 'bg-red-500',
        textColor: 'text-red-800',
        badgeVariant: 'destructive' as const,
        icon: Zap
      };
    case 'high':
      return {
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        leftBorder: 'border-l-orange-500',
        iconBg: 'bg-orange-500',
        textColor: 'text-orange-800',
        badgeVariant: 'secondary' as const,
        icon: AlertTriangle
      };
    default:
      return {
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        leftBorder: 'border-l-yellow-500',
        iconBg: 'bg-yellow-500',
        textColor: 'text-yellow-800',
        badgeVariant: 'secondary' as const,
        icon: AlertTriangle
      };
  }
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'active':
      return { label: 'Actif', color: 'bg-red-100 text-red-700', pulse: true };
    case 'assigned':
      return { label: 'Assigné', color: 'bg-blue-100 text-blue-700', pulse: false };
    case 'investigating':
      return { label: 'En cours', color: 'bg-yellow-100 text-yellow-700', pulse: false };
    case 'resolved':
      return { label: 'Résolu', color: 'bg-green-100 text-green-700', pulse: false };
    default:
      return { label: 'Inconnu', color: 'bg-gray-100 text-gray-700', pulse: false };
  }
};

export function CriticalAlerts({ alerts, isLoading, error }: CriticalAlertsProps) {
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  // Use provided alerts or fallback to mock data
  const dataAlerts = alerts || mockCriticalAlerts;
  
  const visibleAlerts = dataAlerts
    .filter(alert => !dismissedAlerts.includes(alert.id))
    .slice(0, 2); // Show only 2 alerts

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => [...prev, alertId]);
  };

  if (visibleAlerts.length === 0) {
    return (
      <Card className="border-green-200 bg-green-50">
        <div className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              </div>
              <div>
                <h3 className="font-medium text-green-800 text-sm">Système nominal</h3>
                <p className="text-xs text-green-600">Aucune alerte critique</p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800 border-green-300 text-xs">
              OK
            </Badge>
                            </div>
                </div>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
          <h3 className="font-medium text-gray-900 text-sm">
            Alertes critiques ({dataAlerts.filter(a => !dismissedAlerts.includes(a.id)).length})
          </h3>
        </div>
        <Button variant="ghost" size="sm" className="text-xs h-6 px-2">
          <Eye className="h-3 w-3 mr-1" />
          Tout voir
        </Button>
      </div>

      {/* Compact Alerts */}
      <div className="space-y-1.5">
        {visibleAlerts.map((alert) => {
          const severityConfig = getSeverityConfig(alert.severity);
          const statusConfig = getStatusConfig(alert.status);
          const Icon = severityConfig.icon;

          return (
            <Card 
              key={alert.id}
              className={`${severityConfig.bgColor} ${severityConfig.borderColor} ${severityConfig.leftBorder} border-l-3 transition-all hover:shadow-sm`}
            >
              <div className="px-3">
                <div className="flex items-center gap-3">
                  {/* Compact Icon */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className={`w-6 h-6 ${severityConfig.iconBg} rounded-full flex items-center justify-center ${
                      statusConfig.pulse ? 'animate-pulse' : ''
                    }`}>
                      <Icon className="h-3 w-3 text-white" />
                    </div>
                    <Badge variant={severityConfig.badgeVariant} className="text-xs px-1.5 py-0">
                      {alert.severity.toUpperCase()}
                    </Badge>
                  </div>

                  {/* Compact Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-medium ${severityConfig.textColor} text-sm truncate`}>
                        {alert.title}
                      </h4>
                    </div>

                    {/* Compact Details */}
                    <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{alert.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 flex-shrink-0" />
                        <span>{alert.time}</span>
                      </div>
                      <div className="font-semibold text-blue-600">
                        {alert.equipment}
                      </div>
                    </div>

                    {/* Compact Actions */}
                    <div className="flex items-center gap-1.5">
                      <Button 
                        size="sm" 
                        className="bg-red-600 hover:bg-red-700 text-white h-6 text-xs px-2"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Traiter
                      </Button>
                      
                      {alert.actionRequired && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-orange-300 text-orange-700 hover:bg-orange-50 h-6 text-xs px-2"
                        >
                          <Phone className="h-3 w-3 mr-1" />
                          Action
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Centered Status Badge and Dismiss Button */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className={`px-1.5 py-0.5 rounded text-xs font-medium ${statusConfig.color}`}>
                      {statusConfig.label}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissAlert(alert.id)}
                      className="text-gray-400 hover:text-gray-600 p-1 h-6 w-6"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                              </div>
          </div>
        </div>
            </Card>
          );
        })}
      </div>

      {/* Compact Footer */}
      {dataAlerts.filter(a => !dismissedAlerts.includes(a.id)).length > 2 && (
        <div className="text-center">
          <Button variant="ghost" size="sm" className="text-xs h-6 px-3 text-gray-500">
            +{dataAlerts.filter(a => !dismissedAlerts.includes(a.id)).length - 2} autres alertes
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
} 