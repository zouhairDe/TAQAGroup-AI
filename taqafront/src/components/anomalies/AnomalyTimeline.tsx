import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Button from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Badge from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { AnomalyActionService } from '@/lib/services/anomaly-action-service';
import { AnomalyService } from '@/lib/services/anomaly-service';
import {
  Plus, 
  ArrowRightLeft, 
  Users, 
  FileText, 
  Calendar,
  User,
  Building,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';
import type { AnomalyAction, Anomaly } from '@/types/database-types';
import { toast } from 'react-hot-toast';

interface TimelineProps {
  anomalyId: string;
}

const ACTION_TYPES = {
  status_change: 'Changement de statut',
  assigned: 'Assignation'
} as const;

const STATUS_OPTIONS = {
  nouveau: 'Nouveau',
  en_cours: 'En cours',
  en_attente: 'En attente',
  résolu: 'Résolu',
  fermé: 'Fermé'
} as const;

export function AnomalyTimeline({ anomalyId }: TimelineProps) {
  const [actions, setActions] = useState<AnomalyAction[]>([]);
  const [anomaly, setAnomaly] = useState<Anomaly | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    title: '',
    description: '',
    status: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [actionsResponse, anomalyData] = await Promise.all([
        AnomalyActionService.getActions(anomalyId),
        AnomalyService.getAnomalyById(anomalyId)
      ]);
      
      setActions(actionsResponse.actions);
      setAnomaly(anomalyData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [anomalyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.type || !formData.title || !formData.description) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (formData.type === 'status_change' && !formData.status) {
      toast.error('Veuillez sélectionner un statut');
      return;
    }

    try {
      setSubmitting(true);
      await AnomalyActionService.createAction(anomalyId, {
        type: formData.type,
        title: formData.title,
        description: formData.description,
        ...(formData.type === 'status_change' && { status: formData.status }),
        metadata: formData.type === 'status_change' ? { newStatus: formData.status } : undefined
      });

      setFormData({ type: '', title: '', description: '', status: '' });
      setShowAddForm(false);
      await fetchData();
      toast.success('Action ajoutée avec succès');
    } catch (error) {
      console.error('Error creating action:', error);
      toast.error('Erreur lors de la création de l\'action');
    } finally {
      setSubmitting(false);
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'status_change':
        return <ArrowRightLeft className="w-5 h-5" />;
      case 'assigned':
        return <Users className="w-5 h-5" />;
      case 'created':
        return <FileText className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getActionColors = (type: string) => {
    switch (type) {
      case 'status_change':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-800',
          icon: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
          line: 'bg-blue-300 dark:bg-blue-700'
        };
      case 'assigned':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-800',
          icon: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400',
          line: 'bg-green-300 dark:bg-green-700'
        };
      case 'created':
        return {
          bg: 'bg-purple-50 dark:bg-purple-900/20',
          border: 'border-purple-200 dark:border-purple-800',
          icon: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400',
          line: 'bg-purple-300 dark:bg-purple-700'
        };
      default:
        return {
          bg: 'bg-gray-50 dark:bg-gray-900/20',
          border: 'border-gray-200 dark:border-gray-800',
          icon: 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400',
          line: 'bg-gray-300 dark:bg-gray-700'
        };
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'critique':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'élevée':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'moyenne':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'faible':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  // Create timeline items including anomaly creation
  const timelineItems = React.useMemo(() => {
    const items = [];
    
    // Add anomaly creation as first item
    if (anomaly) {
      items.push({
        id: 'creation',
        type: 'created',
        title: 'Anomalie créée',
        description: anomaly.description,
        createdAt: anomaly.createdAt,
        performedBy: {
          name: 'Système',
          role: 'Création automatique'
        },
        isCreation: true,
        status: anomaly.status,
        priority: anomaly.priority,
        severity: anomaly.severity,
        category: anomaly.category
      });
    }
    
    // Add all actions
    actions.forEach(action => {
      items.push(action);
    });
    
    // Sort by creation date (newest first)
    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [anomaly, actions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Chargement de l'historique...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Action Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Historique des Actions
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {timelineItems.length} action{timelineItems.length > 1 ? 's' : ''} au total
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter une action
        </Button>
      </div>

      {/* Add Action Form */}
      {showAddForm && (
        <Card className="p-6 border-2 border-dashed border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type d'action
                </label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ACTION_TYPES).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
      </div>

              {formData.type === 'status_change' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nouveau statut
                  </label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le statut" />
          </SelectTrigger>
          <SelectContent>
                      {Object.entries(STATUS_OPTIONS).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Titre
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Titre de l'action"
                className="w-full"
              />
      </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description détaillée de l'action..."
                rows={3}
                className="w-full"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Création...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Créer l'action
                  </>
                )}
            </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddForm(false);
                  setFormData({ type: '', title: '', description: '', status: '' });
                }}
              >
                Annuler
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Timeline */}
      <div className="relative">
        {timelineItems.map((item, index) => {
          const colors = getActionColors(item.type);
          const isLast = index === timelineItems.length - 1;

          return (
            <div key={item.id} className="relative flex items-start space-x-4 pb-8">
              {/* Timeline line */}
              {!isLast && (
                <div className={`absolute left-6 top-12 w-0.5 h-full ${colors.line}`} />
              )}

              {/* Icon */}
              <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full ${colors.icon}`}>
                {getActionIcon(item.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <Card className={`p-4 ${colors.bg} ${colors.border}`}>
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                  <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {ACTION_TYPES[item.type as keyof typeof ACTION_TYPES] || item.type}
                        </Badge>
                        {item.isCreation && (
                          <Badge className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                            Création
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(item.createdAt), 'PPp', { locale: fr })}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {item.description}
                  </p>

                  {/* Metadata for actions */}
                  {!item.isCreation && (
                    <>
                      {/* Status, Priority, Severity, Category */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        <div>
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Statut</span>
                          <div>
                            <Badge variant="outline" className="text-xs mt-1">
                              {item.status}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Priorité</span>
                          <div>
                            <Badge variant="outline" className={`text-xs mt-1 ${getPriorityColor(item.priority)}`}>
                              {item.priority}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Sévérité</span>
                          <div>
                            <Badge variant="outline" className="text-xs mt-1">
                              {item.severity}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Catégorie</span>
                          <div>
                            <Badge variant="outline" className="text-xs mt-1">
                              {item.category}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Impact */}
                      {item.impact && (
                        <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3 mb-4">
                          <h5 className="text-sm font-medium mb-2 flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" />
                            Impact
                          </h5>
                          <div className="grid grid-cols-3 gap-3 text-sm">
                            <div className="text-center">
                              <div className="text-lg font-bold text-red-600 dark:text-red-400">
                                {item.impact.cost.toFixed(0)} MAD
                              </div>
                              <div className="text-xs text-gray-500">Coût</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                                {item.impact.safety.toFixed(1)}%
                              </div>
                              <div className="text-xs text-gray-500">Sécurité</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                {item.impact.production.toFixed(1)}%
                              </div>
                              <div className="text-xs text-gray-500">Production</div>
                            </div>
                  </div>
                </div>
                      )}

                      {/* Metadata */}
                      {item.metadata && Object.keys(item.metadata).length > 0 && (
                        <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3 mb-4">
                          <h5 className="text-sm font-medium mb-2">Détails techniques</h5>
                          <div className="space-y-1 text-sm">
                            {Object.entries(item.metadata).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="text-gray-500 capitalize">{key}:</span>
                                <span className="font-medium">{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <User className="w-4 h-4" />
                      <span className="font-medium">{item.performedBy?.name}</span>
                      <span>•</span>
                      <span>{item.performedBy?.role}</span>
                    </div>
                    
                    {!item.isCreation && item.team && (
                      <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                        <Building className="w-4 h-4" />
                        <span>{item.team.name}</span>
                      </div>
                    )}

                    {!item.isCreation && item.isAutomated && (
                      <div className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400">
                        <Zap className="w-4 h-4" />
                        <span>Automatisée</span>
                        {item.aiConfidence && (
                          <span>({(item.aiConfidence * 100).toFixed(1)}%)</span>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          );
        })}

        {timelineItems.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Aucune action pour le moment
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Cliquez sur "Ajouter une action" pour commencer.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 