"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { 
  AlertTriangle, 
  Clock, 
  MapPin,
  Plus,
  Filter,
  Download,
  Search,
  ArrowUpDown,
  Eye,
  Edit,
  MoreHorizontal,
  Calendar,

  Wrench,
  Zap,
  Shield,
  TrendingUp,
  TrendingDown,
  RefreshCw
} from "lucide-react";

// Enhanced mock recent anomalies data with more industrial context
const recentAnomalies = [
  {
    id: "ABO-2024-158",
    title: "Vibration excessive ventilateur",
    equipment: "Ventilateur V12",
    equipmentId: "VEN-012-OUA",
    site: "Noor Ouarzazate",
    zone: "Zone Production A",
    severity: "high",
    status: "assigned",
    assignedTo: "Youssef Bennani",
    assignedTeam: "EQU-MEC-01",
    timeAgo: "Il y a 30 min",
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    description: "Vibrations anormales détectées lors de l'inspection routine",
    impact: "Réduction efficacité 15%",
    estimatedCost: "2,500 MAD",
    priority: "P2",
    sla: "2h",
    category: "mechanical",
    lastUpdate: "Il y a 10 min"
  },
  {
    id: "ABO-2024-157",
    title: "Fuite hydraulique compresseur",
    equipment: "Compresseur C3",
    equipmentId: "COM-003-MID",
    site: "Noor Midelt", 
    zone: "Zone Compression",
    severity: "medium",
    status: "in_progress",
    assignedTo: "Fatima Zahra",
    assignedTeam: "EQU-HYD-02",
    timeAgo: "Il y a 1h",
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    description: "Fuite d'huile hydraulique détectée au niveau du joint principal",
    impact: "Perte pression 8%",
    estimatedCost: "1,200 MAD",
    priority: "P3",
    sla: "4h",
    category: "hydraulic",
    lastUpdate: "Il y a 15 min"
  },
  {
    id: "ABO-2024-156",
    title: "Défaut capteur température",
    equipment: "Capteur T15",
    equipmentId: "CAP-015-ATL",
    site: "Noor Atlas",
    zone: "Zone Contrôle",
    severity: "low",
    status: "resolved",
    assignedTo: "Mohamed Tazi",
    assignedTeam: "EQU-INS-01",
    timeAgo: "Il y a 2h",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    description: "Lecture incorrecte du capteur de température - Calibrage effectué",
    impact: "Monitoring limité",
    estimatedCost: "350 MAD",
    priority: "P3",
    sla: "8h",
    category: "instrumentation",
    lastUpdate: "Il y a 45 min"
  },
  {
    id: "ABO-2024-155",
    title: "Usure prématurée courroie",
    equipment: "Courroie B7",
    equipmentId: "COU-007-OUA",
    site: "Noor Ouarzazate",
    zone: "Zone Transmission",
    severity: "medium",
    status: "under_review",
    assignedTo: "Rachid Alami",
    assignedTeam: "EQU-MEC-02",
    timeAgo: "Il y a 3h",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    description: "Usure anormale détectée lors de l'inspection - Remplacement nécessaire",
    impact: "Risque rupture",
    estimatedCost: "800 MAD",
    priority: "P3",
    sla: "6h",
    category: "mechanical",
    lastUpdate: "Il y a 1h"
  },
  {
    id: "ABO-2024-154",
    title: "Dysfonctionnement système contrôle",
    equipment: "PLC-01",
    equipmentId: "PLC-001-MID",
    site: "Noor Midelt",
    zone: "Salle de Contrôle",
    severity: "high",
    status: "assigned",
    assignedTo: "Laila Benjelloun",
    assignedTeam: "EQU-INF-01",
    timeAgo: "Il y a 4h",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    description: "Erreur de communication PLC avec système de supervision",
    impact: "Contrôle manuel requis",
    estimatedCost: "3,500 MAD",
    priority: "P2",
    sla: "3h",
    category: "control",
    lastUpdate: "Il y a 30 min"
  }
];

const getSeverityConfig = (severity: string) => {
  switch (severity) {
    case "critical":
      return {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: Zap,
        label: "CRITIQUE"
      };

    case "medium":
      return {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: Shield,
        label: "NORMALE"
      };
    case "low":
      return {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: Wrench,
        label: "FAIBLE"
      };
    default:
      return {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        icon: AlertTriangle,
        label: "INCONNU"
      };
  }
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case "new":
      return { color: "bg-blue-100 text-blue-800", label: "NOUVELLE" };
    case "assigned":
      return { color: "bg-purple-100 text-purple-800", label: "ASSIGNÉE" };
    case "in_progress":
      return { color: "bg-yellow-100 text-yellow-800", label: "EN COURS" };
    case "under_review":
      return { color: "bg-orange-100 text-orange-800", label: "EN RÉVISION" };
    case "resolved":
      return { color: "bg-green-100 text-green-800", label: "RÉSOLUE" };
    default:
      return { color: "bg-gray-100 text-gray-800", label: status.toUpperCase() };
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "mechanical":
      return Wrench;
    case "electrical":
      return Zap;
    case "hydraulic":
      return Shield;
    case "instrumentation":
      return Clock;
    case "control":
      return AlertTriangle;
    default:
      return AlertTriangle;
  }
};

export function AnomaliesOverview() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSite, setSelectedSite] = useState("all");
  const [selectedSeverity, setSelectedSeverity] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("timestamp");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Filter and sort anomalies
  const filteredAnomalies = recentAnomalies
    .filter(anomaly => {
      const matchesSearch = anomaly.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           anomaly.equipment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           anomaly.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSite = selectedSite === "all" || anomaly.site === selectedSite;
      const matchesSeverity = selectedSeverity === "all" || anomaly.severity === selectedSeverity;
      const matchesStatus = selectedStatus === "all" || anomaly.status === selectedStatus;
      
      return matchesSearch && matchesSite && matchesSeverity && matchesStatus;
    })
    .sort((a, b) => {
      const aValue = a[sortBy as keyof typeof a];
      const bValue = b[sortBy as keyof typeof b];
      
      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  // Get unique values for filters
  const sites = [...new Set(recentAnomalies.map(a => a.site))];
  const severities = ["critical", "medium", "low"];
  const statuses = ["new", "assigned", "in_progress", "under_review", "resolved"];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-taqa-navy flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Anomalies Récentes
            </CardTitle>
            <CardDescription className="mt-1">
              Suivi et gestion des anomalies industrielles en temps réel
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-xs">
              <RefreshCw className="h-4 w-4 mr-1" />
              Actualiser
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              <Download className="h-4 w-4 mr-1" />
              Exporter
            </Button>
            <Button size="sm" className="bg-taqa-electric-blue hover:bg-taqa-navy text-xs">
              <Plus className="h-4 w-4 mr-1" />
              Nouvelle Anomalie
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher anomalies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
          
          <Select value={selectedSite} onValueChange={setSelectedSite}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Site" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les sites</SelectItem>
              {sites.map(site => (
                <SelectItem key={site} value={site}>{site}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Criticité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes criticités</SelectItem>
              {severities.map(severity => (
                <SelectItem key={severity} value={severity}>
                  {getSeverityConfig(severity).label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous statuts</SelectItem>
              {statuses.map(status => (
                <SelectItem key={status} value={status}>
                  {getStatusConfig(status).label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" className="h-9 text-xs">
            <Filter className="h-4 w-4 mr-1" />
            Filtres avancés
          </Button>
        </div>

        {/* Results Summary */}
        <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <span>{filteredAnomalies.length} anomalies trouvées</span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>{filteredAnomalies.filter(a => a.severity === 'critical').length} critiques</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>{filteredAnomalies.filter(a => a.severity === 'medium').length} normales</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{filteredAnomalies.filter(a => a.status === 'resolved').length} résolues</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <Clock className="h-3 w-3" />
            <span>Dernière MAJ: {typeof window !== 'undefined' ? new Date().toLocaleTimeString('fr-FR') : '00:00:00'}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Enhanced Table Header */}
        <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50/50 border-b border-gray-100 text-xs font-semibold text-gray-700">
          <div className="col-span-3 flex items-center gap-1 cursor-pointer" onClick={() => handleSort('title')}>
            <span>ANOMALIE</span>
            <ArrowUpDown className="h-3 w-3" />
          </div>
          <div className="col-span-2 flex items-center gap-1 cursor-pointer" onClick={() => handleSort('site')}>
            <span>SITE & ZONE</span>
            <ArrowUpDown className="h-3 w-3" />
          </div>
          <div className="col-span-1 flex items-center gap-1 cursor-pointer" onClick={() => handleSort('severity')}>
            <span>CRITICITÉ</span>
            <ArrowUpDown className="h-3 w-3" />
          </div>
          <div className="col-span-1 flex items-center gap-1 cursor-pointer" onClick={() => handleSort('status')}>
            <span>STATUT</span>
            <ArrowUpDown className="h-3 w-3" />
          </div>
          <div className="col-span-2 flex items-center gap-1 cursor-pointer" onClick={() => handleSort('assignedTo')}>
            <span>ASSIGNÉ À</span>
            <ArrowUpDown className="h-3 w-3" />
          </div>
          <div className="col-span-2 flex items-center gap-1 cursor-pointer" onClick={() => handleSort('timestamp')}>
            <span>TEMPS & SLA</span>
            <ArrowUpDown className="h-3 w-3" />
          </div>
          <div className="col-span-1">
            <span>ACTIONS</span>
          </div>
        </div>

        {/* Enhanced Table Rows */}
        <div className="divide-y divide-gray-100">
          {filteredAnomalies.map((anomaly) => {
            const severityConfig = getSeverityConfig(anomaly.severity);
            const statusConfig = getStatusConfig(anomaly.status);
            const CategoryIcon = getCategoryIcon(anomaly.category);
            
            return (
              <div 
                key={anomaly.id} 
                className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50/50 transition-colors cursor-pointer group"
              >
                {/* Anomaly Info */}
                <div className="col-span-3 min-w-0">
                  <div className="flex items-start gap-3">
                    <Badge 
                      variant="outline" 
                      className={`${severityConfig.color} text-xs flex items-center gap-1 flex-shrink-0 border`}
                    >
                      <severityConfig.icon className="h-3 w-3" />
                      {anomaly.priority}
                    </Badge>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-taqa-navy truncate">
                          {anomaly.title}
                        </span>
                        <CategoryIcon className="h-3 w-3 text-gray-500 flex-shrink-0" />
                      </div>
                      <div className="text-xs text-gray-600 mb-1">
                        <span className="font-mono">{anomaly.id}</span> • {anomaly.equipment}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {anomaly.description}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Site & Zone */}
                <div className="col-span-2 min-w-0">
                  <div className="flex items-center gap-1 mb-1">
                    <MapPin className="h-3 w-3 text-gray-500 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-900 truncate">{anomaly.site}</span>
                  </div>
                  <div className="text-xs text-gray-600 truncate">{anomaly.zone}</div>
                  <div className="text-xs text-gray-500 font-mono">{anomaly.equipmentId}</div>
                </div>

                {/* Severity */}
                <div className="col-span-1">
                  <Badge 
                    variant="secondary" 
                    className={`${severityConfig.color} text-xs px-2 py-1 border`}
                  >
                    {severityConfig.label}
                  </Badge>
                </div>

                {/* Status */}
                <div className="col-span-1">
                  <Badge 
                    variant="secondary" 
                    className={`${statusConfig.color} text-xs px-2 py-1`}
                  >
                    {statusConfig.label}
                  </Badge>
                </div>

                {/* Assigned To */}
                <div className="col-span-2 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-taqa-electric-blue rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-semibold">
                        {anomaly.assignedTo.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{anomaly.assignedTo}</div>
                      <div className="text-xs text-gray-500 truncate">{anomaly.assignedTeam}</div>
                    </div>
                  </div>
                </div>

                {/* Time & SLA */}
                <div className="col-span-2">
                  <div className="flex items-center gap-1 mb-1">
                    <Clock className="h-3 w-3 text-gray-500" />
                    <span className="text-sm text-gray-700">{anomaly.timeAgo}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">SLA: {anomaly.sla}</span>
                    <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                      {anomaly.estimatedCost}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    MAJ: {anomaly.lastUpdate}
                  </div>
                </div>

                {/* Actions */}
                <div className="col-span-1">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Enhanced Footer */}
        <div className="border-t border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Affichage de {filteredAnomalies.length} sur {recentAnomalies.length} anomalies</span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {filteredAnomalies.filter(a => a.status === 'in_progress').length > 0 ? (
                    <TrendingUp className="h-4 w-4 text-yellow-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-green-500" />
                  )}
                  <span>Tendance: {filteredAnomalies.filter(a => a.status === 'resolved').length > filteredAnomalies.filter(a => a.status === 'new').length ? 'Amélioration' : 'Surveillance'}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="text-xs">
                Voir toutes les anomalies
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                <Calendar className="h-3 w-3 mr-1" />
                Planifier maintenance
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 