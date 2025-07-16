import { 
  MaintenanceAction, 
  MaintenanceWorkflow, 
  MaintenanceTemplate,
  MaintenanceCheckpoint,
  MaintenanceResource
} from '@/types/maintenance-actions';
import { 
  mockMaintenanceTemplates, 
  mockMaintenanceWorkflow,
  createMockWorkflowFromTemplate 
} from '@/data/mock-maintenance-data';

/**
 * Maintenance Actions Service
 * Handles all maintenance workflow and action operations
 * Currently using mock data - will be replaced with real API calls later
 */
class MaintenanceActionsService {
  // Mock data storage (in real app, this would be handled by backend)
  private workflows: Map<string, MaintenanceWorkflow> = new Map();
  private templates: MaintenanceTemplate[] = mockMaintenanceTemplates;

  constructor() {
    // Initialize with mock workflow
    this.workflows.set('cmcud5ego00a0bdkkeg3kqrn4', mockMaintenanceWorkflow);
  }

  // Workflow Management
  async getWorkflowByAnomalyId(anomalyId: string): Promise<MaintenanceWorkflow | null> {
    await this.delay(500); // Simulate API delay
    return this.workflows.get(anomalyId) || null;
  }

  async createWorkflowFromTemplate(
    anomalyId: string, 
    templateId: string
  ): Promise<MaintenanceWorkflow> {
    await this.delay(800);
    
    const template = this.templates.find(t => t.id === templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    const workflow = createMockWorkflowFromTemplate(anomalyId, template);
    this.workflows.set(anomalyId, workflow);
    return workflow;
  }

  async createCustomWorkflow(data: {
    anomalyId: string;
    title: string;
    actions: Omit<MaintenanceAction, 'id' | 'workflowId' | 'createdAt' | 'updatedAt'>[];
  }): Promise<MaintenanceWorkflow> {
    await this.delay(800);
    
    const workflow: MaintenanceWorkflow = {
      id: `workflow_${Date.now()}`,
      anomalyId: data.anomalyId,
      title: data.title,
      description: 'Workflow personnalisé créé pour cette anomalie',
      status: 'pending',
      priority: 'medium',
      actions: data.actions.map((action, index) => ({
        ...action,
        id: `action_${Date.now()}_${index}`,
        workflowId: `workflow_${Date.now()}`,
        order: index + 1,
        status: 'pending',
        assignedTo: null,
        startedAt: null,
        completedAt: null,
        actualDuration: null,
        notes: [],
        checkpoints: [],
        dependencies: [],
        resourcesUsed: [],
        createdAt: new Date(),
        updatedAt: new Date()
      })),
      templateId: null,
      assignedTo: null,
      estimatedDuration: data.actions.reduce((total, action) => total + (action.estimatedDuration || 0), 0),
      actualDuration: null,
      startedAt: null,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.workflows.set(data.anomalyId, workflow);
    return workflow;
  }

  async updateWorkflow(
    workflowId: string, 
    updates: Partial<MaintenanceWorkflow>
  ): Promise<MaintenanceWorkflow> {
    await this.delay(500);
    
    // Find workflow by ID
    let targetWorkflow: MaintenanceWorkflow | null = null;
    let targetKey: string | null = null;
    
    for (const [key, workflow] of this.workflows.entries()) {
      if (workflow.id === workflowId) {
        targetWorkflow = workflow;
        targetKey = key;
        break;
      }
    }
    
    if (!targetWorkflow || !targetKey) {
      throw new Error('Workflow not found');
    }

    const updatedWorkflow = { 
      ...targetWorkflow, 
      ...updates, 
      updatedAt: new Date() 
    };
    
    this.workflows.set(targetKey, updatedWorkflow);
    return updatedWorkflow;
  }

  async deleteWorkflow(workflowId: string): Promise<void> {
    await this.delay(500);
    
    for (const [key, workflow] of this.workflows.entries()) {
      if (workflow.id === workflowId) {
        this.workflows.delete(key);
        return;
      }
    }
    
    throw new Error('Workflow not found');
  }

  // Action Management
  async updateActionStatus(
    actionId: string, 
    status: MaintenanceAction['status'], 
    assignedTo?: string, 
    notes?: string
  ): Promise<MaintenanceAction> {
    await this.delay(500);
    
    const { workflow, action } = this.findActionById(actionId);
    
    const updatedAction = {
      ...action,
      status,
      assignedTo: assignedTo || action.assignedTo,
      updatedAt: new Date(),
      ...(status === 'in_progress' && !action.startedAt && { startedAt: new Date() }),
      ...(status === 'completed' && { completedAt: new Date() }),
      ...(notes && { notes: [...action.notes, { content: notes, timestamp: new Date() }] })
    };

    // Update action in workflow
    const actionIndex = workflow.actions.findIndex(a => a.id === actionId);
    workflow.actions[actionIndex] = updatedAction;
    workflow.updatedAt = new Date();

    return updatedAction;
  }

  async startAction(actionId: string, assignedTo?: string): Promise<MaintenanceAction> {
    return this.updateActionStatus(actionId, 'in_progress', assignedTo);
  }

  async completeAction(actionId: string, notes?: string): Promise<MaintenanceAction> {
    await this.delay(500);
    
    const { workflow, action } = this.findActionById(actionId);
    
    const duration = action.startedAt 
      ? Date.now() - action.startedAt.getTime() 
      : action.estimatedDuration * 60 * 1000;

    const updatedAction = {
      ...action,
      status: 'completed' as const,
      completedAt: new Date(),
      actualDuration: Math.round(duration / (60 * 1000)), // Convert to minutes
      updatedAt: new Date(),
      ...(notes && { notes: [...action.notes, { content: notes, timestamp: new Date() }] })
    };

    // Update action in workflow
    const actionIndex = workflow.actions.findIndex(a => a.id === actionId);
    workflow.actions[actionIndex] = updatedAction;
    workflow.updatedAt = new Date();

    return updatedAction;
  }

  async pauseAction(actionId: string, reason?: string): Promise<MaintenanceAction> {
    return this.updateActionStatus(actionId, 'blocked', undefined, reason);
  }

  async addActionToWorkflow(
    workflowId: string, 
    actionData: Omit<MaintenanceAction, 'id' | 'workflowId' | 'createdAt' | 'updatedAt'>
  ): Promise<MaintenanceAction> {
    await this.delay(500);
    
    // Find workflow by ID
    let targetWorkflow: MaintenanceWorkflow | null = null;
    
    for (const workflow of this.workflows.values()) {
      if (workflow.id === workflowId) {
        targetWorkflow = workflow;
        break;
      }
    }
    
    if (!targetWorkflow) {
      throw new Error('Workflow not found');
    }

    const newAction: MaintenanceAction = {
      ...actionData,
      id: `action_${Date.now()}_${targetWorkflow.actions.length}`,
      workflowId,
      order: targetWorkflow.actions.length + 1,
      status: 'pending',
      assignedTo: null,
      startedAt: null,
      completedAt: null,
      actualDuration: null,
      notes: [],
      checkpoints: [],
      dependencies: [],
      resourcesUsed: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    targetWorkflow.actions.push(newAction);
    targetWorkflow.updatedAt = new Date();

    return newAction;
  }

  // Checkpoint Management
  async updateCheckpoint(
    actionId: string, 
    checkpointId: string, 
    completed: boolean
  ): Promise<MaintenanceCheckpoint> {
    await this.delay(300);
    
    const { workflow, action } = this.findActionById(actionId);
    
    const checkpoint = action.checkpoints.find(c => c.id === checkpointId);
    if (!checkpoint) {
      throw new Error('Checkpoint not found');
    }

    checkpoint.completed = completed;
    checkpoint.completedAt = completed ? new Date() : null;

    // Update action in workflow
    const actionIndex = workflow.actions.findIndex(a => a.id === actionId);
    workflow.actions[actionIndex] = action;
    workflow.updatedAt = new Date();

    return checkpoint;
  }

  async addCheckpoint(
    actionId: string, 
    checkpointData: Omit<MaintenanceCheckpoint, 'id'>
  ): Promise<MaintenanceCheckpoint> {
    await this.delay(300);
    
    const { workflow, action } = this.findActionById(actionId);
    
    const newCheckpoint: MaintenanceCheckpoint = {
      ...checkpointData,
      id: `checkpoint_${Date.now()}_${action.checkpoints.length}`,
      completed: false,
      completedAt: null
    };

    action.checkpoints.push(newCheckpoint);

    // Update action in workflow
    const actionIndex = workflow.actions.findIndex(a => a.id === actionId);
    workflow.actions[actionIndex] = action;
    workflow.updatedAt = new Date();

    return newCheckpoint;
  }

  // Template Management
  async getTemplates(): Promise<MaintenanceTemplate[]> {
    await this.delay(300);
    return [...this.templates];
  }

  async getTemplate(templateId: string): Promise<MaintenanceTemplate | null> {
    await this.delay(300);
    return this.templates.find(t => t.id === templateId) || null;
  }

  // Resource Management
  async getAvailableResources(): Promise<MaintenanceResource[]> {
    await this.delay(300);
    
    // Mock resources
    return [
      {
        id: 'resource_1',
        name: 'Roulement SKF 6205',
        type: 'part',
        quantity: 5,
        unit: 'pièce',
        cost: 45.50,
        supplier: 'SKF France'
      },
      {
        id: 'resource_2',
        name: 'Huile hydraulique ISO 46',
        type: 'consumable',
        quantity: 200,
        unit: 'litres',
        cost: 8.50,
        supplier: 'Total Lubricants'
      },
      {
        id: 'resource_3',
        name: 'Technicien Mécanique Senior',
        type: 'human',
        quantity: 1,
        unit: 'personne',
        cost: 45.00,
        supplier: 'Équipe Interne'
      }
    ];
  }

  // Analytics and Reporting
  async getWorkflowAnalytics(workflowId: string): Promise<{
    totalActions: number;
    completedActions: number;
    progressPercentage: number;
    averageCompletionTime: number;
    overdueActions: number;
    blockedActions: number;
  }> {
    await this.delay(400);
    
    // Find workflow by ID
    let targetWorkflow: MaintenanceWorkflow | null = null;
    
    for (const workflow of this.workflows.values()) {
      if (workflow.id === workflowId) {
        targetWorkflow = workflow;
        break;
      }
    }
    
    if (!targetWorkflow) {
      throw new Error('Workflow not found');
    }

    const totalActions = targetWorkflow.actions.length;
    const completedActions = targetWorkflow.actions.filter(a => a.status === 'completed').length;
    const blockedActions = targetWorkflow.actions.filter(a => a.status === 'blocked').length;
    
    const completedActionsWithDuration = targetWorkflow.actions.filter(
      a => a.status === 'completed' && a.actualDuration
    );
    
    const averageCompletionTime = completedActionsWithDuration.length > 0
      ? completedActionsWithDuration.reduce((sum, a) => sum + (a.actualDuration || 0), 0) / completedActionsWithDuration.length
      : 0;

    return {
      totalActions,
      completedActions,
      progressPercentage: totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0,
      averageCompletionTime,
      overdueActions: 0, // Mock value
      blockedActions
    };
  }

  // Utility Methods
  private findActionById(actionId: string): { workflow: MaintenanceWorkflow; action: MaintenanceAction } {
    for (const workflow of this.workflows.values()) {
      const action = workflow.actions.find(a => a.id === actionId);
      if (action) {
        return { workflow, action };
      }
    }
    throw new Error('Action not found');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Utility functions for UI components
  static calculateProgress(actions: MaintenanceAction[]): number {
    if (actions.length === 0) return 0;
    const completed = actions.filter(action => action.status === 'completed').length;
    return Math.round((completed / actions.length) * 100);
  }

  static canActionStart(action: MaintenanceAction, allActions: MaintenanceAction[]): boolean {
    if (action.status !== 'pending') return false;
    
    return action.dependencies.every(depId => {
      const dependency = allActions.find(a => a.id === depId);
      return dependency?.status === 'completed';
    });
  }

  static formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  }

  static getStatusConfig(status: MaintenanceAction['status']) {
    switch (status) {
      case 'pending':
        return { label: 'En attente', color: 'bg-gray-100 text-gray-800', icon: 'Clock' };
      case 'in_progress':
        return { label: 'En cours', color: 'bg-blue-100 text-blue-800', icon: 'Play' };
      case 'completed':
        return { label: 'Terminée', color: 'bg-green-100 text-green-800', icon: 'CheckCircle' };
      case 'blocked':
        return { label: 'Bloquée', color: 'bg-red-100 text-red-800', icon: 'AlertTriangle' };
      case 'cancelled':
        return { label: 'Annulée', color: 'bg-gray-100 text-gray-800', icon: 'XCircle' };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-800', icon: 'Clock' };
    }
  }

  static getTypeConfig(type: MaintenanceAction['type']) {
    switch (type) {
      case 'diagnosis':
        return { label: 'Diagnostic', color: 'bg-purple-100 text-purple-800', icon: 'Eye' };
      case 'preparation':
        return { label: 'Préparation', color: 'bg-yellow-100 text-yellow-800', icon: 'Settings' };
      case 'execution':
        return { label: 'Exécution', color: 'bg-blue-100 text-blue-800', icon: 'Tool' };
      case 'verification':
        return { label: 'Vérification', color: 'bg-green-100 text-green-800', icon: 'CheckSquare' };
      case 'documentation':
        return { label: 'Documentation', color: 'bg-indigo-100 text-indigo-800', icon: 'FileText' };
      case 'preventive':
        return { label: 'Préventif', color: 'bg-teal-100 text-teal-800', icon: 'Shield' };
      default:
        return { label: type, color: 'bg-gray-100 text-gray-800', icon: 'Tool' };
    }
  }
}

// Export singleton instance
export default new MaintenanceActionsService();

// Also export the class for static method access
export { MaintenanceActionsService }; 