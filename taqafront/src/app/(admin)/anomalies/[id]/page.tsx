"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, Edit, Save, Download, Clock, 
  MessageSquare, AlertTriangle, CheckCircle, 
  XCircle, User, Calendar, MapPin, Wrench,
  TrendingUp, Activity, Zap, Shield, Target
} from "lucide-react";
import { AnomalyService } from "@/lib/services/anomaly-service";
import { AnomalyTimeline } from '@/components/anomalies/AnomalyTimeline';
import { toast } from 'react-hot-toast';
import type { Anomaly } from '@/types/database-types';
import { AnomalyActions } from '@/components/anomalies/AnomalyActions';
import { AuthService } from '@/lib/auth';

export default function AnomalyDetailPage() {
  const [anomaly, setAnomaly] = useState<Anomaly | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableDescription, setEditableDescription] = useState("");
  const [activeTab, setActiveTab] = useState("actions");
  const [newComment, setNewComment] = useState("");
  const [isAddingComment, setIsAddingComment] = useState(false);
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    const fetchAnomaly = async () => {
      try {
        setLoading(true);
        const data = await AnomalyService.getAnomalyById(params.id as string);
        setAnomaly(data);
        setEditableDescription(data.description);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch anomaly");
      } finally {
        setLoading(false);
      }
    };

    fetchAnomaly();
  }, [params.id]);

  // Handle delete anomaly
  const handleDeleteAnomaly = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette anomalie ?")) {
      try {
        await AnomalyService.deleteAnomaly(params.id as string);
        toast.success("Anomalie supprimée avec succès");
        router.push("/anomalies");
      } catch (error) {
        console.error("Error deleting anomaly:", error);
        toast.error("Erreur lors de la suppression de l'anomalie");
      }
    }
  };

  // Handle save description
  const handleSaveDescription = async () => {
    try {
      const updated = await AnomalyService.updateAnomaly(anomaly!.id, { description: editableDescription });
      setAnomaly(updated);
      setIsEditing(false);
      toast.success("Description sauvegardée avec succès");
    } catch (err) {
      console.error("Erreur lors de la sauvegarde:", err);
      toast.error("Erreur lors de la sauvegarde de la description");
    }
  };

  // Handle add comment
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    const currentUser = AuthService.getUser();
    if (!currentUser) {
      toast.error("Vous devez être connecté pour ajouter un commentaire");
      return;
    }
    
    try {
      setIsAddingComment(true);
      const response = await fetch(`http://10.30.249.128:3333/api/v1/anomalies/${anomaly!.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment,
          authorId: currentUser.id
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to add comment');
      }
      
      const result = await response.json();
      
      // Add the new comment to the anomaly
      setAnomaly(prev => ({
        ...prev!,
        comments: [...(prev!.comments || []), result.data]
      }));
      
      setNewComment("");
      toast.success("Commentaire ajouté avec succès");
    } catch (err) {
      console.error("Erreur lors de l'ajout du commentaire:", err);
      toast.error("Erreur lors de l'ajout du commentaire");
    } finally {
      setIsAddingComment(false);
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <AlertTriangle className="h-4 w-4" />;
      case 'in_progress': return <Activity className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <XCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Convert 0-100 scale to 1-5 scale
  const convertToScale = (value: number | undefined): number => {
    if (!value) return 0;
    // Convert from 0-100 to 1-5 scale
    return Math.round((value / 100) * 4) + 1;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <XCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Erreur</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!anomaly) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Anomalie non trouvée</h3>
        <p className="mt-1 text-sm text-gray-500">L'anomalie demandée n'existe pas ou a été supprimée.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {anomaly.title}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {anomaly.code} • Créé le {formatDate(anomaly.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <Edit className="h-4 w-4" />
            {isEditing ? "Annuler" : "Modifier"}
          </button>
          {isEditing && (
            <button 
              onClick={handleSaveDescription}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Save className="h-4 w-4" />
              Sauvegarder
            </button>
          )}
          <button
            onClick={handleDeleteAnomaly}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Supprimer
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Availability */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Disponibilité</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {convertToScale(anomaly.disponibilite)}/5
              </p>
            </div>
            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/20">
              <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* Reliability */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Fiabilité</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {convertToScale(anomaly.fiabilite)}/5
              </p>
            </div>
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
              <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Process Safety */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sécurité Processus</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {convertToScale(anomaly.processSafety)}/5
              </p>
            </div>
            <div className="rounded-full bg-orange-100 p-3 dark:bg-orange-900/20">
              <Shield className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>

        {/* Criticality */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Criticité</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {convertToScale(anomaly.disponibilite) + convertToScale(anomaly.fiabilite) + convertToScale(anomaly.processSafety)}
              </p>
            </div>
            <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/20">
              <Zap className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Overview Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Aperçu de l'anomalie</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Informations générales et détails techniques
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium border ${getPriorityColor(anomaly.priority)}`}>
                    {getStatusIcon(anomaly.priority)}
                    {anomaly.priority === 'critical' ? 'Critique' : 
                     anomaly.priority === 'medium' ? 'Normale' : 'Faible'}
                  </div>
                  <div className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium border ${getStatusColor(anomaly.status)}`}>
                    {getStatusIcon(anomaly.status)}
                    {anomaly.status === 'new' ? 'Nouvelle' :
                     anomaly.status === 'in_progress' ? 'En cours' :
                     anomaly.status === 'resolved' ? 'Résolue' : 'Fermée'}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Wrench className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">Équipement:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {anomaly.equipment?.name || 'Non spécifié'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">Localisation:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {anomaly.equipment?.zone?.site?.name || 'Non spécifié'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">Signalé par:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {anomaly.reportedBy?.name || 'Inconnu'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">Date de signalement:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatDate(anomaly.reportedAt)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Détails techniques</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Catégorie:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{anomaly.category}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Origine:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{anomaly.origin}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Système:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{anomaly.systeme || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Temps d'arrêt:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {anomaly.downtimeHours ? `${anomaly.downtimeHours}h` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Coût estimé:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {anomaly.estimatedCost ? `${anomaly.estimatedCost.toLocaleString()} MAD` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Description</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Description détaillée de l'anomalie
              </p>
            </div>
            {isEditing ? (
              <Textarea
                value={editableDescription}
                onChange={(e) => setEditableDescription(e.target.value)}
                className="min-h-[200px]"
                placeholder="Décrivez l'anomalie en détail..."
              />
            ) : (
              <p className="text-gray-800 dark:text-white/90 whitespace-pre-wrap">
                {anomaly.description || 'Aucune description disponible'}
              </p>
            )}
          </div>

          {/* Tabs Section */}
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="border-b border-gray-200 dark:border-gray-700 p-6">
                <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                  <TabsTrigger 
                    value="actions" 
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <Clock className="h-4 w-4" />
                    Actions
                  </TabsTrigger>
                  <TabsTrigger 
                    value="comments" 
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Commentaires ({anomaly.comments?.length || 0})
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="actions" className="p-6 pt-4">
                <AnomalyTimeline anomalyId={anomaly.id} />
              </TabsContent>

              <TabsContent value="comments" className="p-6 pt-4">
                <div className="space-y-6">
                  {/* Add Comment Form */}
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Ajouter un commentaire</h3>
                    <div className="space-y-3">
                      <Textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Écrivez votre commentaire..."
                        className="min-h-[100px]"
                        disabled={isAddingComment}
                      />
                      <div className="flex justify-end">
                        <button
                          onClick={handleAddComment}
                          disabled={!newComment.trim() || isAddingComment}
                          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isAddingComment ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Ajout...
                            </>
                          ) : (
                            <>
                              <MessageSquare className="h-4 w-4" />
                              Ajouter commentaire
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-4">
                    {anomaly.comments && anomaly.comments.length > 0 ? (
                      anomaly.comments.map((comment) => (
                        <div key={comment.id} className="flex gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                              <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {comment.author?.name || "Utilisateur inconnu"}
                              </p>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDate(comment.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-800 dark:text-white/90">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Aucun commentaire</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          Soyez le premier à commenter cette anomalie.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Impact Assessment */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Évaluation d'impact
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Impact sur les opérations
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Impact sécurité</span>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  anomaly.safetyImpact ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {anomaly.safetyImpact ? 'Oui' : 'Non'}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Impact environnemental</span>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  anomaly.environmentalImpact ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {anomaly.environmentalImpact ? 'Oui' : 'Non'}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Impact production</span>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  anomaly.productionImpact ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {anomaly.productionImpact ? 'Oui' : 'Non'}
                </div>
              </div>
            </div>
          </div>

          {/* Assignment */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Attribution
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Responsables de l'anomalie
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {anomaly.assignedTo?.name || 'Non assigné'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {anomaly.assignedTo?.role || 'Assigné à'}
                  </p>
                </div>
              </div>
              
              {anomaly.assignedTeam && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                    <User className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {anomaly.assignedTeam?.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Équipe</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AI Factors */}
          {anomaly.aiFactors && anomaly.aiFactors.length > 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Facteurs IA
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Facteurs analysés par l'IA
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {anomaly.aiFactors.map((factor, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
                  >
                    {factor}
                  </span>
                ))}
              </div>
              {anomaly.aiConfidence && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Confiance IA</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {Math.round(anomaly.aiConfidence * 100)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <AnomalyActions anomalyId={params.id as string} />
          </div>
        </div>
      </div>
    </div>
  );
} 