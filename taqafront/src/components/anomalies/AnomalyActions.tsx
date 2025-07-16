import { useState, useEffect } from 'react';
import { AnomalyAction } from '@/types/database-types';
import { AnomalyActionService } from '@/lib/services/anomaly-action-service';
import { Card } from '@/components/ui/card';
import Badge from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { 
  ArrowRightLeft, 
  Users, 
  FileText, 
  User,
  Building,
  TrendingUp,
  Clock,
  Zap,
  AlertCircle,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AnomalyActionsProps {
  anomalyId: string;
}

const ACTION_TYPE_LABELS: Record<string, string> = {
  status_change: 'Changement de statut',
  assigned: 'Assignation',
  created: 'Création'
};

export function AnomalyActions({ anomalyId }: AnomalyActionsProps) {
  const [actions, setActions] = useState<AnomalyAction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActions = async () => {
    try {
      setLoading(true);
      const { actions: fetchedActions } = await AnomalyActionService.getActions(anomalyId);
      setActions(fetchedActions);
    } catch (error) {
      console.error('Error fetching actions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, [anomalyId]);

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
          icon: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400'
        };
      case 'assigned':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-800',
          icon: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400'
        };
      case 'created':
        return {
          bg: 'bg-purple-50 dark:bg-purple-900/20',
          border: 'border-purple-200 dark:border-purple-800',
          icon: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400'
        };
      default:
        return {
          bg: 'bg-gray-50 dark:bg-gray-900/20',
          border: 'border-gray-200 dark:border-gray-800',
          icon: 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400'
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Chargement des actions...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Actions de l'Anomalie
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {actions.length} action{actions.length > 1 ? 's' : ''} enregistrée{actions.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Actions Grid */}
      <div className="grid gap-4">
        {actions.map((action) => {
          const colors = getActionColors(action.type);

          return (
            <Card key={action.id} className={`p-6 ${colors.bg} ${colors.border}`}>
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${colors.icon}`}>
                    {getActionIcon(action.type)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                      {action.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {ACTION_TYPE_LABELS[action.type] || action.type}
                      </Badge>
                      {action.isAutomated && (
                        <Badge className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          <Zap className="w-3 h-3 mr-1" />
                          Automatisée
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(action.createdAt), 'PPp', { locale: fr })}
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-700 dark:text-gray-300 mb-4 text-base">
                {action.description}
              </p>

              {/* Status Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Statut</span>
                  <div className="mt-1">
                    <Badge variant="outline" className="text-sm">
                      {action.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Priorité</span>
                  <div className="mt-1">
                    <Badge className={`text-sm ${getPriorityColor(action.priority)}`}>
                      {action.priority}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Sévérité</span>
                  <div className="mt-1">
                    <Badge variant="outline" className="text-sm">
                      {action.severity}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Catégorie</span>
                  <div className="mt-1">
                    <Badge variant="outline" className="text-sm">
                      {action.category}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Impact Section */}
              {action.impact && (
                <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-4 mb-4">
                  <h5 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Impact Estimé
                  </h5>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {action.impact.cost.toLocaleString()} MAD
                      </div>
                      <div className="text-xs text-gray-500 font-medium">Coût Financier</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {action.impact.safety.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500 font-medium">Impact Sécurité</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {action.impact.production.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500 font-medium">Impact Production</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Metadata */}
              {action.metadata && Object.keys(action.metadata).length > 0 && (
                <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-4 mb-4">
                  <h5 className="text-sm font-medium mb-3">Détails Techniques</h5>
                  <div className="space-y-2">
                    {Object.entries(action.metadata).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 capitalize">{key.replace('_', ' ')}:</span>
                        <span className="text-sm font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Attachments */}
              {action.attachments && action.attachments.length > 0 && (
                <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-4 mb-4">
                  <h5 className="text-sm font-medium mb-2">
                    Pièces Jointes ({action.attachments.length})
                  </h5>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {action.attachments.length} fichier{action.attachments.length > 1 ? 's' : ''} attaché{action.attachments.length > 1 ? 's' : ''}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <User className="w-4 h-4" />
                  <span className="font-medium">{action.performedBy?.name}</span>
                  <span>•</span>
                  <span>{action.performedBy?.role}</span>
                </div>
                
                {action.team && (
                  <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                    <Building className="w-4 h-4" />
                    <span>{action.team.name}</span>
                    <span className="text-xs">({action.team.code})</span>
                  </div>
                )}

                {action.aiConfidence && (
                  <div className="text-sm text-blue-600 dark:text-blue-400">
                    IA: {(action.aiConfidence * 100).toFixed(1)}%
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
} 