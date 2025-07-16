"use client";

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  User, 
  Calendar, 
  Play, 
  Pause, 
  CheckSquare,
  Plus,
  FileText,
  Settings,
  Target,
  Zap,
  Shield,
  Wrench,
  Eye,
  Edit3,
  Trash2,
  Users,
  Timer,
  BarChart3,
  TrendingUp,
  AlertCircle,
  XCircle,
  RotateCcw,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MaintenanceAction, 
  MaintenanceWorkflow as WorkflowType, 
  MaintenanceCheckpoint,
  MaintenanceTemplate
} from '@/types/maintenance-actions';
import MaintenanceActionsService, { MaintenanceActionsService as MaintenanceActionsServiceClass } from '@/lib/services/maintenance-actions-service';
import MaintenanceActionComments from './MaintenanceActionComments';

interface MaintenanceWorkflowProps {
  anomalyId: string;
  onWorkflowUpdate?: (workflow: WorkflowType) => void;
}

const MaintenanceWorkflow: React.FC<MaintenanceWorkflowProps> = ({ 
  anomalyId, 
  onWorkflowUpdate 
}) => {
  const [workflow, setWorkflow] = useState<WorkflowType | null>(null);
  const [templates, setTemplates] = useState<MaintenanceTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<MaintenanceAction | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [expandedActions, setExpandedActions] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState('workflow');
  const [showCommentsForAction, setShowCommentsForAction] = useState<string | null>(null);

  // Form states
  const [actionForm, setActionForm] = useState({
    title: '',
    description: '',
    type: 'execution' as MaintenanceAction['type'],
    priority: 'medium' as MaintenanceAction['priority'],
    estimatedDuration: 60,
    resourcesNeeded: '',
    skillsRequired: '',
    safetyRequirements: '',
    requiresApproval: false
  });

  // Load workflow and templates
  useEffect(() => {
    loadWorkflow();
    loadTemplates();
  }, [anomalyId]);

  const loadWorkflow = async () => {
    try {
      setLoading(true);
      const workflowData = await MaintenanceActionsService.getWorkflowByAnomalyId(anomalyId);
      setWorkflow(workflowData);
      
      if (workflowData && onWorkflowUpdate) {
        onWorkflowUpdate(workflowData);
      }
    } catch (err) {
      setError('Erreur lors du chargement du workflow');
      console.error('Error loading workflow:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const templatesData = await MaintenanceActionsService.getTemplates();
      setTemplates(templatesData);
    } catch (err) {
      console.error('Error loading templates:', err);
    }
  };

  const createWorkflowFromTemplate = async (templateId: string) => {
    try {
      setLoading(true);
      const newWorkflow = await MaintenanceActionsService.createWorkflowFromTemplate(
        anomalyId, 
        templateId
      );
      setWorkflow(newWorkflow);
      setIsCreateModalOpen(false);
      
      if (onWorkflowUpdate) {
        onWorkflowUpdate(newWorkflow);
      }
    } catch (err) {
      setError('Erreur lors de la création du workflow');
      console.error('Error creating workflow:', err);
    } finally {
      setLoading(false);
    }
  };

  const createCustomWorkflow = async () => {
    try {
      setLoading(true);
      const newWorkflow = await MaintenanceActionsService.createCustomWorkflow({
        anomalyId,
        title: 'Workflow personnalisé',
        actions: []
      });
      setWorkflow(newWorkflow);
      setIsCreateModalOpen(false);
      
      if (onWorkflowUpdate) {
        onWorkflowUpdate(newWorkflow);
      }
    } catch (err) {
      setError('Erreur lors de la création du workflow');
      console.error('Error creating custom workflow:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleActionStatusChange = async (
    actionId: string, 
    newStatus: MaintenanceAction['status'],
    notes?: string
  ) => {
    if (!workflow) return;

    try {
      await MaintenanceActionsService.updateActionStatus(actionId, newStatus, '', notes);
      
      // Refresh workflow
      await loadWorkflow();
    } catch (err) {
      setError('Erreur lors de la mise à jour du statut');
      console.error('Error updating action status:', err);
    }
  };

  const startAction = async (actionId: string) => {
    try {
      await MaintenanceActionsService.startAction(actionId);
      await loadWorkflow();
    } catch (err) {
      setError('Erreur lors du démarrage de l\'action');
      console.error('Error starting action:', err);
    }
  };

  const completeAction = async (actionId: string, notes?: string) => {
    try {
      await MaintenanceActionsService.completeAction(actionId, notes);
      await loadWorkflow();
    } catch (err) {
      setError('Erreur lors de la finalisation de l\'action');
      console.error('Error completing action:', err);
    }
  };

  const addCustomAction = async () => {
    if (!workflow) return;

    try {
      const actionData = {
        anomalyId,
        title: actionForm.title,
        description: actionForm.description,
        type: actionForm.type,
        priority: actionForm.priority,
        estimatedDuration: actionForm.estimatedDuration,
        resourcesNeeded: actionForm.resourcesNeeded.split(',').map(r => r.trim()),
        skillsRequired: actionForm.skillsRequired.split(',').map(s => s.trim()),
        safetyRequirements: actionForm.safetyRequirements.split(',').map(s => s.trim()),
        requiresApproval: actionForm.requiresApproval,
        status: 'pending' as const,
        progressPercentage: 0,
        dependencies: [],
        isBlocking: false,
        dependents: [],
        checkpoints: [],
        attachments: [],
        createdById: 'current-user-id', // This should come from auth context
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await MaintenanceActionsService.addActionToWorkflow(workflow.id, actionData);
      await loadWorkflow();
      setIsActionModalOpen(false);
      resetActionForm();
    } catch (err) {
      setError('Erreur lors de l\'ajout de l\'action');
      console.error('Error adding action:', err);
    }
  };

  const resetActionForm = () => {
    setActionForm({
      title: '',
      description: '',
      type: 'execution',
      priority: 'medium',
      estimatedDuration: 60,
      resourcesNeeded: '',
      skillsRequired: '',
      safetyRequirements: '',
      requiresApproval: false
    });
  };

  const toggleActionExpansion = (actionId: string) => {
    const newExpanded = new Set(expandedActions);
    if (newExpanded.has(actionId)) {
      newExpanded.delete(actionId);
    } else {
      newExpanded.add(actionId);
    }
    setExpandedActions(newExpanded);
  };

  const getStatusIcon = (status: MaintenanceAction['status']) => {
    const statusConfig = MaintenanceActionsServiceClass.getStatusConfig(status);
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in_progress': return <Clock className="h-5 w-5 text-blue-500" />;
      case 'blocked': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'cancelled': return <XCircle className="h-5 w-5 text-gray-500" />;
      default: return <Timer className="h-5 w-5 text-gray-400" />;
    }
  };

  const getTypeIcon = (type: MaintenanceAction['type']) => {
    switch (type) {
      case 'diagnosis': return <Eye className="h-4 w-4" />;
      case 'preparation': return <Wrench className="h-4 w-4" />;
      case 'execution': return <Zap className="h-4 w-4" />;
      case 'verification': return <CheckSquare className="h-4 w-4" />;
      case 'documentation': return <FileText className="h-4 w-4" />;
      case 'preventive': return <Shield className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: MaintenanceAction['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const calculateProgress = () => {
    if (!workflow || workflow.actions.length === 0) return 0;
    return MaintenanceActionsServiceClass.calculateProgress(workflow.actions);
  };

  const getNextActions = () => {
    if (!workflow) return [];
    return workflow.actions.filter(action => 
      action.status === 'pending' && 
      MaintenanceActionsServiceClass.canActionStart(action, workflow.actions)
    );
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  };

  if (loading) {
    return (
      <Card className="rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Chargement du workflow...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!workflow) {
    return (
      <Card className="rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <CardContent className="pt-0">
          <div className="text-center py-8">
            <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Créer un Workflow de Maintenance
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Organisez les actions de maintenance en étapes structurées pour résoudre cette anomalie.
            </p>
            
            <div className="flex gap-3 justify-center">
              <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Créer un Workflow
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Créer un Workflow de Maintenance</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-3">Utiliser un modèle</h3>
                      <div className="space-y-2">
                        {templates.map(template => (
                          <div
                            key={template.id}
                            className="border rounded-lg p-3 cursor-pointer hover:bg-gray-50"
                            onClick={() => createWorkflowFromTemplate(template.id)}
                          >
                            <h4 className="font-medium">{template.name}</h4>
                            <p className="text-sm text-gray-600">{template.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="light" size="sm">
                                {template.category}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                ~{MaintenanceActionsServiceClass.formatDuration(template.estimatedTotalDuration)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={createCustomWorkflow}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Créer un workflow personnalisé
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const progress = calculateProgress();
  const nextActions = getNextActions();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Workflow Header */}
      <Card className="rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <CardHeader className="pb-4">
          <div className="flex flex-col space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 shadow-theme-xs dark:bg-blue-900/20">
                <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  {workflow.title}
                </CardTitle>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {workflow.actions.length} actions • {MaintenanceActionsServiceClass.formatDuration(workflow.estimatedTotalDuration)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between gap-3">
              <Badge 
                variant="light" 
                color={workflow.status === 'completed' ? 'success' : 
                      workflow.status === 'in_progress' ? 'primary' :
                      workflow.status === 'blocked' ? 'error' :
                      'light'}
              >
                {workflow.status === 'completed' ? 'Terminé' :
                 workflow.status === 'in_progress' ? 'En cours' :
                 workflow.status === 'blocked' ? 'Bloqué' :
                 workflow.status === 'cancelled' ? 'Annulé' :
                 'Non démarré'}
              </Badge>
              
              <Dialog open={isActionModalOpen} onOpenChange={setIsActionModalOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter Action
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Progression
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {progress}%
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <Card className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg h-10">
              <TabsTrigger 
                value="workflow" 
                className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-white/[0.03] dark:data-[state=active]:text-white"
              >
                <Settings className="h-4 w-4" />
                Actions
              </TabsTrigger>
              <TabsTrigger 
                value="timeline" 
                className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-white/[0.03] dark:data-[state=active]:text-white"
              >
                <Clock className="h-4 w-4" />
                Timeline
              </TabsTrigger>
              <TabsTrigger 
                value="metrics" 
                className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-white/[0.03] dark:data-[state=active]:text-white"
              >
                <BarChart3 className="h-4 w-4" />
                Métriques
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="workflow" className="p-0">
            {/* Next Actions */}
            {nextActions.length > 0 && (
              <div className="mb-6 rounded-xl border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/10">
                <div className="p-4 border-b border-green-200 dark:border-green-700">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <h3 className="text-lg font-semibold text-green-800 dark:text-green-300">
                      Actions Disponibles
                    </h3>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  {nextActions.map(action => (
                    <div
                      key={action.id}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200 dark:bg-white/5 dark:border-green-700"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
                          {getTypeIcon(action.type)}
                        </div>
                        <div>
                          <h4 className="font-medium text-green-900 dark:text-green-100">{action.title}</h4>
                          <p className="text-sm text-green-700 dark:text-green-300">
                            {MaintenanceActionsServiceClass.formatDuration(action.estimatedDuration)}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="bg-green-500 hover:bg-green-600 text-white"
                        onClick={() => startAction(action.id)}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Démarrer
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions List */}
            <div className="space-y-4">
              {workflow.actions.map((action, index) => (
                <div
                  key={action.id}
                  className={`rounded-xl border transition-all duration-200 ${
                    action.status === 'completed' ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/10' :
                    action.status === 'in_progress' ? 'border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/10' :
                    action.status === 'blocked' ? 'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-900/10' :
                    'border-gray-200 bg-white dark:border-gray-700 dark:bg-white/[0.03]'
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Step Number */}
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                        action.status === 'completed' ? 'bg-green-500 text-white' :
                        action.status === 'in_progress' ? 'bg-blue-500 text-white' :
                        action.status === 'blocked' ? 'bg-red-500 text-white' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {action.status === 'completed' ? <CheckCircle className="h-4 w-4" /> : index + 1}
                      </div>

                      {/* Action Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {action.title}
                            </h3>
                            <Badge size="sm" color={
                              action.priority === 'critical' ? 'error' :
                              action.priority === 'high' ? 'warning' :
                              action.priority === 'medium' ? 'info' : 'light'
                            }>
                              {action.priority}
                            </Badge>
                            <Badge variant="light" size="sm">
                              {MaintenanceActionsServiceClass.getTypeConfig(action.type).label}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {getStatusIcon(action.status)}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleActionExpansion(action.id)}
                            >
                              {expandedActions.has(action.id) ? 
                                <ChevronDown className="h-4 w-4" /> : 
                                <ChevronRight className="h-4 w-4" />
                              }
                            </Button>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {action.description}
                        </p>

                        {/* Progress Bar for In-Progress Actions */}
                        {action.status === 'in_progress' && (
                          <div className="mb-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-gray-500">Progression</span>
                              <span className="text-xs text-gray-500">{action.progressPercentage}%</span>
                            </div>
                            <Progress value={action.progressPercentage} className="h-1.5" />
                          </div>
                        )}

                        {/* Action Metadata */}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Timer className="h-3 w-3" />
                            {MaintenanceActionsServiceClass.formatDuration(action.estimatedDuration)}
                          </span>
                          {action.assignedToId && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              Assigné
                            </span>
                          )}
                          {action.dependencies.length > 0 && (
                            <span className="flex items-center gap-1">
                              <ArrowRight className="h-3 w-3" />
                              {action.dependencies.length} dépendance(s)
                            </span>
                          )}
                        </div>

                        {/* Expanded Content */}
                        {expandedActions.has(action.id) && (
                          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <Tabs defaultValue="details" className="w-full">
                              <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg h-9">
                                <TabsTrigger 
                                  value="details" 
                                  className="flex items-center gap-2 text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-white/[0.03] dark:data-[state=active]:text-white"
                                >
                                  <Settings className="h-3 w-3" />
                                  Détails
                                </TabsTrigger>
                                <TabsTrigger 
                                  value="actions" 
                                  className="flex items-center gap-2 text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-white/[0.03] dark:data-[state=active]:text-white"
                                >
                                  <Play className="h-3 w-3" />
                                  Actions
                                </TabsTrigger>
                                <TabsTrigger 
                                  value="comments" 
                                  className="flex items-center gap-2 text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-white/[0.03] dark:data-[state=active]:text-white"
                                >
                                  <MessageSquare className="h-3 w-3" />
                                  Commentaires
                                </TabsTrigger>
                              </TabsList>

                              <TabsContent value="details" className="space-y-4 mt-4">
                            {/* Checkpoints */}
                            {action.checkpoints.length > 0 && (
                              <div className="mb-4">
                                <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">
                                  Points de contrôle
                                </h4>
                                <div className="space-y-2">
                                  {action.checkpoints.map(checkpoint => (
                                    <div key={checkpoint.id} className="flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        checked={checkpoint.isCompleted}
                                        className="w-4 h-4 text-blue-600 rounded"
                                        onChange={async (e) => {
                                          // Handle checkpoint update
                                          try {
                                            await MaintenanceActionsService.updateCheckpoint(
                                              action.id,
                                              checkpoint.id,
                                              e.target.checked
                                            );
                                            await loadWorkflow();
                                          } catch (err) {
                                            console.error('Error updating checkpoint:', err);
                                          }
                                        }}
                                      />
                                      <span className={`text-sm ${
                                        checkpoint.isCompleted ? 'line-through text-gray-500' : 'text-gray-700'
                                      }`}>
                                        {checkpoint.title}
                                      </span>
                                      {checkpoint.isMandatory && (
                                        <Badge variant="light" color="warning" size="sm">
                                          Obligatoire
                                        </Badge>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Resources */}
                            {action.resourcesNeeded.length > 0 && (
                              <div className="mb-4">
                                <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">
                                  Ressources nécessaires
                                </h4>
                                <div className="flex flex-wrap gap-1">
                                  {action.resourcesNeeded.map((resource, idx) => (
                                    <Badge key={idx} variant="light" size="sm">
                                      {resource}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                                {/* Additional Action Details */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-1">
                                      Compétences requises
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      {action.skillsRequired || 'Non spécifiées'}
                                    </p>
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-1">
                                      Exigences de sécurité
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      {action.safetyRequirements || 'Aucune exigence spéciale'}
                                    </p>
                                  </div>
                                </div>
                              </TabsContent>

                              <TabsContent value="actions" className="space-y-4 mt-4">
                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              {action.status === 'pending' && (
                                <Button
                                  size="sm"
                                  className="bg-blue-500 hover:bg-blue-600 text-white"
                                  onClick={() => startAction(action.id)}
                                >
                                  <Play className="h-4 w-4 mr-1" />
                                  Démarrer
                                </Button>
                              )}
                              
                              {action.status === 'in_progress' && (
                                <>
                                  <Button
                                    size="sm"
                                    className="bg-green-500 hover:bg-green-600 text-white"
                                    onClick={() => completeAction(action.id)}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Terminer
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleActionStatusChange(action.id, 'blocked')}
                                  >
                                    <Pause className="h-4 w-4 mr-1" />
                                    Bloquer
                                  </Button>
                                </>
                              )}
                              
                              {action.status === 'blocked' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleActionStatusChange(action.id, 'pending')}
                                >
                                  <RotateCcw className="h-4 w-4 mr-1" />
                                  Reprendre
                                </Button>
                              )}
                            </div>

                                {/* Status Timeline */}
                                <div className="mt-4">
                                  <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">
                                    Historique des statuts
                                  </h4>
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                      <span className="text-sm text-gray-600">Créé le {formatDate(action.createdAt)}</span>
                                    </div>
                                    {action.startedAt && (
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        <span className="text-sm text-gray-600">Démarré le {formatDate(action.startedAt)}</span>
                          </div>
                        )}
                                    {action.completedAt && (
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span className="text-sm text-gray-600">Terminé le {formatDate(action.completedAt)}</span>
                      </div>
                                    )}
                                  </div>
                                </div>
                              </TabsContent>

                              <TabsContent value="comments" className="mt-4">
                                <MaintenanceActionComments
                                  maintenanceActionId={action.id}
                                  currentUserId="current-user-id" // This would come from auth context
                                  userRole="technician" // This would come from auth context
                                />
                              </TabsContent>
                            </Tabs>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="p-0">
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Timeline des Actions
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                La vue timeline sera disponible prochainement
              </p>
            </div>
          </TabsContent>

          <TabsContent value="metrics" className="p-0">
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Métriques de Performance
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Les métriques détaillées seront disponibles prochainement
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Add Action Modal */}
      <Dialog open={isActionModalOpen} onOpenChange={setIsActionModalOpen}>
                  <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ajouter une Action de Maintenance</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Titre de l'action</Label>
                <Input
                  id="title"
                  value={actionForm.title}
                  onChange={(e) => setActionForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Vérifier les roulements"
                />
              </div>
              <div>
                <Label htmlFor="type">Type d'action</Label>
                <Select 
                  value={actionForm.type} 
                  onValueChange={(value: MaintenanceAction['type']) => 
                    setActionForm(prev => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diagnosis">Diagnostic</SelectItem>
                    <SelectItem value="preparation">Préparation</SelectItem>
                    <SelectItem value="execution">Exécution</SelectItem>
                    <SelectItem value="verification">Vérification</SelectItem>
                    <SelectItem value="documentation">Documentation</SelectItem>
                    <SelectItem value="preventive">Préventif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={actionForm.description}
                onChange={(e) => setActionForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Décrivez l'action en détail..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">Priorité</Label>
                <Select 
                  value={actionForm.priority} 
                  onValueChange={(value: MaintenanceAction['priority']) => 
                    setActionForm(prev => ({ ...prev, priority: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Faible</SelectItem>
                    <SelectItem value="medium">Normale</SelectItem>
                    <SelectItem value="critical">Critique</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="duration">Durée estimée (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={actionForm.estimatedDuration}
                  onChange={(e) => setActionForm(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) }))}
                  min="5"
                  step="5"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="approval"
                checked={actionForm.requiresApproval}
                onChange={(e) => setActionForm(prev => ({ ...prev, requiresApproval: e.target.checked }))}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <Label htmlFor="approval">Nécessite une approbation</Label>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsActionModalOpen(false)}>
                Annuler
              </Button>
              <Button onClick={addCustomAction} className="bg-blue-500 hover:bg-blue-600 text-white">
                Ajouter l'Action
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MaintenanceWorkflow; 