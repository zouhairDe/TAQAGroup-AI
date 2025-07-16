"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert } from "@/components/ui/alert";
import { 
  BookOpen, CheckCircle, Clock, Brain, Plus, Search, 
  List, Grid3X3, Settings, Zap, Target, BarChart3, 
  User, Calendar, Star, Wrench, AlertTriangle,
  Eye, MessageSquare, Bookmark, Building, MapPin
} from "lucide-react";
import { rexService, type RexEntry } from "@/lib/services/rex-service";

export default function REXPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "pending_review" | "approved" | "rejected">("all");
  const [equipmentFilter, setEquipmentFilter] = useState("all");
  const [knowledgeValueFilter, setKnowledgeValueFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rexData, setRexData] = useState<RexEntry[]>([]);
  const [rexStats, setRexStats] = useState({
    totalEntries: 0,
    approvedEntries: 0,
    avgResolutionTime: "0h",
    knowledgeReuse: 0
  });

  useEffect(() => {
    loadREXData();
  }, [searchTerm, statusFilter, equipmentFilter, knowledgeValueFilter, sortBy]);

  const loadREXData = async () => {
    try {
      setLoading(true);
      const queryParams = {
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(equipmentFilter !== "all" && { building: equipmentFilter }),
        page: 1,
        limit: 10
      };

      const response = await rexService.listRexEntries(queryParams);

      setRexData(response.data);
      setRexStats({
        totalEntries: response.pagination.total,
        approvedEntries: response.data.filter(r => r.status === "approved").length,
        avgResolutionTime: calculateAvgResolutionTime(response.data),
        knowledgeReuse: calculateKnowledgeReuse(response.data)
      });
    } catch (err) {
      setError("Failed to load REX data");
      console.error("Error loading REX data:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateAvgResolutionTime = (items: RexEntry[]): string => {
    const times = items
      .filter(item => item.timeToResolve)
      .map(item => parseFloat(item.timeToResolve || "0"));
    if (times.length === 0) return "0h";
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    return `${avg.toFixed(1)}h`;
  };

  const calculateKnowledgeReuse = (items: RexEntry[]): number => {
    const reusableItems = items.filter(item => item.reusabilityScore && item.reusabilityScore > 0.7);
    return Math.round((reusableItems.length / items.length) * 100) || 0;
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(new Date(date));
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60));
    if (diffInHours < 24) return `il y a ${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `il y a ${diffInDays}j`;
  };

  // REX Card Component
  const REXCard = ({ rex, viewMode }: { rex: RexEntry; viewMode: "grid" | "list" }) => (
    <div 
      className={`rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer dark:border-gray-800 dark:bg-white/[0.03] ${
        viewMode === "list" ? "flex gap-6" : ""
      }`}
      onClick={() => router.push(`/rex/${rex.id}`)}
    >
      <div className={`flex flex-col ${viewMode === "list" ? "flex-1" : ""}`}>
        <div className="p-5">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-3">
                {getStatusBadge(rex.status)}
                {getKnowledgeValueBadge(rex.knowledgeValue)}
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                {rex.title}
              </h3>
              
              <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-gray-400" />
                  <span className="truncate">{rex.site}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="truncate">{rex.zone || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="truncate">{rex.createdBy?.name || 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>{formatTimeAgo(rex.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {viewMode === "list" && (
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {rex.description || rex.rootCause}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: "gray", label: "Brouillon" },
      pending_review: { color: "yellow", label: "En revue" },
      approved: { color: "green", label: "Approuvé" },
      rejected: { color: "red", label: "Rejeté" }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;

    return (
      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-${config.color}-50 text-${config.color}-700 dark:bg-${config.color}-500/10 dark:text-${config.color}-400`}>
        {config.label}
      </span>
    );
  };

  const getKnowledgeValueBadge = (value: string) => {
    const valueConfig = {
      high: { color: "green", label: "Valeur élevée" },
      medium: { color: "yellow", label: "Valeur moyenne" },
      low: { color: "gray", label: "Valeur faible" }
    };

    const config = valueConfig[value as keyof typeof valueConfig] || valueConfig.medium;

    return (
      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-${config.color}-50 text-${config.color}-700 dark:bg-${config.color}-500/10 dark:text-${config.color}-400`}>
        {config.label}
      </span>
    );
  };

  const getEquipmentIcon = (type: string) => {
    switch (type) {
      case "mechanical": return <Wrench className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
      case "electrical": return <Zap className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
      case "hydraulic": return <Target className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
      case "instrumentation": return <BarChart3 className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
      default: return <Settings className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            Retours d&apos;Expérience
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gérez et consultez les retours d&apos;expérience de l&apos;équipe
          </p>
        </div>
        <Button
          onClick={() => router.push('/rex/new')}
          startIcon={<Plus className="h-4 w-4" />}
        >
          Nouveau REX
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-900/20">
                <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total REX</p>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{rexStats.totalEntries}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-50 p-2 dark:bg-green-900/20">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">REX Approuvés</p>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{rexStats.approvedEntries}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-yellow-50 p-2 dark:bg-yellow-900/20">
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Temps Moyen</p>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{rexStats.avgResolutionTime}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-50 p-2 dark:bg-purple-900/20">
                <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Réutilisation</p>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{rexStats.knowledgeReuse}%</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Rechercher un REX..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="draft">Brouillon</SelectItem>
            <SelectItem value="pending_review">En revue</SelectItem>
            <SelectItem value="approved">Approuvé</SelectItem>
            <SelectItem value="rejected">Rejeté</SelectItem>
          </SelectContent>
        </Select>

        <Select value={equipmentFilter} onValueChange={setEquipmentFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Équipement" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les équipements</SelectItem>
            <SelectItem value="mechanical">Mécanique</SelectItem>
            <SelectItem value="electrical">Électrique</SelectItem>
            <SelectItem value="hydraulic">Hydraulique</SelectItem>
          </SelectContent>
        </Select>

        <Select value={knowledgeValueFilter} onValueChange={setKnowledgeValueFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Valeur" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les valeurs</SelectItem>
            <SelectItem value="medium">Valeur normale</SelectItem>
            <SelectItem value="medium">Valeur moyenne</SelectItem>
            <SelectItem value="low">Valeur faible</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Trier par" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Plus récents</SelectItem>
            <SelectItem value="rating">Mieux notés</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 ml-auto">
          <Button
            variant={viewMode === "grid" ? "primary" : "outline"}
            onClick={() => setViewMode("grid")}
            startIcon={<Grid3X3 className="h-4 w-4" />}
          >
            Grille
          </Button>
          <Button
            variant={viewMode === "list" ? "primary" : "outline"}
            onClick={() => setViewMode("list")}
            startIcon={<List className="h-4 w-4" />}
          >
            Liste
          </Button>
        </div>
      </div>

      {/* REX Grid/List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      ) : error ? (
        <Alert variant="error" title="Erreur" message={error} />
      ) : (
        <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
          {rexData.map((rex) => (
            <REXCard key={rex.id} rex={rex} viewMode={viewMode} />
          ))}
        </div>
      )}
    </div>
  );
}