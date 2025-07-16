/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Users,
  Wrench,
  Zap,
  Shield,
  Target,
  BarChart3,
  Gauge,
  Timer,
  Calendar
} from "lucide-react";

// Enhanced mock data with real-time indicators
const stats = {
  anomalies: {
    critical: { current: 12, change: +2, trend: "up" as const, target: 5, alert: true },
    high: { current: 25, change: -3, trend: "down" as const, target: 20 },
    medium: { current: 48, change: +5, trend: "up" as const, target: 40 },
    low: { current: 156, change: -12, trend: "down" as const, target: 180 },
    total: { current: 241, change: -8, trend: "down" as const, target: 200 }
  },
  performance: {
    avgResolutionTime: { current: 2.4, target: 2.0, unit: "h", trend: "up", status: "warning" as const },
    resolutionRate: { current: 89, target: 95, unit: "%", trend: "down", status: "warning" as const },
    preventiveActions: { current: 45, change: +12, trend: "up" as const, target: 50 },
    teamEfficiency: { current: 92, target: 90, unit: "%", trend: "up", status: "good" as const },
    mtbf: { current: 168, target: 200, unit: "h", trend: "up", status: "good" as const },
    availability: { current: 96.8, target: 98.0, unit: "%", trend: "stable", status: "good" as const }
  },
  operational: {
    activeTickets: { current: 89, change: -5, trend: "down" },
    teamMembers: { current: 24, change: 0, trend: "stable" },
    equipmentUnits: { current: 156, change: +2, trend: "up" },
    maintenanceScheduled: { current: 8, change: +3, trend: "up" },
    energyOutput: { current: 245.6, target: 280.0, unit: "MW", trend: "up", status: "good" },
    systemUptime: { current: 99.2, target: 99.5, unit: "%", trend: "stable", status: "good" }
  },
  realTime: {
    lastUpdate: "00:00:00", // Will be updated on client side
    systemStatus: "operational",
    alertLevel: "medium"
  }
};

interface StatCardProps {
  title: string;
  value: number;
  change?: number;
  trend?: "up" | "down" | "stable";
  icon: React.ComponentType<{className?: string}>;
  color?: string;
  target?: number;
  unit?: string;
  progress?: number;
  status?: "good" | "warning" | "critical" | "info";
  alert?: boolean;
  subtitle?: string;
}

const StatCard = ({ 
  title, 
  value, 
  change, 
  trend, 
  icon: Icon, 
  color = "blue",
  target,
  unit = "",
  progress,
  status,
  alert,
  subtitle
}: StatCardProps) => {
  const getColorClasses = (color: string, status?: string) => {
    if (status) {
      switch (status) {
        case "critical":
          return {
            bg: "bg-red-50",
            icon: "text-red-600",
            text: "text-red-900",
            badge: "bg-red-100 text-red-800",
            border: "border-red-200"
          };
        case "warning":
          return {
            bg: "bg-yellow-50",
            icon: "text-yellow-600",
            text: "text-yellow-900",
            badge: "bg-yellow-100 text-yellow-800",
            border: "border-yellow-200"
          };
        case "good":
          return {
            bg: "bg-green-50",
            icon: "text-green-600",
            text: "text-green-900",
            badge: "bg-green-100 text-green-800",
            border: "border-green-200"
          };
        default:
          return {
            bg: "bg-blue-50",
            icon: "text-taqa-electric-blue",
            text: "text-taqa-navy",
            badge: "bg-blue-100 text-blue-800",
            border: "border-blue-200"
          };
      }
    }

    switch (color) {
      case "red":
        return {
          bg: "bg-red-50",
          icon: "text-red-600",
          text: "text-red-900",
          badge: "bg-red-100 text-red-800",
          border: "border-red-200"
        };
      case "yellow":
        return {
          bg: "bg-yellow-50",
          icon: "text-yellow-600",
          text: "text-yellow-900",
          badge: "bg-yellow-100 text-yellow-800",
          border: "border-yellow-200"
        };
      case "orange":
        return {
          bg: "bg-orange-50",
          icon: "text-orange-600",
          text: "text-orange-900",
          badge: "bg-orange-100 text-orange-800",
          border: "border-orange-200"
        };
      case "green":
        return {
          bg: "bg-green-50",
          icon: "text-green-600",
          text: "text-green-900",
          badge: "bg-green-100 text-green-800",
          border: "border-green-200"
        };
      default:
        return {
          bg: "bg-blue-50",
          icon: "text-taqa-electric-blue",
          text: "text-taqa-navy",
          badge: "bg-blue-100 text-blue-800",
          border: "border-blue-200"
        };
    }
  };

  const colors = getColorClasses(color, status);

  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-3 w-3" />;
      case "down":
        return <TrendingDown className="h-3 w-3" />;
      default:
        return <Activity className="h-3 w-3" />;
    }
  };

  const progressValue = target ? (value / target) * 100 : progress || 0;
  const isOnTarget = target ? value >= target * 0.95 : true;

  return (
    <Card className={`relative transition-all duration-200 hover:shadow-md ${
      alert ? 'ring-2 ring-red-200 animate-pulse' : ''
    } ${colors.border} border`}>
      {alert && (
        <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
      )}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex-1">
          <CardTitle className="text-sm font-medium text-gray-600 leading-tight">
            {title}
          </CardTitle>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
          )}
        </div>
        <div className={`p-2.5 rounded-lg ${colors.bg} ring-1 ring-black/5`}>
          <Icon className={`h-4 w-4 ${colors.icon}`} />
        </div>
      </CardHeader>
      <CardContent className="pt-1">
        <div className="flex items-baseline gap-2 mb-3">
          <div className={`text-2xl font-bold ${colors.text} tabular-nums`}>
            {value.toLocaleString('fr-FR', { 
              minimumFractionDigits: unit === 'h' || unit === '%' || unit === 'MW' ? 1 : 0,
              maximumFractionDigits: unit === 'h' || unit === '%' || unit === 'MW' ? 1 : 0
            })}{unit}
          </div>
          {change !== undefined && (
            <Badge 
              variant="secondary" 
              className={`${colors.badge} text-xs flex items-center gap-1 font-medium`}
            >
              {getTrendIcon()}
              {change > 0 ? "+" : ""}{change}
            </Badge>
          )}
        </div>
        
        {target && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">
                Objectif: {target.toLocaleString('fr-FR')}{unit}
              </span>
              <span className={`font-medium ${isOnTarget ? 'text-green-600' : 'text-yellow-600'}`}>
                {Math.round(progressValue)}%
              </span>
            </div>
            <Progress 
              value={Math.min(progressValue, 100)} 
              className="h-2"
            />
            {!isOnTarget && (
              <p className="text-xs text-yellow-600 font-medium">
                Écart: {(target - value).toLocaleString('fr-FR')}{unit}
              </p>
            )}
          </div>
        )}
        
        {progress && !target && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Progression</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export function DashboardStats() {
  const [currentTime, setCurrentTime] = useState("00:00:00");

  useEffect(() => {
    // Update time immediately on client mount
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString('fr-FR'));
    };
    
    updateTime();
    
    // Update time every minute
    const interval = setInterval(updateTime, 60000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8">
      {/* Real-time Status Bar */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-lg border border-gray-200/50">
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Temps réel
          </Badge>
        </div>
        <div className="flex items-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>Dernière MAJ: {currentTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <Activity className="h-4 w-4" />
            <span>241 anomalies actives</span>
          </div>
        </div>
      </div>

      {/* Critical Anomalies Overview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-taqa-navy">
              Anomalies par Criticité
            </h2>
            <p className="text-sm text-gray-600">Distribution et tendances des anomalies</p>
          </div>
          <Badge 
            variant={stats.anomalies.critical.current > 10 ? "destructive" : "secondary"}
            className="px-3 py-1"
          >
            {stats.anomalies.critical.current > 10 ? "ATTENTION REQUISE" : "SOUS CONTRÔLE"}
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Critiques"
            subtitle="Intervention immédiate"
            value={stats.anomalies.critical.current}
            change={stats.anomalies.critical.change}
            trend={stats.anomalies.critical.trend}
            target={stats.anomalies.critical.target}
            icon={Zap}
            status="critical"
            alert={stats.anomalies.critical.alert}
          />
          <StatCard
            title="Normales"
            subtitle="Priorité normale"
            value={stats.anomalies.medium.current}
            change={stats.anomalies.medium.change}
            trend={stats.anomalies.medium.trend}
            target={stats.anomalies.medium.target}
            icon={AlertTriangle}
            status="warning"
          />
          <StatCard
            title="Faibles"
            subtitle="Maintenance préventive"
            value={stats.anomalies.low.current}
            change={stats.anomalies.low.change}
            trend={stats.anomalies.low.trend}
            target={stats.anomalies.low.target}
            icon={Wrench}
            status="good"
          />
          <StatCard
            title="Total Actives"
            subtitle="Toutes anomalies"
            value={stats.anomalies.total.current}
            change={stats.anomalies.total.change}
            trend={stats.anomalies.total.trend}
            target={stats.anomalies.total.target}
            icon={Activity}
            color="blue"
          />
        </div>
      </div>

      {/* Performance & Efficiency Metrics */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-taqa-navy">
              Performance Opérationnelle
            </h2>
            <p className="text-sm text-gray-600">Indicateurs clés de performance et efficacité</p>
          </div>
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-taqa-electric-blue" />
            <span className="text-sm font-medium text-gray-700">Efficacité globale: 89%</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="Temps Moyen Résolution"
            subtitle="MTTR (Mean Time To Repair)"
            value={stats.performance.avgResolutionTime.current}
            target={stats.performance.avgResolutionTime.target}
            unit=" h"
            icon={Timer}
            status={stats.performance.avgResolutionTime.status}
          />
          <StatCard
            title="Taux de Résolution"
            subtitle="Anomalies résolues / Total"
            value={stats.performance.resolutionRate.current}
            target={stats.performance.resolutionRate.target}
            unit="%"
            icon={Target}
            status={stats.performance.resolutionRate.status}
          />
          <StatCard
            title="Actions Préventives"
            subtitle="Maintenance proactive"
            value={stats.performance.preventiveActions.current}
            change={stats.performance.preventiveActions.change}
            trend={stats.performance.preventiveActions.trend}
            target={stats.performance.preventiveActions.target}
            icon={Calendar}
            status="info"
          />
          <StatCard
            title="MTBF Équipements"
            subtitle="Mean Time Between Failures"
            value={stats.performance.mtbf.current}
            target={stats.performance.mtbf.target}
            unit=" h"
            icon={BarChart3}
            status={stats.performance.mtbf.status}
          />
          <StatCard
            title="Disponibilité Système"
            subtitle="Uptime / Temps total"
            value={stats.performance.availability.current}
            target={stats.performance.availability.target}
            unit="%"
            icon={CheckCircle2}
            status={stats.performance.availability.status}
          />
          <StatCard
            title="Efficacité Équipe"
            subtitle="Performance globale"
            value={stats.performance.teamEfficiency.current}
            target={stats.performance.teamEfficiency.target}
            unit="%"
            icon={Users}
            status={stats.performance.teamEfficiency.status}
          />
        </div>
      </div>

      {/* Operational Summary */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-taqa-navy">
              Résumé Opérationnel
            </h2>
            <p className="text-sm text-gray-600">Vue d'ensemble des ressources et production</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-taqa-electric-blue/10 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-taqa-electric-blue/20 rounded-lg">
                  <Activity className="h-5 w-5 text-taqa-electric-blue" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-taqa-navy tabular-nums">{stats.operational.activeTickets.current}</p>
                  <p className="text-sm text-gray-600">Tickets Actifs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-200/50 rounded-lg">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-taqa-navy tabular-nums">{stats.operational.teamMembers.current}</p>
                  <p className="text-sm text-gray-600">Techniciens</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-200/50 rounded-lg">
                  <Wrench className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-taqa-navy tabular-nums">{stats.operational.equipmentUnits.current}</p>
                  <p className="text-sm text-gray-600">Équipements</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-200/50 rounded-lg">
                  <Calendar className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-taqa-navy tabular-nums">{stats.operational.maintenanceScheduled.current}</p>
                  <p className="text-sm text-gray-600">Maintenance</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-200/50 rounded-lg">
                  <Zap className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xl font-bold text-taqa-navy tabular-nums">{stats.operational.energyOutput.current} MW</p>
                  <p className="text-sm text-gray-600">Production</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-teal-50 to-teal-100/50 border-teal-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-200/50 rounded-lg">
                  <Shield className="h-5 w-5 text-teal-600" />
                </div>
                <div>
                  <p className="text-xl font-bold text-taqa-navy tabular-nums">{stats.operational.systemUptime.current}%</p>
                  <p className="text-sm text-gray-600">Disponibilité</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 