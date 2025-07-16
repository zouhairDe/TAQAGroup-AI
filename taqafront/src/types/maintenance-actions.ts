// =============================================================================
// MAINTENANCE ACTIONS TYPES
// =============================================================================

/**
 * Maintenance Action interface representing individual steps in a maintenance process
 */
export interface MaintenanceAction {
  /** Unique identifier for the action */
  id: string;
  /** Reference to the parent anomaly */
  anomalyId: string;
  /** Action title */
  title: string;
  /** Detailed description of the action */
  description: string;
  /** Action type */
  type: 'diagnosis' | 'preparation' | 'execution' | 'verification' | 'documentation' | 'preventive';
  /** Current status of the action */
  status: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'cancelled';
  /** Priority level */
  priority: 'critical' | 'medium' | 'low';
  /** Estimated duration in minutes */
  estimatedDuration: number;
  /** Actual duration in minutes */
  actualDuration?: number;
  /** Required resources/materials */
  resourcesNeeded: string[];
  /** Required skills/certifications */
  skillsRequired: string[];
  /** Safety requirements */
  safetyRequirements: string[];
  
  // Assignment information
  /** ID of the user assigned to this action */
  assignedToId?: string;
  /** ID of the team assigned to this action */
  assignedTeamId?: string;
  
  // Scheduling information
  /** Planned start date and time */
  plannedStartDate?: Date;
  /** Planned end date and time */
  plannedEndDate?: Date;
  /** Actual start date and time */
  actualStartDate?: Date;
  /** Actual end date and time */
  actualEndDate?: Date;
  
  // Dependencies
  /** Array of action IDs that must be completed before this action */
  dependencies: string[];
  /** Whether this action blocks other actions */
  isBlocking: boolean;
  /** Array of action IDs that depend on this action */
  dependents: string[];
  
  // Progress tracking
  /** Completion percentage (0-100) */
  progressPercentage: number;
  /** Array of sub-tasks or checkpoints */
  checkpoints: MaintenanceCheckpoint[];
  
  // Documentation
  /** Notes and observations */
  notes?: string;
  /** Array of attached files/photos */
  attachments: MaintenanceAttachment[];
  /** User who created this action */
  createdById: string;
  /** Creation timestamp */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt: Date;
  /** User who last updated this action */
  updatedById?: string;
  /** When the action was started */
  startedAt?: Date;
  /** When the action was completed */
  completedAt?: Date;
  
  // Validation
  /** Whether this action requires supervisor approval */
  requiresApproval: boolean;
  /** ID of the approver */
  approvedById?: string;
  /** Approval timestamp */
  approvedAt?: Date;
  /** Approval notes */
  approvalNotes?: string;
}

/**
 * Maintenance Checkpoint interface for tracking sub-tasks within an action
 */
export interface MaintenanceCheckpoint {
  /** Unique identifier for the checkpoint */
  id: string;
  /** Checkpoint title */
  title: string;
  /** Detailed description */
  description?: string;
  /** Whether this checkpoint is completed */
  isCompleted: boolean;
  /** Completion timestamp */
  completedAt?: Date;
  /** User who completed this checkpoint */
  completedById?: string;
  /** Notes about this checkpoint */
  notes?: string;
  /** Whether this checkpoint is mandatory */
  isMandatory: boolean;
  /** Order of this checkpoint in the sequence */
  order: number;
}

/**
 * Maintenance Attachment interface for files and photos
 */
export interface MaintenanceAttachment {
  /** Unique identifier for the attachment */
  id: string;
  /** Original filename */
  filename: string;
  /** File type/extension */
  fileType: string;
  /** File size in bytes */
  fileSize: number;
  /** File URL or path */
  url: string;
  /** Attachment type */
  type: 'photo' | 'document' | 'video' | 'audio' | 'other';
  /** Description of the attachment */
  description?: string;
  /** User who uploaded this attachment */
  uploadedById: string;
  /** Upload timestamp */
  uploadedAt: Date;
}

/**
 * Maintenance Template interface for creating standardized action sequences
 */
export interface MaintenanceTemplate {
  /** Unique identifier for the template */
  id: string;
  /** Template name */
  name: string;
  /** Template description */
  description: string;
  /** Category of maintenance */
  category: 'mechanical' | 'electrical' | 'hydraulic' | 'instrumentation' | 'control';
  /** Equipment type this template applies to */
  equipmentType: string[];
  /** Array of template actions */
  actions: MaintenanceTemplateAction[];
  /** Estimated total duration in minutes */
  estimatedTotalDuration: number;
  /** Whether this template is active */
  isActive: boolean;
  /** Creation information */
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Maintenance Template Action interface for template-based actions
 */
export interface MaintenanceTemplateAction {
  /** Template action identifier */
  id: string;
  /** Action title */
  title: string;
  /** Action description */
  description: string;
  /** Action type */
  type: 'diagnosis' | 'preparation' | 'execution' | 'verification' | 'documentation' | 'preventive';
  /** Priority level */
  priority: 'critical' | 'medium' | 'low';
  /** Estimated duration in minutes */
  estimatedDuration: number;
  /** Required resources */
  resourcesNeeded: string[];
  /** Required skills */
  skillsRequired: string[];
  /** Safety requirements */
  safetyRequirements: string[];
  /** Order in the sequence */
  order: number;
  /** Template dependencies (references to other template action IDs) */
  dependencies: string[];
  /** Whether this action requires approval */
  requiresApproval: boolean;
  /** Template checkpoints */
  checkpoints: MaintenanceTemplateCheckpoint[];
}

/**
 * Maintenance Template Checkpoint interface
 */
export interface MaintenanceTemplateCheckpoint {
  /** Template checkpoint identifier */
  id: string;
  /** Checkpoint title */
  title: string;
  /** Checkpoint description */
  description?: string;
  /** Whether this checkpoint is mandatory */
  isMandatory: boolean;
  /** Order in the sequence */
  order: number;
}

/**
 * Maintenance Workflow interface for tracking overall progress
 */
export interface MaintenanceWorkflow {
  /** Unique identifier for the workflow */
  id: string;
  /** Reference to the anomaly */
  anomalyId: string;
  /** Workflow title */
  title: string;
  /** Current status of the entire workflow */
  status: 'not_started' | 'in_progress' | 'blocked' | 'completed' | 'cancelled';
  /** Overall progress percentage */
  progressPercentage: number;
  /** Array of all actions in this workflow */
  actions: MaintenanceAction[];
  /** Estimated total duration in minutes */
  estimatedTotalDuration: number;
  /** Actual total duration in minutes */
  actualTotalDuration?: number;
  /** Planned start date */
  plannedStartDate?: Date;
  /** Planned end date */
  plannedEndDate?: Date;
  /** Actual start date */
  actualStartDate?: Date;
  /** Actual end date */
  actualEndDate?: Date;
  /** Total estimated cost */
  estimatedCost?: number;
  /** Total actual cost */
  actualCost?: number;
  /** Workflow metadata */
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  /** Template used to create this workflow */
  templateId?: string;
}

/**
 * Action Status Update interface for tracking status changes
 */
export interface ActionStatusUpdate {
  /** Unique identifier for the status update */
  id: string;
  /** Reference to the action */
  actionId: string;
  /** Previous status */
  previousStatus: MaintenanceAction['status'];
  /** New status */
  newStatus: MaintenanceAction['status'];
  /** Reason for the status change */
  reason?: string;
  /** User who made the change */
  updatedById: string;
  /** Update timestamp */
  updatedAt: Date;
  /** Additional notes */
  notes?: string;
}

/**
 * Resource Availability interface
 */
export interface ResourceAvailability {
  /** Resource identifier */
  resourceId: string;
  /** Resource name */
  resourceName: string;
  /** Resource type */
  type: 'material' | 'tool' | 'personnel' | 'equipment';
  /** Whether the resource is available */
  isAvailable: boolean;
  /** Quantity available */
  quantityAvailable: number;
  /** Unit of measurement */
  unit: string;
  /** Next available date if currently unavailable */
  nextAvailableDate?: Date;
  /** Location of the resource */
  location?: string;
}

/**
 * Maintenance Metrics interface for analytics
 */
export interface MaintenanceMetrics {
  /** Total number of actions */
  totalActions: number;
  /** Number of completed actions */
  completedActions: number;
  /** Number of in-progress actions */
  inProgressActions: number;
  /** Number of blocked actions */
  blockedActions: number;
  /** Average completion time in minutes */
  averageCompletionTime: number;
  /** On-time completion rate as percentage */
  onTimeCompletionRate: number;
  /** Resource utilization rate as percentage */
  resourceUtilizationRate: number;
  /** Cost efficiency (actual vs estimated cost) */
  costEfficiency: number;
  /** Quality score based on checklist completion */
  qualityScore: number;
} 

// Resource management
export interface MaintenanceResource {
  id: string;
  name: string;
  type: 'part' | 'tool' | 'consumable' | 'human';
  quantity: number;
  unit: string;
  cost: number;
  supplier?: string;
  available?: boolean;
  reservedUntil?: Date;
}

/**
 * Maintenance Period interface for available maintenance windows
 */
export interface MaintenancePeriod {
  /** Unique identifier for the period */
  id: string;
  /** Period title */
  title: string;
  /** Optional description */
  description?: string;
  /** Start date of the maintenance period */
  startDate: string;
  /** End date of the maintenance period */
  endDate: string;
  /** Duration in days */
  durationDays: number;
  /** Duration in hours */
  durationHours: number;
  /** Current status */
  status: 'available' | 'occupied' | 'completed';
  /** Type of maintenance */
  type: 'maintenance' | 'emergency';
  /** Assigned to user/team */
  assignedTo?: string;
  /** Location information */
  location?: string;
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
  /** Associated slots */
  slots: any[];
} 