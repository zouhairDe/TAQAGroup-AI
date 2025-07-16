# Maintenance Actions Tab Implementation Guide

## Overview
The Maintenance Actions tab in the anomaly details page provides a comprehensive workflow management system for tracking and managing maintenance activities related to anomalies. This document outlines the requirements for backend implementation.

## Current Status
- **Frontend**: Maintenance tab exists with comprehensive workflow interface (`MaintenanceWorkflow`)
- **Backend**: Not implemented - requires complete database schema and API development
- **Integration**: Ready to connect once backend is available

## Key Features Integration

### 1. Timeline/Chronologie Tab
The timeline tab should display a chronological view of all maintenance action events:
- **Action Creation**: When each maintenance action was created
- **Status Changes**: All status transitions with timestamps (planned → scheduled → in_progress → completed)
- **Time Entries**: Start/stop times for each work session
- **Progress Updates**: Milestone completions and progress reports
- **Comments**: All comments and communications in chronological order
- **Quality Checks**: Verification and approval timestamps
- **Attachments**: When documents/photos were uploaded

**Timeline Data Sources:**
- `MaintenanceAction.createdAt`, `actualStartDate`, `actualEndDate`, `completedAt`
- `MaintenanceTimeEntry.startTime`, `endTime`
- `MaintenanceProgressUpdate.createdAt`
- `MaintenanceComment.createdAt`, `updatedAt`
- `MaintenanceAttachment.uploadedAt`
- `statusHistory` JSON field for detailed status change tracking

### 2. REX Integration for Attachments
Attachments in maintenance actions should be synchronized with the REX (Return of Experience) system:
- **Shared Repository**: Documents uploaded to maintenance actions should be accessible in the corresponding REX entry
- **Cross-Reference**: Link maintenance action attachments to REX case studies
- **Learning Integration**: Photos and reports from maintenance should feed into REX knowledge base
- **Best Practices**: Successful maintenance procedures should be captured in REX for future reference

**REX-Maintenance Integration:**
- When anomaly is resolved, maintenance attachments should be copied/linked to REX entry
- REX should reference successful maintenance procedures for similar anomalies
- Maintenance reports should contribute to REX analysis and recommendations

## Database Schema Requirements

### 1. MaintenanceAction Model

```prisma
model MaintenanceAction {
  id                    String   @id @default(cuid())
  code                  String   @unique // MA-2024-001
  title                 String
  description           String
  anomalyId             String
  equipmentId           String
  
  // Action Details
  actionType            String   // preventive, corrective, emergency, inspection
  category              String   // mechanical, electrical, hydraulic, instrumentation, control
  priority              String   // P1, P2, P3, P4 (inherited from anomaly)
  
  // Planning & Scheduling
  plannedStartDate      DateTime?
  plannedEndDate        DateTime?
  estimatedDuration     Int?     // in hours
  actualStartDate       DateTime?
  actualEndDate         DateTime?
  actualDuration        Int?     // in hours
  
  // Status Management
  status                String   @default("planned") // planned, scheduled, in_progress, paused, completed, cancelled
  statusHistory         Json?    // Array of status changes with timestamps
  
  // Assignment
  assignedToId          String?  // Primary technician
  assignedTeamId        String?
  supervisorId          String?
  
  // Work Details
  workInstructions      String?
  safetyPrecautions     String[]
  requiredTools         String[]
  requiredParts         Json?    // Array of parts with quantities
  workCompleted         String?  // Description of work performed
  
  // Quality & Verification
  qualityCheckRequired  Boolean  @default(false)
  qualityCheckPassed    Boolean?
  qualityCheckedById    String?
  qualityCheckedAt      DateTime?
  verificationNotes     String?
  
  // Impact Assessment
  downtimeRequired      Boolean  @default(false)
  plannedDowntimeHours  Float?
  actualDowntimeHours   Float?
  productionImpact      String?  // none, low, medium, high, critical
  
  // Costs
  estimatedCost         Float?
  actualCost           Float?
  partsCost            Float?
  laborCost            Float?
  
  // Compliance
  permitRequired        Boolean  @default(false)
  permitNumber          String?
  permitValidUntil      DateTime?
  complianceNotes       String?
  
  // Audit
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  createdById           String
  completedById         String?
  completedAt           DateTime?
  
  // Relationships
  anomaly               Anomaly           @relation(fields: [anomalyId], references: [id], onDelete: Cascade)
  equipment             Equipment         @relation(fields: [equipmentId], references: [id])
  assignedTo            User?             @relation("AssignedTechnician", fields: [assignedToId], references: [id])
  assignedTeam          Team?             @relation(fields: [assignedTeamId], references: [id])
  supervisor            User?             @relation("Supervisor", fields: [supervisorId], references: [id])
  createdBy             User              @relation("CreatedBy", fields: [createdById], references: [id])
  completedBy           User?             @relation("CompletedBy", fields: [completedById], references: [id])
  qualityCheckedBy      User?             @relation("QualityChecker", fields: [qualityCheckedById], references: [id])
  timeEntries           MaintenanceTimeEntry[]
  progressUpdates       MaintenanceProgressUpdate[]
  attachments           MaintenanceAttachment[]
  comments              MaintenanceComment[]
  
  @@map("maintenance_actions")
  @@index([anomalyId])
  @@index([equipmentId])
  @@index([status])
  @@index([assignedToId])
  @@index([plannedStartDate])
  @@index([createdAt])
}
```

### 2. MaintenanceTimeEntry Model

```prisma
model MaintenanceTimeEntry {
  id                    String   @id @default(cuid())
  maintenanceActionId   String
  technicianId          String
  startTime             DateTime
  endTime               DateTime?
  duration              Int?     // in minutes
  workDescription       String
  breakTime             Int?     // in minutes
  createdAt             DateTime @default(now())
  
  // Relationships
  maintenanceAction     MaintenanceAction @relation(fields: [maintenanceActionId], references: [id], onDelete: Cascade)
  technician            User              @relation(fields: [technicianId], references: [id])
  
  @@map("maintenance_time_entries")
  @@index([maintenanceActionId])
  @@index([technicianId])
  @@index([startTime])
}
```

### 3. MaintenanceProgressUpdate Model

```prisma
model MaintenanceProgressUpdate {
  id                    String   @id @default(cuid())
  maintenanceActionId   String
  updateById            String
  progressPercentage    Int      // 0-100
  statusUpdate          String?
  workCompleted         String
  issuesEncountered     String?
  nextSteps             String?
  estimatedCompletion   DateTime?
  createdAt             DateTime @default(now())
  
  // Relationships
  maintenanceAction     MaintenanceAction @relation(fields: [maintenanceActionId], references: [id], onDelete: Cascade)
  updatedBy             User              @relation(fields: [updateById], references: [id])
  
  @@map("maintenance_progress_updates")
  @@index([maintenanceActionId])
  @@index([createdAt])
}
```

### 4. MaintenanceAttachment Model

```prisma
model MaintenanceAttachment {
  id                    String   @id @default(cuid())
  maintenanceActionId   String
  filename              String
  fileUrl               String
  fileType              String
  fileSize              Int
  description           String?
  attachmentType        String   // photo, document, checklist, report, drawing
  uploadedById          String
  uploadedAt            DateTime @default(now())
  
  // Relationships
  maintenanceAction     MaintenanceAction @relation(fields: [maintenanceActionId], references: [id], onDelete: Cascade)
  uploadedBy            User              @relation(fields: [uploadedById], references: [id])
  
  @@map("maintenance_attachments")
  @@index([maintenanceActionId])
  @@index([attachmentType])
}
```

### 5. MaintenanceComment Model

```prisma
model MaintenanceComment {
  id                    String   @id @default(cuid())
  maintenanceActionId   String
  content               String
  commentType           String   @default("general") // general, progress, issue, resolution, quality
  isInternal            Boolean  @default(false) // true for internal team comments, false for client-visible
  authorId              String
  replyToId             String?  // For threaded comments
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  editedAt              DateTime?
  isEdited              Boolean  @default(false)
  
  // Relationships
  maintenanceAction     MaintenanceAction @relation(fields: [maintenanceActionId], references: [id], onDelete: Cascade)
  author                User              @relation(fields: [authorId], references: [id])
  replyTo               MaintenanceComment? @relation("CommentReplies", fields: [replyToId], references: [id])
  replies               MaintenanceComment[] @relation("CommentReplies")
  
  @@map("maintenance_comments")
  @@index([maintenanceActionId])
  @@index([authorId])
  @@index([createdAt])
  @@index([commentType])
}
```

### 6. Update Existing Models

#### Add to Anomaly Model:
```prisma
// Add to existing Anomaly model
maintenanceActions    MaintenanceAction[]
```

#### Add to Equipment Model:
```prisma
// Add to existing Equipment model
maintenanceActions    MaintenanceAction[]
```

#### Add to User Model:
```prisma
// Add to existing User model
assignedMaintenanceActions    MaintenanceAction[] @relation("AssignedTechnician")
supervisedMaintenanceActions  MaintenanceAction[] @relation("Supervisor")
createdMaintenanceActions     MaintenanceAction[] @relation("CreatedBy")
completedMaintenanceActions   MaintenanceAction[] @relation("CompletedBy")
qualityCheckedActions         MaintenanceAction[] @relation("QualityChecker")
timeEntries                   MaintenanceTimeEntry[]
progressUpdates               MaintenanceProgressUpdate[]
maintenanceAttachments        MaintenanceAttachment[]
maintenanceComments           MaintenanceComment[]
```

## API Endpoints Required

### 1. Maintenance Actions CRUD

```typescript
// GET /api/v1/anomalies/:anomalyId/maintenance-actions
// Get all maintenance actions for an anomaly
interface GetMaintenanceActionsResponse {
  success: boolean;
  data: MaintenanceAction[];
  meta: {
    total: number;
    completed: number;
    inProgress: number;
    planned: number;
  };
}

// POST /api/v1/anomalies/:anomalyId/maintenance-actions
// Create new maintenance action
interface CreateMaintenanceActionRequest {
  title: string;
  description: string;
  actionType: string;
  category: string;
  equipmentId: string;
  assignedToId?: string;
  assignedTeamId?: string;
  plannedStartDate?: Date;
  plannedEndDate?: Date;
  estimatedDuration?: number;
  workInstructions?: string;
  safetyPrecautions?: string[];
  requiredTools?: string[];
  requiredParts?: any[];
  downtimeRequired?: boolean;
  plannedDowntimeHours?: number;
  permitRequired?: boolean;
}

// PUT /api/v1/maintenance-actions/:id
// Update maintenance action
interface UpdateMaintenanceActionRequest {
  title?: string;
  description?: string;
  status?: string;
  assignedToId?: string;
  actualStartDate?: Date;
  actualEndDate?: Date;
  workCompleted?: string;
  actualCost?: number;
  qualityCheckPassed?: boolean;
  // ... other updateable fields
}

// DELETE /api/v1/maintenance-actions/:id
// Delete maintenance action (soft delete recommended)
```

### 2. Status Management

```typescript
// POST /api/v1/maintenance-actions/:id/status
// Update maintenance action status
interface UpdateStatusRequest {
  status: 'planned' | 'scheduled' | 'in_progress' | 'paused' | 'completed' | 'cancelled';
  notes?: string;
  updatedById: string;
}

// GET /api/v1/maintenance-actions/:id/status-history
// Get status change history
interface StatusHistoryResponse {
  success: boolean;
  data: Array<{
    status: string;
    changedAt: Date;
    changedBy: string;
    notes?: string;
  }>;
}
```

### 3. Time Tracking

```typescript
// POST /api/v1/maintenance-actions/:id/time-entries
// Start/Stop time tracking
interface TimeEntryRequest {
  technicianId: string;
  action: 'start' | 'stop' | 'pause';
  workDescription?: string;
  breakTime?: number;
}

// GET /api/v1/maintenance-actions/:id/time-entries
// Get time entries for maintenance action
interface TimeEntriesResponse {
  success: boolean;
  data: MaintenanceTimeEntry[];
  totalHours: number;
  totalCost: number;
}
```

### 4. Progress Updates

```typescript
// POST /api/v1/maintenance-actions/:id/progress
// Add progress update
interface ProgressUpdateRequest {
  progressPercentage: number;
  workCompleted: string;
  issuesEncountered?: string;
  nextSteps?: string;
  estimatedCompletion?: Date;
  updateById: string;
}

// GET /api/v1/maintenance-actions/:id/progress
// Get progress history
interface ProgressHistoryResponse {
  success: boolean;
  data: MaintenanceProgressUpdate[];
  currentProgress: number;
  estimatedCompletion?: Date;
}
```

### 5. File Attachments

```typescript
// POST /api/v1/maintenance-actions/:id/attachments
// Upload attachment
interface UploadAttachmentRequest {
  file: File;
  description?: string;
  attachmentType: 'photo' | 'document' | 'checklist' | 'report' | 'drawing';
  uploadedById: string;
}

// GET /api/v1/maintenance-actions/:id/attachments
// Get all attachments
interface AttachmentsResponse {
  success: boolean;
  data: MaintenanceAttachment[];
}
```

### 6. Comments Management

```typescript
// POST /api/v1/maintenance-actions/:id/comments
// Add comment to maintenance action
interface CreateCommentRequest {
  content: string;
  commentType?: 'general' | 'progress' | 'issue' | 'resolution' | 'quality';
  isInternal?: boolean;
  authorId: string;
  replyToId?: string; // For threaded replies
}

// GET /api/v1/maintenance-actions/:id/comments
// Get all comments for maintenance action
interface CommentsResponse {
  success: boolean;
  data: MaintenanceComment[];
  meta: {
    total: number;
    threaded: boolean; // true if comments are organized in threads
  };
}

// PUT /api/v1/maintenance-actions/comments/:commentId
// Update comment (only by author within edit window)
interface UpdateCommentRequest {
  content: string;
  editedAt: Date;
}

// DELETE /api/v1/maintenance-actions/comments/:commentId
// Delete comment (soft delete recommended)
interface DeleteCommentResponse {
  success: boolean;
  message: string;
}

// GET /api/v1/maintenance-actions/:id/comments/summary
// Get comment summary and statistics
interface CommentSummaryResponse {
  success: boolean;
  data: {
    totalComments: number;
    commentsByType: Record<string, number>;
    recentComments: MaintenanceComment[];
    lastCommentAt?: Date;
    hasUnreadComments: boolean;
  };
}
```

### 7. Timeline/Chronologie Management

```typescript
// GET /api/v1/maintenance-actions/:id/timeline
// Get chronological timeline of all maintenance action events
interface TimelineResponse {
  success: boolean;
  data: Array<{
    id: string;
    eventType: 'creation' | 'status_change' | 'time_entry' | 'progress_update' | 'comment' | 'attachment' | 'quality_check';
    timestamp: Date;
    description: string;
    actorId: string;
    actorName: string;
    actorRole: string;
    details: {
      // Event-specific details
      previousStatus?: string;
      newStatus?: string;
      progressPercentage?: number;
      attachmentType?: string;
      commentType?: string;
      timeEntryType?: 'start' | 'stop' | 'pause';
      qualityResult?: boolean;
    };
    relatedEntityId?: string; // ID of comment, attachment, etc.
  }>;
  meta: {
    totalEvents: number;
    dateRange: {
      start: Date;
      end: Date;
    };
    eventTypes: Record<string, number>;
  };
}

// GET /api/v1/anomalies/:anomalyId/maintenance-timeline
// Get comprehensive timeline for all maintenance actions of an anomaly
interface AnomalyMaintenanceTimelineResponse {
  success: boolean;
  data: {
    anomalyId: string;
    maintenanceActions: Array<{
      actionId: string;
      actionTitle: string;
      events: TimelineEvent[];
    }>;
    overallProgress: number;
    totalDuration: number; // in hours
    startDate: Date;
    endDate?: Date;
    isCompleted: boolean;
  };
}
```

### 8. REX Integration for Attachments

```typescript
// POST /api/v1/maintenance-actions/:id/attachments/sync-to-rex
// Sync maintenance attachments to REX system for the related anomaly
interface SyncToRexRequest {
  rexCaseId?: string; // If REX case already exists
  includeAttachmentTypes?: string[]; // Filter which attachment types to sync
  addToKnowledgeBase?: boolean; // Whether to add to REX knowledge base
  syncedById: string;
}

interface SyncToRexResponse {
  success: boolean;
  data: {
    rexCaseId: string;
    syncedAttachments: Array<{
      maintenanceAttachmentId: string;
      rexAttachmentId: string;
      filename: string;
      syncedAt: Date;
    }>;
    skippedAttachments: Array<{
      maintenanceAttachmentId: string;
      reason: string;
    }>;
  };
  message: string;
}

// GET /api/v1/anomalies/:anomalyId/rex-attachments
// Get all REX attachments related to an anomaly's maintenance actions
interface RexAttachmentsResponse {
  success: boolean;
  data: {
    rexCaseId?: string;
    attachments: Array<{
      id: string;
      filename: string;
      attachmentType: string;
      source: 'maintenance' | 'rex' | 'analysis';
      originalMaintenanceActionId?: string;
      uploadedAt: Date;
      uploadedBy: string;
      description?: string;
      url: string;
      isSharedWithMaintenance: boolean;
    }>;
    knowledgeBaseEntries: Array<{
      id: string;
      title: string;
      description: string;
      attachmentIds: string[];
      relevanceScore: number;
    }>;
  };
}

// POST /api/v1/rex/:rexCaseId/link-maintenance-action
// Link a REX case to maintenance actions for knowledge sharing
interface LinkMaintenanceToRexRequest {
  maintenanceActionIds: string[];
  linkType: 'reference' | 'solution' | 'best_practice' | 'lesson_learned';
  notes?: string;
  linkedById: string;
}

// GET /api/v1/maintenance-actions/:id/rex-recommendations
// Get REX recommendations based on similar maintenance actions
interface RexRecommendationsResponse {
  success: boolean;
  data: {
    similarCases: Array<{
      rexCaseId: string;
      anomalyType: string;
      equipmentType: string;
      solution: string;
      successRate: number;
      averageDuration: number;
      estimatedCost: number;
      attachments: string[];
      confidence: number; // 0-100%
    }>;
    bestPractices: Array<{
      title: string;
      description: string;
      steps: string[];
      toolsRequired: string[];
      safetyNotes: string[];
      source: string; // REX case ID or reference
    }>;
    lessonsLearned: Array<{
      issue: string;
      solution: string;
      prevention: string;
      source: string;
    }>;
  };
}
```

## Business Logic Requirements

### 1. Status Workflow
```
planned → scheduled → in_progress → completed
    ↓         ↓           ↓
cancelled  cancelled   paused → in_progress
```

### 2. Automatic Actions
- When anomaly is created with high/critical priority → auto-create maintenance action
- When maintenance action is completed → update anomaly status to "under_review"
- When all maintenance actions completed → allow anomaly closure
- Send notifications for overdue actions
- Calculate SLA compliance based on completion times

### 3. Validation Rules
- Cannot delete maintenance action if status is "in_progress"
- Cannot change status to "completed" without quality check (if required)
- Actual end date must be after actual start date
- Progress percentage must be 0-100
- Cost fields must be positive numbers
- **Comments cannot be empty or exceed 2000 characters**
- **Comments can only be edited within 15 minutes of creation**
- **Reply comments must reference valid parent comments**

### 4. Permissions
- Only assigned technician can update progress
- Only supervisor can approve completion
- Only admin can delete maintenance actions
- Quality checker can only update quality fields
- Comments: Authors can edit/delete their own comments within 15 minutes
- Internal comments visible only to team members
- Public comments visible to all stakeholders

## Frontend Integration Points

### 1. MaintenanceWorkflow Component
```typescript
// Current component location: /components/maintenance/MaintenanceWorkflow.tsx
interface MaintenanceWorkflowProps {
  anomalyId: string;
  onWorkflowUpdate: (workflow: any) => void;
}

// Component should display:
// - List of maintenance actions with status
// - Progress tracking (percentage completion)
// - Time tracking interface
// - Status update buttons
// - File upload for attachments
// - Comment section for each maintenance action
// - Progress updates with threaded discussions
// - Cost tracking summary
// - Comment filtering by type (general, progress, issues, etc.)
```

### 2. Expected API Calls
```typescript
// Component will make these API calls:
const maintenanceActions = await fetch(`/api/v1/anomalies/${anomalyId}/maintenance-actions`);
const progressData = await fetch(`/api/v1/maintenance-actions/${actionId}/progress`);
const timeEntries = await fetch(`/api/v1/maintenance-actions/${actionId}/time-entries`);
const comments = await fetch(`/api/v1/maintenance-actions/${actionId}/comments`);
const commentSummary = await fetch(`/api/v1/maintenance-actions/${actionId}/comments/summary`);
const timeline = await fetch(`/api/v1/maintenance-actions/${actionId}/timeline`);
const rexRecommendations = await fetch(`/api/v1/maintenance-actions/${actionId}/rex-recommendations`);
```

### 3. Timeline Tab Implementation
```typescript
// Component structure for timeline tab:
interface MaintenanceTimelineProps {
  maintenanceActionId: string;
  showAllEvents?: boolean;
}

// Timeline should display:
// - Chronological list of all events (creation, status changes, comments, attachments)
// - Visual timeline with time markers
// - Event type icons and color coding
// - Actor information (who performed each action)
// - Expandable event details
// - Filter by event type
// - Search functionality for timeline events

// Timeline data transformation:
const timelineEvents = await fetch(`/api/v1/maintenance-actions/${actionId}/timeline`);
// Display events in chronological order with visual timeline UI
```

### 4. REX Attachments Integration
```typescript
// Component structure for REX integration:
interface MaintenanceAttachmentsProps {
  maintenanceActionId: string;
  anomalyId: string;
  canSyncToRex: boolean;
}

// Attachments section should:
// - Show maintenance action attachments
// - Display linked REX attachments
// - Provide "Sync to REX" functionality
// - Show REX recommendations based on similar cases
// - Link to related REX knowledge base entries

// REX integration calls:
const rexAttachments = await fetch(`/api/v1/anomalies/${anomalyId}/rex-attachments`);
const syncResult = await fetch(`/api/v1/maintenance-actions/${actionId}/attachments/sync-to-rex`, {
  method: 'POST',
  body: JSON.stringify(syncRequest)
});
```

## Implementation Priority

### Phase 1 (MVP)
1. Basic MaintenanceAction model with CRUD operations
2. Status management (planned → in_progress → completed)
3. Assignment to technicians
4. Basic progress tracking
5. **Comment system for each maintenance action**
6. **Basic timeline showing action status changes**

### Phase 2 (Enhanced)
1. Time tracking with start/stop functionality
2. File attachments
3. Progress updates with photos
4. Cost tracking
5. **Threaded comments and comment types**
6. **Internal vs public comment visibility**
7. **Comprehensive timeline with all events (comments, attachments, progress)**
8. **Basic REX attachment linking**

### Phase 3 (Advanced)
1. Quality checks and approvals
2. Advanced reporting and analytics
3. Integration with maintenance scheduling systems
4. Mobile app support for technicians
5. **Comment notifications and real-time updates**
6. **Comment search and filtering**
7. **Full REX integration with knowledge base recommendations**
8. **Automated REX case creation from completed maintenance actions**
9. **Timeline analytics and performance insights**
10. **REX-based maintenance procedure recommendations**

## Testing Requirements

### 1. Unit Tests
- CRUD operations for all models
- Status transition validation
- Business logic validation
- Permission checks
- **Comment creation, editing, and deletion**
- **Threaded comment structure validation**

### 2. Integration Tests
- End-to-end workflow from anomaly creation to maintenance completion
- API endpoint testing
- File upload/download functionality
- **Comment system integration with maintenance actions**
- **Real-time comment updates and notifications**

### 3. Performance Tests
- Large dataset handling (1000+ maintenance actions)
- Concurrent user access
- File upload performance
- **Comment loading with large thread volumes**
- **Comment search and filtering performance**

## Security Considerations

1. **File Upload Security**: Validate file types, scan for malware, limit file sizes
2. **Access Control**: Implement role-based permissions for different actions
3. **Audit Trail**: Log all changes with user identification and timestamps
4. **Data Validation**: Sanitize all input data to prevent SQL injection
5. **API Rate Limiting**: Prevent abuse of API endpoints

## Monitoring and Alerts

1. **SLA Monitoring**: Alert when maintenance actions are overdue
2. **Cost Tracking**: Alert when actual costs exceed estimates by X%
3. **Quality Issues**: Alert supervisors when quality checks fail
4. **Performance Metrics**: Track average completion times and success rates

## Migration Strategy

1. **Database Migration**: Create new tables without affecting existing anomaly data
2. **Gradual Rollout**: Start with read-only maintenance action viewing
3. **Data Import**: Import existing maintenance data if available
4. **User Training**: Provide documentation and training for new workflow

---

## Frontend Comment Interface

### Expected Comment Component Structure

```typescript
interface CommentSectionProps {
  maintenanceActionId: string;
  currentUserId: string;
  userRole: string;
}

interface CommentItemProps {
  comment: MaintenanceComment;
  onReply: (commentId: string, content: string) => void;
  onEdit: (commentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
  canEdit: boolean;
  canDelete: boolean;
  showInternalBadge?: boolean;
}

// Comment display features:
// - Threaded replies with visual indentation
// - Comment type badges (progress, issue, resolution, etc.)
// - Internal/external visibility indicators
// - Edit/delete actions (time-limited)
// - Reply functionality
// - Real-time updates (WebSocket or polling)
// - Comment filtering by type
// - Pagination for large comment volumes
```

## Quick Start for Backend Developer

1. **Add the database models** to your Prisma schema (including MaintenanceComment)
2. **Run migration**: `npx prisma migrate dev`
3. **Implement basic CRUD** endpoints for MaintenanceAction
4. **Implement comment endpoints** for maintenance actions
5. **Test with Postman** or similar tool (include comment scenarios)
6. **Update frontend** MaintenanceWorkflow component to use real API
7. **Add business logic** for status transitions and validations
8. **Implement comment permissions and edit time limits**

For questions or clarifications, please refer to the existing anomaly implementation patterns in the codebase. 