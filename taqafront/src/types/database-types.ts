/**
 * TAQA Anomaly Management System - TypeScript Type Definitions
 * 
 * This file contains all TypeScript interfaces corresponding to the database models
 * used in the TAQA anomaly management system. These types are used throughout
 * the frontend application for type safety and better development experience.
 * 
 * @author TAQA Development Team
 * @version 1.0.0
 */

// =============================================================================
// USER MANAGEMENT & AUTHENTICATION TYPES
// =============================================================================

/**
 * Enhanced User interface representing system users
 * Extends the basic User model with profile information and relationships
 */
export interface User {
    /** Unique identifier for the user */
    id: string;
    /** User's email address (must be @taqa.ma domain) */
    email: string;
    /** Full name of the user */
    name: string;
    /** User role - determines access permissions */
    role: string;
    /** Creation timestamp */
    createdAt: string;
    /** Last update timestamp */
    updatedAt: string;
  }
  
  /**
   * User Profile interface containing extended user information
   * Linked to the main User model via userId reference
   */
  export interface UserProfile {
    /** Unique identifier for the profile */
    id: string;
    /** Reference to the main User record */
    userId: string;
    /** Department the user belongs to (e.g., "Production", "Maintenance") */
    department?: string;
    /** Site location (e.g., "Noor Ouarzazate", "Noor Midelt") */
    site?: string;
    /** User's phone number */
    phone?: string;
    /** Flag indicating if this is the user's first login */
    isFirstLogin: boolean;
    /** Timestamp of the user's last login */
    lastLogin?: Date;
    /** ID of the manager who created this account */
    createdBy?: string;
  }
  
  /**
   * Department interface representing organizational departments
   */
  export interface Department {
    /** Unique identifier for the department */
    id: string;
    /** Human-readable department name */
    name: string;
    /** Short department code (e.g., "PROD", "MAINT") */
    code: string;
    /** Optional description of the department */
    description?: string;
    /** Flag indicating if the department is active */
    isActive: boolean;
    /** Creation timestamp */
    createdAt: Date;
    /** Last update timestamp */
    updatedAt: Date;
  }
  
  /**
   * Site interface representing physical locations/facilities
   */
  export interface Site {
    /** Unique identifier for the site */
    id: string;
    /** Human-readable site name */
    name: string;
    /** Short site code (e.g., "OUA", "MID", "ATL") */
    code: string;
    /** Geographic location description */
    location: string;
    /** Power generation capacity (e.g., "580 MW") */
    capacity?: string;
    /** Current operational status */
    status: 'operational' | 'construction' | 'maintenance';
    /** GPS coordinates as JSON object {latitude: number, longitude: number} */
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    /** Creation timestamp */
    createdAt: Date;
    /** Last update timestamp */
    updatedAt: Date;
  }
  
  // =============================================================================
  // TEAMS & PERSONNEL MANAGEMENT TYPES
  // =============================================================================
  
  /**
   * Team interface representing maintenance/technical teams
   */
  export interface Team {
    /** Unique identifier for the team */
    id: string;
    /** Team name (e.g., "Équipe Alpha") */
    name: string;
    /** Short team code (e.g., "EQU-MEC-01") */
    code: string;
    /** User ID of the team leader */
    leadId: string | null;
    /** Array of team specialties (e.g., ["Turbines", "Hydraulique"]) */
    specialties: string[];
    /** Primary location where the team operates */
    location: string;
    /** Flag indicating if the team is active */
    isActive: boolean;
    /** Team performance rating (1-5 scale) */
    rating: number | null;
    /** Creation timestamp */
    createdAt: string;
    /** Last update timestamp */
    updatedAt: string;
    
    // Populated relationships
    /** Team leader information (populated) */
    lead?: User;
    /** Team members list (populated) */
    members?: TeamMember[];
  }
  
  /**
   * Team Member interface representing individual team memberships
   */
  export interface TeamMember {
    /** Unique identifier for the team membership */
    id: string;
    /** Reference to the team */
    teamId: string;
    /** Reference to the user */
    userId: string;
    /** Member's role within the team */
    role: 'chef' | 'senior' | 'junior' | 'apprenti';
    /** Array of technical skills (e.g., ["Mécanique", "Soudure"]) */
    skills: string[];
    /** Years of experience (e.g., "5 ans", "12 ans") */
    experience?: string;
    /** Individual performance rating (1-5 scale) */
    rating?: number;
    /** Date when the member joined the team */
    joinedAt: Date;
    /** Last update timestamp */
    updatedAt: Date;
    
    // Populated relationships
    /** Team information (populated) */
    team?: Team;
    /** User information (populated) */
    user?: User;
  }
  
  // =============================================================================
  // EQUIPMENT & INFRASTRUCTURE TYPES
  // =============================================================================
  
  /**
   * Zone interface representing areas within a site
   */
  export interface Zone {
    /** Unique identifier for the zone */
    id: string;
    /** Zone name (e.g., "Zone Production A") */
    name: string;
    /** Short zone code */
    code: string;
    /** Reference to the parent site */
    siteId: string;
    /** Optional description of the zone */
    description?: string;
    /** Creation timestamp */
    createdAt: Date;
    /** Last update timestamp */
    updatedAt: Date;
    
    // Populated relationships
    /** Site information (populated) */
    site?: Site;
    /** Equipment in this zone (populated) */
    equipment?: Equipment[];
  }
  
  /**
   * Equipment interface representing industrial equipment/assets
   */
  export interface Equipment {
    /** Unique identifier for the equipment */
    id: string;
    /** Equipment name (e.g., "Turbine T1") */
    name: string;
    /** Unique equipment code (e.g., "TUR-001-OUA") */
    code: string;
    /** Optional description */
    description?: string;
    /** Equipment type category */
    type: 'mechanical' | 'electrical' | 'hydraulic' | 'instrumentation';
    /** Specific equipment category (e.g., "turbine", "compressor") */
    category?: string;
    /** Reference to the site where equipment is located */
    siteId: string;
    /** Reference to the zone within the site */
    zoneId?: string;
    /** Current operational status */
    status: 'operational' | 'maintenance' | 'warning' | 'critical';
    /** Manufacturer name */
    manufacturer?: string;
    /** Equipment model */
    model?: string;
    /** Serial number */
    serialNumber?: string;
    /** Installation date */
    installDate?: Date;
    /** Date of last maintenance */
    lastMaintenance?: Date;
    /** Scheduled next maintenance date */
    nextMaintenance?: Date;
    /** Flag indicating if equipment is active */
    isActive: boolean;
    /** Creation timestamp */
    createdAt: Date;
    /** Last update timestamp */
    updatedAt: Date;
    
    // Populated relationships
    /** Site information (populated) */
    site?: Site;
    /** Zone information (populated) */
    zone?: Zone;
    /** Related anomalies (populated) */
    anomalies?: Anomaly[];
  }
  
  // =============================================================================
  // ANOMALY MANAGEMENT TYPES
  // =============================================================================
  
  /**
   * Anomaly interface representing equipment anomalies/issues
   */
  export interface Anomaly {
    /** Unique identifier for the anomaly */
    id: string;
    /** Human-readable anomaly code (e.g., "ABO-2024-158") */
    code: string;
    /** Short title describing the anomaly */
    title: string;
    /** Detailed description of the anomaly */
    description: string;
    /** Reference to the affected equipment */
    equipmentId: string | null;
    /** Severity level of the anomaly */
    severity: string;
    /** Current status of the anomaly */
    status: 'new' | 'in_progress' | 'resolved' | 'closed';
    /** Priority level (P1 = highest priority) */
    priority: 'critical' | 'medium' | 'low';
    /** Technical category */
    category: string;
    /** How the anomaly was detected */
    origin: string;
    
    // Assignment information
    /** ID of the user assigned to handle this anomaly */
    assignedToId: string | null;
    /** ID of the team assigned to handle this anomaly */
    assignedTeamId: string | null;
    
    // Reporting information
    /** ID of the user who reported this anomaly */
    reportedById: string;
    /** Timestamp when the anomaly was reported */
    reportedAt: string;
    
    // Impact assessment
    /** Whether this anomaly has safety implications */
    safetyImpact: boolean;
    /** Whether this anomaly has environmental implications */
    environmentalImpact: boolean;
    /** Whether this anomaly affects production */
    productionImpact: boolean;
    /** Estimated cost to resolve (in MAD) */
    estimatedCost: number | null;
    /** Actual cost incurred (in MAD) */
    actualCost: number | null;
    /** Hours of downtime caused */
    downtimeHours: number | null;
    /** Duration in hours to resolve this anomaly */
    durationToResolve: number | null;
    
    // SLA and timing
    /** Service Level Agreement time limit in hours */
    slaHours: number | null;
    /** Due date for resolution */
    dueDate: string | null;
    /** Timestamp when anomaly was resolved */
    resolvedAt: string | null;
    
    // AI predictions
    /** AI confidence level (0-1) */
    aiConfidence: number | null;
    /** AI suggested severity level */
    aiSuggestedSeverity: string | null;
    /** Array of factors considered by AI */
    aiFactors: string[];
    
    // Additional fields from backend
    /** Equipment identifier code */
    equipmentIdentifier?: string;
    /** Criticality level */
    criticite?: string;
    /** Availability score (0-100) */
    disponibilite?: number;
    /** Reliability score (0-100) */
    fiabilite?: number;
    /** Process safety score (0-100) */
    processSafety?: number;
    /** System type */
    systeme?: string;
    
    /** Creation timestamp */
    createdAt: string;
    /** Last update timestamp */
    updatedAt: string;
    
    // Populated relationships
    /** Equipment information (populated) */
    equipment?: Equipment;
    /** Assigned user information (populated) */
    assignedTo?: User;
    /** Assigned team information (populated) */
    assignedTeam?: Team;
    /** Reporter information (populated) */
    reportedBy?: User;
    /** Comments on this anomaly (populated) */
    comments?: Comment[];
    /** File attachments (populated) */
    attachments?: Attachment[];
    /** Related REX entries (populated) */
    rexEntries?: REXEntry[];
    /** Scheduled slots (populated) */
    slots?: Slot[];
  }
  
  /**
   * Comment interface for anomaly discussions
   */
  export interface Comment {
    /** Unique identifier for the comment */
    id: string;
    /** Comment text content */
    content: string;
    /** Reference to the anomaly */
    anomalyId: string | null;
    /** Reference to the comment author */
    authorId: string;
    /** Creation timestamp */
    createdAt: string;
    /** Last update timestamp */
    updatedAt: string;
    /** Helpful votes */
    helpful: number;
    /** Reference to REX entry */
    rexId: string | null;
    
    // Populated relationships
    /** Anomaly information (populated) */
    anomaly?: Anomaly;
    /** Author information (populated) */
    author?: User;
  }
  
  /**
   * Attachment interface for file uploads
   */
  export interface Attachment {
    /** Unique identifier for the attachment */
    id: string;
    /** Original filename */
    filename: string;
    /** URL to access the file */
    fileUrl: string;
    /** MIME type of the file */
    fileType: string;
    /** File size in bytes */
    fileSize: number;
    /** Reference to anomaly (if attached to anomaly) */
    anomalyId: string | null;
    /** Reference to REX entry (if attached to REX) */
    rexId: string | null;
    /** Reference to the user who uploaded the file */
    uploadedById: string;
    /** Upload timestamp */
    uploadedAt: string;
    /** File ID from backend */
    fileId: string;
    
    // Populated relationships
    /** Anomaly information (populated) */
    anomaly?: Anomaly;
    /** REX entry information (populated) */
    rex?: REXEntry;
    /** Uploader information (populated) */
    uploadedBy?: User;
  }
  
  // =============================================================================
  // MAINTENANCE PLANNING TYPES
  // =============================================================================
  
  /**
   * Maintenance Task interface for planned maintenance activities
   */
  export interface MaintenanceTask {
    /** Unique identifier for the maintenance task */
    id: string;
    /** Human-readable task code (e.g., "MW-2024-001") */
    code: string;
    /** Task title */
    title: string;
    /** Detailed description of the maintenance work */
    description: string;
    /** Type of maintenance */
    type: 'preventive' | 'corrective' | 'inspection' | 'optimization';
    /** Priority level */
    priority: 'critical' | 'medium' | 'low';
    /** Current status */
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'delayed';
    
    // Scheduling information
    /** Planned start date and time */
    startDate: Date;
    /** Planned end date and time */
    endDate: Date;
    /** Estimated duration in hours */
    duration: number;
    /** Planned downtime in hours */
    plannedDowntime?: number;
    /** Actual downtime incurred in hours */
    actualDowntime?: number;
    
    // Assignment information
    /** ID of the assigned team */
    assignedTeamId?: string;
    /** ID of the assigned individual */
    assignedToId?: string;
    
    // Location and equipment
    /** Site where maintenance will occur */
    siteId?: string;
    /** Zone where maintenance will occur */
    zoneId?: string;
    /** Array of equipment IDs that will be maintained */
    equipmentIds: string[];
    
    // Cost and resources
    /** Estimated cost in MAD */
    estimatedCost?: number;
    /** Actual cost incurred in MAD */
    actualCost?: number;
    /** Array of required resources/materials */
    resourcesNeeded: string[];
    /** Array of safety requirements */
    safetyRequirements: string[];
    
    // Dependencies
    /** Whether task depends on weather conditions */
    weatherDependency: boolean;
    /** Whether this task is on the critical path */
    criticalPath: boolean;
    /** Array of related anomaly IDs */
    linkedAnomalyIds: string[];
    
    // Progress tracking
    /** Completion percentage (0-100) */
    completionRate: number;
    
    /** Creation timestamp */
    createdAt: Date;
    /** Last update timestamp */
    updatedAt: Date;
    
    // Populated relationships
    /** Assigned team information (populated) */
    assignedTeam?: Team;
    /** Assigned user information (populated) */
    assignedTo?: User;
    /** Equipment information (populated) */
    equipment?: Equipment[];
  }
  
  // =============================================================================
  // REX (RETURN OF EXPERIENCE) TYPES
  // =============================================================================
  
  /**
   * REX Entry interface for knowledge management
   */
  export interface REXEntry {
    /** Unique identifier for the REX entry */
    id: string;
    /** Human-readable REX code (e.g., "REX-2024-001") */
    code: string;
    /** Title of the REX entry */
    title: string;
    /** Reference to related anomaly */
    anomalyId?: string;
    /** Reference to related equipment */
    equipmentId?: string;
    /** Type of equipment involved */
    equipmentType?: string;
    /** Main category */
    category: string;
    /** Subcategory for more specific classification */
    subcategory?: string;
    /** Site where the issue occurred */
    site: string;
    /** Zone where the issue occurred */
    zone?: string;
    
    // Status and approval
    /** Current status of the REX entry */
    status: 'draft' | 'pending_review' | 'approved' | 'rejected';
    /** Priority level */
    priority: 'high' | 'medium' | 'low';
    
    // Content
    /** Root cause analysis */
    rootCause: string;
    /** Lessons learned from the experience */
    lessonsLearned: string;
    /** Array of preventive actions to avoid recurrence */
    preventiveActions: string[];
    /** Solution that was implemented */
    solution: string;
    
    // Metrics
    /** Time taken to resolve the issue */
    timeToResolve?: string;
    /** Financial impact */
    costImpact?: string;
    /** Downtime caused in hours */
    downtimeHours?: number;
    /** Whether there was safety impact */
    safetyImpact: boolean;
    /** Whether there was environmental impact */
    environmentalImpact: boolean;
    /** Whether production was impacted */
    productionImpact: boolean;
    
    // Knowledge management
    /** Array of tags for searchability */
    tags: string[];
    /** Knowledge value rating */
    knowledgeValue: 'high' | 'medium' | 'low';
    /** Reusability score (0-1) */
    reusabilityScore?: number;
    /** Average user rating (1-5) */
    rating?: number;
    /** Number of votes received */
    votes: number;
    /** Number of views */
    views: number;
    /** Number of bookmarks */
    bookmarks: number;
    
    /** Array of related anomaly IDs */
    relatedAnomalyIds: string[];
    
    // Audit information
    /** ID of the user who created this REX */
    createdById: string;
    /** Creation timestamp */
    createdAt: Date;
    /** ID of the user who approved this REX */
    approvedById?: string;
    /** Approval timestamp */
    approvedAt?: Date;
    /** Last update timestamp */
    updatedAt: Date;
    
    // Populated relationships
    /** Related anomaly (populated) */
    anomaly?: Anomaly;
    /** Creator information (populated) */
    createdBy?: User;
    /** Approver information (populated) */
    approvedBy?: User;
    /** File attachments (populated) */
    attachments?: Attachment[];
  }
  
  // =============================================================================
  // SYSTEM CONFIGURATION TYPES
  // =============================================================================
  
  /**
   * System Setting interface for application configuration
   */
  export interface SystemSetting {
    /** Unique identifier for the setting */
    id: string;
    /** Setting key (unique identifier) */
    key: string;
    /** Setting value as string */
    value: string;
    /** Category for grouping settings */
    category: 'general' | 'notifications' | 'security' | 'integrations';
    /** Data type of the value */
    type: 'string' | 'number' | 'boolean' | 'json';
    /** Whether the setting is active */
    isActive: boolean;
    /** Last update timestamp */
    updatedAt: Date;
    /** ID of the user who last updated this setting */
    updatedBy?: string;
  }
  
  // =============================================================================
  // ANALYTICS & REPORTING TYPES
  // =============================================================================
  
  /**
   * KPI Metric interface for performance indicators
   */
  export interface KPIMetric {
    /** Unique identifier for the KPI metric */
    id: string;
    /** Metric name */
    name: string;
    /** Category for grouping metrics */
    category: 'anomalies' | 'performance' | 'operational';
    /** Current metric value */
    value: number;
    /** Previous period value for comparison */
    previousValue?: number;
    /** Percentage change from previous period */
    change?: number;
    /** Trend direction */
    trend?: 'up' | 'down' | 'stable';
    /** Target value for this metric */
    target?: number;
    /** Unit of measurement */
    unit?: string;
    /** Status based on target comparison */
    status?: 'good' | 'warning' | 'critical';
    /** Time period this metric covers */
    period: 'daily' | 'weekly' | 'monthly';
    /** When this metric was calculated */
    calculatedAt: Date;
    /** Site this metric applies to (if site-specific) */
    siteId?: string;
  }
  
  /**
   * Report interface for generated reports
   */
  export interface Report {
    /** Unique identifier for the report */
    id: string;
    /** Report name/title */
    name: string;
    /** Type of report */
    type: 'dashboard' | 'analytics' | 'maintenance' | 'rex';
    /** Report parameters as JSON object */
    parameters: Record<string, any>;
    /** ID of the user who generated the report */
    generatedBy: string;
    /** When the report was generated */
    generatedAt: Date;
    /** URL to download the report file */
    fileUrl?: string;
    
    // Populated relationships
    /** Generator information (populated) */
    user?: User;
  }
  
  // =============================================================================
  // SLOTTING SYSTEM - MAINTENANCE WINDOW MANAGEMENT
  // =============================================================================
  
  /**
   * Slot interface representing maintenance window bookings
   * Used for scheduling anomaly fixes during planned maintenance periods
   */
  export interface Slot {
    /** Unique identifier for the slot */
    id: string;
    /** Human-readable slot code (e.g., "SLT-2024-001") */
    code: string;
    /** Slot title */
    title: string;
    /** Optional description */
    description?: string;
    
    // Anomaly assignment
    /** Reference to the anomaly being scheduled */
    anomalyId: string;
    
    // Flexible date scheduling
    /** Array of dates when work can be performed */
    dates: Date[];
    /** Estimated duration in hours */
    estimatedDuration?: number;
    /** Actual duration in hours */
    actualDuration?: number;
    
    // Status and priority
    /** Current status of the slot */
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'delayed';
    /** Priority level */
    priority: 'high' | 'medium' | 'low';
    
    // Assignment and responsibility
    /** ID of the manager who created the slot */
    createdById: string;
    /** Optional team assignment */
    assignedTeamId?: string;
    /** Optional individual assignment */
    assignedToId?: string;
    
    // Maintenance window details
    /** Type of maintenance window */
    windowType: 'planned' | 'emergency' | 'opportunistic';
    /** Whether equipment downtime is required */
    downtime: boolean;
    /** Array of safety requirements */
    safetyPrecautions: string[];
    /** Array of required resources */
    resourcesNeeded: string[];
    
    // Cost and impact
    /** Estimated cost in MAD */
    estimatedCost?: number;
    /** Actual cost incurred in MAD */
    actualCost?: number;
    /** Whether production will be impacted */
    productionImpact: boolean;
    
    // Notes and comments
    /** Planning notes */
    notes?: string;
    /** Completion notes */
    completionNotes?: string;
    
    // Audit timestamps
    /** Creation timestamp */
    createdAt: Date;
    /** Last update timestamp */
    updatedAt: Date;
    /** When the slot was scheduled */
    scheduledAt?: Date;
    /** When work actually started */
    startedAt?: Date;
    /** When work was completed */
    completedAt?: Date;
    
    // Populated relationships
    /** Anomaly information (populated) */
    anomaly?: Anomaly;
    /** Creator information (populated) */
    createdBy?: User;
    /** Assigned team information (populated) */
    assignedTeam?: Team;
    /** Assigned user information (populated) */
    assignedTo?: User;
  }
  
  /**
   * Available maintenance window interface
   * Represents predefined time periods when maintenance can be scheduled
   */
  export interface AvailableWindow {
    /** Unique identifier for the window */
    id: string;
    /** Window start date */
    startDate: string;
    /** Window end date */
    endDate: string;
    /** Duration in days */
    durationDays: number;
    /** Duration in hours */
    durationHours: number;
    /** Window description */
    description: string;
  }
  
  // =============================================================================
  // UTILITY TYPES
  // =============================================================================
  
  /**
   * API Response wrapper type
   */
  export interface ApiResponse<T = any> {
    /** Whether the operation was successful */
    success: boolean;
    /** Response data */
    data?: T;
    /** Error message if unsuccessful */
    message?: string;
    /** Additional error details */
    error?: string;
  }
  
  /**
   * Pagination metadata
   */
  export interface PaginationMeta {
    /** Current page number (1-based) */
    page: number;
    /** Number of items per page */
    limit: number;
    /** Total number of items */
    total: number;
    /** Total number of pages */
    totalPages: number;
    /** Whether there is a next page */
    hasNext: boolean;
    /** Whether there is a previous page */
    hasPrev: boolean;
  }
  
  /**
   * Paginated response type
   */
  export interface PaginatedResponse<T = any> {
    /** Array of items for current page */
    data: T[];
    /** Pagination metadata */
    meta: PaginationMeta;
  }
  
  /**
   * Filter parameters for list endpoints
   */
  export interface FilterParams {
    /** Search query string */
    search?: string;
    /** Status filter */
    status?: string;
    /** Priority filter */
    priority?: string;
    /** Category filter */
    category?: string;
    /** Site filter */
    site?: string;
    /** Date range start */
    dateFrom?: string;
    /** Date range end */
    dateTo?: string;
    /** Sort field */
    sortBy?: string;
    /** Sort direction */
    sortOrder?: 'asc' | 'desc';
    /** Page number */
    page?: number;
    /** Items per page */
    limit?: number;
  }
  
  /**
   * Dashboard statistics type
   */
  export interface DashboardStats {
    /** Total number of anomalies */
    totalAnomalies: number;
    /** Number of critical anomalies */
    criticalAnomalies: number;
    /** Number of high priority anomalies */
    highPriorityAnomalies: number;
    /** Average resolution time in hours */
    avgResolutionTime: number;
    /** Equipment availability percentage */
    equipmentAvailability: number;
    /** Number of active maintenance tasks */
    activeMaintenanceTasks: number;
    /** Number of team members */
    totalTeamMembers: number;
    /** System uptime percentage */
    systemUptime: number;
  }
  
  // =============================================================================
  // DASHBOARD SPECIFIC TYPES
  // =============================================================================
  
  /**
   * Dashboard Analytics Metrics
   */
  export interface DashboardMetrics {
    /** Total anomalies detected */
    totalAnomalies: number;
    /** Change from previous period */
    anomaliesChange: number;
    /** Total interventions */
    totalInterventions: number;
    /** Change from previous period */
    interventionsChange: number;
    /** Resolution rate percentage */
    resolutionRate: number;
    /** Change from previous period */
    resolutionRateChange: number;
    /** Average resolution time in hours */
    averageResolutionTime: number;
    /** Change from previous period */
    resolutionTimeChange: number;
  }
  
  /**
   * Anomaly Type Distribution
   */
  export interface AnomalyTypeDistribution {
    /** Type name */
    type: string;
    /** Number of anomalies */
    count: number;
    /** Percentage of total */
    percentage: number;
    /** Color for charts */
    color: string;
    /** Trend change */
    trend: string;
    /** Severity level */
    severity: 'critical' | 'high' | 'medium' | 'low';
  }
  
  /**
   * Critical Alert
   */
  export interface CriticalAlert {
    /** Alert ID */
    id: string;
    /** Alert title */
    title: string;
    /** Time ago string */
    time: string;
    /** Original creation timestamp for sorting */
    createdAt?: string;
    /** Severity level */
    severity: 'critical' | 'high' | 'medium';
    /** Equipment location */
    location: string;
    /** Equipment code */
    equipment: string;
    /** Technical measurement */
    temperature?: string;
    /** Pressure measurement */
    pressure?: string;
    /** Vibration measurement */
    vibration?: string;
    /** Last reading */
    lastReading?: string;
    /** Alert status */
    status: 'new' | 'in_progress' | 'resolved' | 'closed';
    /** Whether action is required */
    actionRequired: boolean;
  }
  
  /**
   * Team Performance Data
   */
  export interface TeamPerformanceData {
    /** Team name */
    name: string;
    /** Team leader name */
    leader: string;
    /** Anomalies resolved */
    resolved: number;
    /** Anomalies pending */
    pending: number;
    /** Team efficiency percentage */
    efficiency: number;
    /** Average response time */
    responseTime: string;
    /** Customer satisfaction rating */
    satisfaction: number;
    /** Performance trend */
    trend: string;
    /** Number of team members */
    members: number;
    /** Work shift */
    shift: string;
    /** Team status */
    status: 'active' | 'break' | 'offline';
  }
  
  /**
   * Recent Activity
   */
  export interface RecentActivity {
    /** Activity ID */
    id: string;
    /** Action performed */
    action: string;
    /** Description of the action */
    description: string;
    /** User who performed the action */
    user: string;
    /** User role */
    userRole: string;
    /** Time ago string */
    time: string;
    /** Activity type */
    type: 'success' | 'alert' | 'warning' | 'maintenance' | 'info' | 'assignment';
    /** Activity category */
    category: string;
    /** Related equipment */
    equipment?: string;
    /** Location */
    location: string;
    /** Priority level */
    priority: 'critical' | 'high' | 'medium' | 'low';
    /** Duration if applicable */
    duration?: string;
    /** Estimated duration */
    estimatedDuration?: string;
    /** Report type */
    reportType?: string;
    /** Team assigned */
    team?: string;
    /** Severity level */
    severity?: string;
  }
  
  /**
   * Complete Dashboard Data
   */
  export interface DashboardData {
    /** Analytics metrics */
    metrics: DashboardMetrics;
    /** Anomaly type distribution */
    anomalyTypes: AnomalyTypeDistribution[];
    /** Critical alerts */
    criticalAlerts: CriticalAlert[];
    /** Team performance data */
    teamPerformance: TeamPerformanceData[];
    /** Recent activities */
    recentActivities: RecentActivity[];
    /** Last update timestamp */
    lastUpdate: Date;
  }

export interface AnomalyStats {
  totalAnomalies: number;
  statusDistribution: Record<string, number>;
  priorityDistribution: Record<string, number>;
  siteDistribution: Record<string, number>;
  recentAnomalies: Anomaly[];
}

export interface AnomalyAction {
  id: string;
  anomalyId: string;
  type: string;
  title: string;
  description: string;
  metadata: Record<string, any> | null;
  performedById: string;
  teamId: string | null;
  createdAt: string;
  updatedAt: string;
  status: string;
  priority: string;
  severity: string;
  category: string;
  impact: {
    cost: number;
    safety: number;
    production: number;
  };
  maintenanceData: Record<string, any> | null;
  attachments: string[];
  isAutomated: boolean;
  aiConfidence: number | null;
  performedBy: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  team: {
    id: string;
    name: string;
    code: string;
  } | null;
  }
  