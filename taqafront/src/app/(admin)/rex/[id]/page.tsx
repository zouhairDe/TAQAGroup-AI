"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Button from "@/components/ui/button";
import { rexService } from "@/lib/services/rex-service";
import type { RexEntry } from "@/lib/services/rex-service";
import {
  ArrowLeft,
  Edit,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Star,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Shield,
  Building,
  MapPin,
  User,
  Calendar,
  Clock,
  Target,
  Wrench,
  Zap,
  BarChart3,
  FileText,
  Image,
  PlayCircle,
  Paperclip,
  ExternalLink,
  Eye,
  Bookmark,
  Download
} from "lucide-react";

const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return 'Date non disponible';
  
  try {
    let d: Date;
    
    if (typeof date === 'string') {
      // Handle various string formats
      d = new Date(date);
    } else if (date instanceof Date) {
      d = date;
    } else {
      return 'Date non disponible';
    }
    
    if (isNaN(d.getTime())) {
      return 'Date non disponible';
    }
    
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Date non disponible';
  }
};

const getStatusBadge = (status: string) => {
  const styles = {
    approved: "bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30",
    pending_review: "bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800/30",
    draft: "bg-gray-50 text-gray-700 border border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800/30",
    rejected: "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30"
  };
  const labels = {
    approved: "Approuvé",
    pending_review: "En révision",
    draft: "Brouillon",
    rejected: "Rejeté"
  };
  return (
    <div className={`${styles[status as keyof typeof styles]} px-3 py-1.5 text-xs font-semibold rounded-full flex items-center gap-1`}>
      {labels[status as keyof typeof labels]}
    </div>
  );
};

const getKnowledgeValueBadge = (value: string) => {
  const styles = {
    high: "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/30",
    medium: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30",
    low: "bg-gray-50 text-gray-700 border border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800/30"
  };
  const labels = {
    high: "Valeur élevée",
    medium: "Valeur moyenne",
    low: "Valeur faible"
  };
  return (
    <div className={`${styles[value as keyof typeof styles]} px-3 py-1.5 text-xs font-semibold rounded-full flex items-center gap-1`}>
      <Target className="h-3 w-3" />
      {labels[value as keyof typeof labels]}
    </div>
  );
};

export default function REXDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("analysis");
  const [rex, setRex] = useState<RexEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRexData = async () => {
      try {
        setLoading(true);
        const data = await rexService.getRexEntry(params.id as string);
        setRex(data);
        setError(null);
      } catch (err) {
        console.error("Error loading REX data:", err);
        // Fallback to mock data for development
        const mockData: RexEntry = {
          id: params.id as string,
          code: "REX-2024-039",
          title: "REX Maintenance - Turbine",
          description: "Informations détaillées sur le REX",
          site: "Centrale Thermique Mohammedia",
          zone: "Zone A - Turbine 1",
          building: "Bâtiment Principal",
          equipment: "Turbine à vapeur",
          effectiveness: 85,
          reusabilityScore: 0.75,
          views: 127,
          status: "approved",
          knowledgeValue: "medium",
          rating: 4.5,
          createdAt: new Date().toISOString(),
          createdBy: {
            id: "user1",
            name: "Ahmed Technician",
            email: "ahmed@taqa.com"
          },
          rootCause: "Défaillance du système de refroidissement due à l'accumulation de dépôts calcaires dans les conduits, causant une surchauffe du moteur principal.",
          lessonsLearned: "L'importance d'un entretien préventif régulier du système de refroidissement et la mise en place d'un programme de nettoyage systématique des conduits.",
          solution: "Nettoyage complet du système de refroidissement, remplacement des filtres défaillants et mise en place d'un programme de maintenance préventive mensuel.",
          timeToResolve: "4 heures",
          costImpact: "2,500 MAD",
          preventiveActions: [
            "Inspection mensuelle du système de refroidissement",
            "Nettoyage trimestriel des conduits",
            "Remplacement annuel des filtres",
            "Formation du personnel sur les bonnes pratiques"
          ],
          attachments: [
            {
              id: "att1",
              name: "Rapport_inspection.pdf",
              type: "pdf",
              size: "2.3 MB",
              url: "#"
            },
            {
              id: "att2",
              name: "Photos_avant_apres.jpg",
              type: "image",
              size: "1.8 MB",
              url: "#"
            }
          ],
          comments: [
            {
              id: "comment1",
              author: "Mohamed Supervisor",
              role: "Superviseur",
              content: "Excellente analyse. Cette approche devrait être appliquée à tous les équipements similaires.",
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              helpful: 5
            }
          ],
          bookmarks: 12,
          tags: ["maintenance", "turbine", "refroidissement"],
          downtimeHours: 4,
          safetyImpact: false,
          environmentalImpact: false,
          productionImpact: true,
          impactLevel: "medium"
        };
        setRex(mockData);
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadRexData();
    }
  }, [params.id]);

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading...</div>;
  }

  if (error || !rex) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-red-600 dark:text-red-400 mb-4">{error || "REX not found"}</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return FileText;
      case 'video': return PlayCircle;
      case 'image': return Image;
      case 'archive': return Paperclip;
      default: return FileText;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
              {rex.title}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {rex.code} • Créé par {rex.createdBy?.name || "Utilisateur inconnu"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => window.print()}
            startIcon={<Download className="h-4 w-4" />}
          >
            Exporter
          </Button>
          <Button
            onClick={() => router.push(`/rex/${rex.id}/edit`)}
            startIcon={<Edit className="h-4 w-4" />}
          >
            Modifier
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="">
        {/* Left Column - Main Content */}
        <div className="space-y-6">
          {/* Title and Description */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 shadow-theme-xs">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                    {rex.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Informations détaillées sur le REX
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Site</p>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900 dark:text-white">{rex.site}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Zone</p>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900 dark:text-white">{rex.zone || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Créé par</p>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900 dark:text-white">{rex.createdBy?.name || 'Unknown'}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Date de création</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900 dark:text-white">{formatDate(rex.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Card>
            <CardContent className="p-0">
              <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full border-b border-gray-200 dark:border-gray-800 px-6">
                  <TabsTrigger value="analysis" className="flex-1">
                    Analyse
                  </TabsTrigger>
                  <TabsTrigger value="solution" className="flex-1">
                    Solution
                  </TabsTrigger>
                  <TabsTrigger value="attachments" className="flex-1">
                    Pièces jointes
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="analysis" className="p-6 space-y-6">
                  {/* Root Cause Analysis */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4 flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 shadow-theme-xs">
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                      Analyse de la Cause Racine
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {rex.rootCause || "Analyse de la cause racine non disponible"}
                    </p>
                  </div>

                  {/* Lessons Learned */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4 flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400 shadow-theme-xs">
                        <Lightbulb className="h-4 w-4" />
                      </div>
                      Leçons Apprises
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {rex.lessonsLearned || "Leçons apprises non disponibles"}
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="solution" className="p-6 space-y-6">
                  {/* Solution */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4 flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 shadow-theme-xs">
                        <CheckCircle className="h-4 w-4" />
                      </div>
                      Solution Appliquée
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {rex.solution || "Solution non disponible"}
                    </p>
                  </div>

                  {/* Preventive Actions */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4 flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 shadow-theme-xs">
                        <Shield className="h-4 w-4" />
                      </div>
                      Actions Préventives
                    </h3>
                    <ul className="space-y-3">
                      {rex.preventiveActions?.map((action, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="mt-1 h-2 w-2 rounded-full bg-blue-500 dark:bg-blue-400" />
                          <span className="text-gray-700 dark:text-gray-300">{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>

                <TabsContent value="attachments" className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {rex.attachments?.map((attachment) => {
                      const FileIcon = getFileIcon(attachment.type);
                      return (
                        <div
                          key={attachment.id}
                          className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                            <FileIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {attachment.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {attachment.size}
                            </p>
                          </div>
                          <a
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 