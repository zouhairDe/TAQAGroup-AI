# TAQA Morocco - Application Flow & Structure Guide

> Complete technical documentation of the Industrial Anomaly Management System architecture, user flows, and implementation structure.

## 📋 Table of Contents

- [Application Architecture Overview](#-application-architecture-overview)
- [User Roles & Permissions](#-user-roles--permissions)
- [Core Application Flow](#-core-application-flow)
- [Detailed User Journeys](#-detailed-user-journeys)
- [Technical System Architecture](#-technical-system-architecture)
- [Database Schema Design](#-database-schema-design)
- [API Structure & Endpoints](#-api-structure--endpoints)
- [Frontend Component Structure](#-frontend-component-structure)
- [Integration Points](#-integration-points)
- [Security & Authentication Flow](#-security--authentication-flow)
- [Bonus Features Implementation](#-bonus-features-implementation)

## 🏗️ Application Architecture Overview

### **Unified Web/Mobile System Architecture**
```
┌─────────────────────────────────────────────────────────────┐
│                 TAQA Anomaly Manager                        │
│            (Single Next.js Application)                     │
├─────────────────────────────────────────────────────────────┤
│  🖥️ Desktop Experience    │  📱 Mobile Experience (PWA)    │
│  ├── Manager Dashboard    │  ├── Technician Interface      │
│  ├── Admin Panel          │  ├── Voice Commands            │
│  ├── Analytics & Reports  │  ├── Camera Integration        │
│  └── Bulk Operations      │  └── Offline Sync              │
├─────────────────────────────────────────────────────────────┤
│               🔄 Shared Application Layer                   │
│  ├── Next.js App Router   ├── Tailwind CSS                │
│  ├── TypeScript           ├── React Query                 │
│  ├── Zustand State        └── PWA Service Worker          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Backend API   │    │   Database      │    │   ML Engine     │
│   (Fastify)     │◄──►│   (PostgreSQL)  │◄──►│   (Flask)       │
│   WebSockets    │    │   Prisma ORM    │    │   scikit-learn  │
│   File Upload   │    │   Redis Cache   │    │   Predictions   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ External APIs   │    │  File Storage   │    │ Real-time Comms │
│ Oracle/Maximo   │    │ Images/Videos   │    │ Push Notifications│
│ IoT Sensors     │    │ Documents       │    │ WebSocket Events│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Application Layers & Implementation Strategy**

#### **🔄 Unified Frontend Architecture**
1. **Responsive Presentation Layer**: Next.js 14 with App Router
   - **Desktop Components**: Complex dashboards, data tables, advanced filtering
   - **Mobile Components**: Touch-optimized, voice-enabled, camera-integrated
   - **Shared Components**: Forms, modals, notifications, status indicators
   - **PWA Layer**: Service workers, offline sync, push notifications

2. **Device Detection & Adaptation**:
   ```typescript
   // Automatic experience switching
   const isMobile = useMediaQuery('(max-width: 768px)');
   const userAgent = useUserAgent();
   const capabilities = useDeviceCapabilities(); // Camera, GPS, Voice
   ```

#### **🔧 Backend & Infrastructure**
3. **API Layer**: Fastify REST API with WebSocket support
4. **Business Logic Layer**: Role-based services and anomaly lifecycle management
5. **Data Access Layer**: Prisma ORM with PostgreSQL + Redis caching
6. **Integration Layer**: Oracle/Maximo connectors + IoT sensor processing
7. **AI/ML Layer**: Flask microservice for predictions and classification

#### **📱 Progressive Web App (PWA) Features**
- **Offline-First**: Critical functionality works without internet
- **App-like Experience**: Add to home screen, splash screen, app icons
- **Native Device Access**: Camera, microphone, GPS, vibration, notifications
- **Background Sync**: Queue actions when offline, sync when online
- **Push Notifications**: Real-time alerts for critical anomalies

## 👥 User Roles & Permissions

### **Role Hierarchy**
```
Admin (Full Access)
├── System Configuration
├── User Management
├── Data Import/Export
├── Analytics & Reporting
└── Archive Management

Manager (Oversight & Planning)
├── All Anomaly Operations
├── Team Assignment
├── Analytics Dashboard
├── Maintenance Planning
└── REX Review

Technician (Field Operations)
├── Assigned Anomalies
├── Status Updates
├── REX Input
└── Mobile Interface
```

### **Permission Matrix**
| Feature | Admin | Manager | Technician |
|---------|-------|---------|------------|
| Create Anomaly | ✅ | ✅ | ✅ |
| Edit Any Anomaly | ✅ | ✅ | ❌ |
| Edit Assigned Anomaly | ✅ | ✅ | ✅ |
| Delete Anomaly | ✅ | ✅ | ❌ |
| Assign Technicians | ✅ | ✅ | ❌ |
| View Analytics | ✅ | ✅ | 📊 Limited |
| System Configuration | ✅ | ❌ | ❌ |
| Data Import | ✅ | ✅ | ❌ |
| Archive Access | ✅ | ✅ | 🔍 Read-only |

## 🔄 Core Application Flow

### **Main Application Workflow**
```
┌─────────────┐
│   Login     │
│ & Auth      │
└─────┬───────┘
      │
      ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Dashboard  │◄──►│  Anomalies  │◄──►│ Maintenance │
│   Hub       │    │ Management  │    │  Planning   │
└─────┬───────┘    └─────┬───────┘    └─────┬───────┘
      │                  │                  │
      ▼                  ▼                  ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Analytics & │    │    REX      │    │ System      │
│  Reports    │    │ Management  │    │ Settings    │
└─────────────┘    └─────────────┘    └─────────────┘
```

### **Enhanced Anomaly Lifecycle Flow**
```
┌─────────────┐
│    NEW      │ ← Initial Creation (Manual/IoT/Import)
└─────┬───────┘
      │ AI/Manual Criticality Assessment
      ▼
┌─────────────┐
│ CLASSIFIED  │ ← Risk Level & Priority Set
└─────┬───────┘
      │ Smart Assignment Algorithm
      ▼
┌─────────────┐
│  ASSIGNED   │ ← Technician/Team Assigned
└─────┬───────┘
      │ Work Acceptance & Planning
      ▼
┌─────────────┐
│IN PROGRESS  │ ← Active Work, Updates & Comments
└─────┬───────┘
      │ Work Completion Reported
      ▼
┌─────────────┐
│UNDER REVIEW │ ← Quality Check & Verification
└─────┬───────┘
      │ Supervisor Approval
      ▼
┌─────────────┐
│  RESOLVED   │ ← Solution Confirmed
└─────┬───────┘
      │ Mandatory REX Process
      ▼
┌─────────────┐
│REX COMPLETE │ ← Knowledge Captured & Approved
└─────┬───────┘
      │ Auto-archive after retention period
      ▼
┌─────────────┐
│  ARCHIVED   │ ← Historical Reference & Analytics
└─────────────┘

Flow Enhancements:
├── Escalation Paths (any stage can escalate)
├── Parallel Workflows (multiple technicians)
├── Emergency Fast-Track (critical anomalies)
└── IoT Auto-Detection (sensor-triggered creation)
```

## 🚶‍♂️ Detailed User Journeys

### **👨‍🔧 Technician Journey (Mobile-First)**

#### **Daily Workflow**
```
1. Mobile Login
   ├── Biometric authentication (if available)
   └── Real-time sync with server

2. Dashboard View
   ├── Assigned anomalies (priority sorted)
   ├── New assignments notification
   ├── Urgent alerts
   └── Quick actions bar

3. Anomaly Investigation
   ├── Tap anomaly card
   ├── View full details
   ├── Check attachment/photos
   ├── Review history/comments
   └── Access equipment manuals

4. Field Work
   ├── Update status to "In Progress"
   ├── Add photos/videos
   ├── Record voice notes
   ├── Log work performed
   └── Request parts/resources

5. Resolution
   ├── Final status update
   ├── Completion photos
   ├── Time tracking
   ├── REX input
   └── Submit for review
```

#### **Mobile Interface Features**
- **Voice Commands**: "Update anomaly 123 to in progress"
- **Camera Integration**: Quick photo/video capture
- **QR Code Scanner**: Instant equipment identification
- **GPS Tagging**: Automatic location logging
- **Real-time Sync**: Instant updates across all devices

### **👨‍💼 Manager Journey (Desktop-Focused)**

#### **Strategic Overview Workflow**
```
1. Dashboard Landing
   ├── KPI overview cards
   ├── Critical anomalies alert
   ├── Team performance metrics
   └── Maintenance calendar view

2. Anomaly Management
   ├── Filter by equipment/site/team
   ├── Bulk operations
   ├── Assignment optimization
   ├── Priority adjustment
   └── Resource allocation

3. Planning Integration
   ├── Link anomalies to maintenance windows
   ├── Resource scheduling
   ├── Contractor coordination
   └── Budget impact analysis

4. Analytics & Reporting
   ├── Trend analysis
   ├── Performance benchmarking
   ├── Cost impact assessment
   ├── Predictive insights
   └── Executive reporting

5. Team Management
   ├── Workload balancing
   ├── Skill-based assignment
   ├── Performance tracking
   ├── Training needs assessment
   └── REX review and approval
```

### **⚙️ Admin Journey (System Management)**

#### **System Administration Workflow**
```
1. System Health Dashboard
   ├── Server performance
   ├── Database metrics
   ├── Integration status
   └── User activity logs

2. Data Management
   ├── Oracle/Maximo imports
   ├── Excel batch uploads
   ├── Data validation
   ├── Duplicate detection
   └── Archive management

3. User & Permission Management
   ├── User creation/modification
   ├── Role assignment
   ├── Access control
   ├── Session management
   └── Security monitoring

4. System Configuration
   ├── Criticality rules setup
   ├── Notification preferences
   ├── Integration settings
   ├── ML model tuning
   └── Backup management

5. Analytics & Insights
   ├── System usage analytics
   ├── Performance optimization
   ├── Cost analysis
   ├── ROI reporting
   └── Strategic planning support
```

## 🏗️ Technical System Architecture

### **Unified Frontend Architecture (Next.js PWA)**
```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/
│   │   ├── page.tsx              # Responsive dashboard
│   │   ├── desktop/              # Desktop-specific components
│   │   ├── mobile/               # Mobile-specific components
│   │   └── components/           # Shared components
│   ├── anomalies/
│   │   ├── page.tsx              # Responsive list view
│   │   ├── [id]/
│   │   │   ├── page.tsx          # Anomaly details (responsive)
│   │   │   ├── edit/             # Edit forms
│   │   │   └── mobile/           # Mobile-optimized views
│   │   ├── new/
│   │   │   ├── page.tsx          # Create form (responsive)
│   │   │   ├── mobile/           # Mobile quick-create
│   │   │   └── voice/            # Voice-enabled creation
│   │   └── components/
│   ├── maintenance/              # Maintenance scheduling
│   ├── analytics/                # Analytics dashboard
│   ├── rex/                      # Knowledge management
│   └── settings/                 # System configuration
├── components/
│   ├── ui/                       # Shared UI components
│   │   ├── Button.tsx            # Responsive button
│   │   ├── Modal.tsx             # Mobile-friendly modals
│   │   ├── DataTable.tsx         # Responsive tables
│   │   └── Charts/               # Responsive charts
│   ├── mobile/                   # Mobile-specific components
│   │   ├── VoiceInput.tsx        # Voice command interface
│   │   ├── CameraCapture.tsx     # Photo/video capture
│   │   ├── TouchNavigation.tsx   # Touch-optimized navigation
│   │   └── OfflineIndicator.tsx  # Offline status
│   ├── desktop/                  # Desktop-specific components
│   │   ├── AdvancedFilters.tsx   # Complex filtering
│   │   ├── BulkOperations.tsx    # Multi-select operations
│   │   └── DataGrids.tsx         # Complex data views
│   ├── forms/
│   │   ├── AnomalyForm.tsx       # Responsive form
│   │   ├── MobileAnomalyForm.tsx # Touch-optimized form
│   │   ├── REXForm.tsx           # Knowledge capture
│   │   └── validation/           # Form validation
│   └── layout/
│       ├── ResponsiveLayout.tsx  # Adaptive layout
│       ├── MobileNavigation.tsx  # Bottom navigation
│       ├── DesktopSidebar.tsx    # Side navigation
│       └── PWAInstallPrompt.tsx  # PWA installation
├── lib/
│   ├── auth.ts                   # Authentication logic
│   ├── api.ts                    # API client
│   ├── pwa.ts                    # PWA utilities
│   ├── offline.ts                # Offline functionality
│   ├── device.ts                 # Device detection
│   └── utils.ts                  # Shared utilities
├── hooks/
│   ├── useAnomalies.ts           # Anomaly data management
│   ├── useAuth.ts                # Authentication state
│   ├── useRealtime.ts            # WebSocket connections
│   ├── useDevice.ts              # Device capabilities
│   ├── useOffline.ts             # Offline state management
│   ├── useVoice.ts               # Voice command processing
│   ├── useCamera.ts              # Camera integration
│   └── useGeolocation.ts         # GPS functionality
├── types/
│   ├── anomaly.ts                # Anomaly data types
│   ├── user.ts                   # User and role types
│   ├── device.ts                 # Device capability types
│   └── api.ts                    # API response types
├── workers/
│   ├── sw.ts                     # Service worker
│   ├── offline-sync.ts           # Background sync
│   └── push-notifications.ts     # Push notification handler
└── public/
    ├── manifest.json             # PWA manifest
    ├── sw.js                     # Compiled service worker
    └── icons/                    # PWA icons (various sizes)
```

### **Backend Architecture (Fastify)**
```
src/
├── routes/
│   ├── auth.ts
│   ├── anomalies.ts
│   ├── maintenance.ts
│   ├── rex.ts
│   ├── analytics.ts
│   └── admin.ts
├── services/
│   ├── AuthService.ts
│   ├── AnomalyService.ts
│   ├── NotificationService.ts
│   ├── FileService.ts
│   └── IntegrationService.ts
├── middleware/
│   ├── auth.ts
│   ├── validation.ts
│   ├── errorHandler.ts
│   └── rateLimit.ts
├── models/
│   ├── User.ts
│   ├── Anomaly.ts
│   ├── Equipment.ts
│   └── REX.ts
├── integrations/
│   ├── OracleConnector.ts
│   ├── MaximoConnector.ts
│   └── ExcelProcessor.ts
├── utils/
│   ├── logger.ts
│   ├── email.ts
│   └── encryption.ts
└── config/
    ├── database.ts
    ├── redis.ts
    └── environment.ts
```

## 🗄️ Database Schema Design

### **Core Tables Structure**
```sql
-- Users and Authentication
users
├── id (UUID, Primary Key)
├── email (Unique)
├── password_hash
├── role (ENUM: admin, manager, technician)
├── first_name
├── last_name
├── phone
├── site_id (Foreign Key)
├── created_at
├── updated_at
└── last_login

-- Equipment and Assets
equipment
├── id (UUID, Primary Key)
├── name
├── type
├── model
├── serial_number
├── location
├── site_id
├── installation_date
├── warranty_expiry
├── specifications (JSONB)
├── created_at
└── updated_at

-- Anomalies (Main Entity)
anomalies
├── id (UUID, Primary Key)
├── title
├── description
├── type (ENUM: mechanical, electrical, safety, etc.)
├── criticality (ENUM: low, medium, high, critical)
├── status (ENUM: new, in_progress, resolved, archived)
├── equipment_id (Foreign Key)
├── reporter_id (Foreign Key to users)
├── assignee_id (Foreign Key to users)
├── origin (ENUM: manual, oracle, maximo, excel)
├── reported_at
├── started_at
├── resolved_at
├── estimated_cost
├── actual_cost
├── downtime_hours
├── safety_impact (Boolean)
├── environmental_impact (Boolean)
├── attachments (JSONB)
├── created_at
└── updated_at

-- Return of Experience
rex
├── id (UUID, Primary Key)
├── anomaly_id (Foreign Key)
├── lessons_learned (Text)
├── root_cause_analysis (Text)
├── preventive_actions (Text)
├── documentation_links (JSONB)
├── knowledge_tags (Text Array)
├── created_by (Foreign Key to users)
├── approved_by (Foreign Key to users)
├── created_at
└── updated_at

-- Maintenance Windows
maintenance_windows
├── id (UUID, Primary Key)
├── title
├── description
├── start_date
├── end_date
├── equipment_ids (UUID Array)
├── maintenance_type
├── status
├── created_by (Foreign Key to users)
├── created_at
└── updated_at

-- Comments and Updates
anomaly_comments
├── id (UUID, Primary Key)
├── anomaly_id (Foreign Key)
├── user_id (Foreign Key)
├── comment_type (ENUM: update, note, status_change)
├── content (Text)
├── attachments (JSONB)
├── created_at
└── updated_at

-- Change History (Audit Trail)
anomaly_history
├── id (UUID, Primary Key)
├── anomaly_id (Foreign Key)
├── user_id (Foreign Key)
├── field_changed
├── old_value
├── new_value
├── change_reason
├── created_at
└── ip_address
```

### **Bonus Features Tables**
```sql
-- AI Predictions
ai_predictions
├── id (UUID, Primary Key)
├── equipment_id (Foreign Key)
├── prediction_type (ENUM: failure, maintenance_needed)
├── confidence_score (Decimal)
├── predicted_date
├── factors (JSONB)
├── model_version
├── created_at
└── status (ENUM: pending, confirmed, dismissed)

-- Blockchain Audit Trail
blockchain_records
├── id (UUID, Primary Key)
├── anomaly_id (Foreign Key)
├── block_hash
├── previous_hash
├── transaction_data (JSONB)
├── timestamp
└── verification_status

-- Gamification
user_achievements
├── id (UUID, Primary Key)
├── user_id (Foreign Key)
├── achievement_type
├── achievement_data (JSONB)
├── points_earned
├── earned_at
└── badge_level
```

## 🔌 API Structure & Endpoints

### **Authentication Endpoints**
```typescript
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/auth/profile
PUT  /api/auth/profile
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

### **Anomaly Management Endpoints**
```typescript
// CRUD Operations
GET    /api/anomalies              // List with filters
POST   /api/anomalies              // Create new
GET    /api/anomalies/:id          // Get details
PUT    /api/anomalies/:id          // Update
DELETE /api/anomalies/:id          // Delete
PATCH  /api/anomalies/:id/status   // Status update

// Specialized Operations
POST   /api/anomalies/:id/assign   // Assign technician
POST   /api/anomalies/:id/comments // Add comment
GET    /api/anomalies/:id/history  // Change history
POST   /api/anomalies/:id/attachments // Upload files
GET    /api/anomalies/export       // Export data

// Bulk Operations
POST   /api/anomalies/bulk-update  // Bulk status update
POST   /api/anomalies/bulk-assign  // Bulk assignment
POST   /api/anomalies/import       // Import from Excel/Oracle
```

### **REX (Return of Experience) Endpoints**
```typescript
GET    /api/rex                    // List REX entries
POST   /api/rex                    // Create REX
GET    /api/rex/:id                // Get REX details
PUT    /api/rex/:id                // Update REX
GET    /api/rex/search             // Search knowledge base
POST   /api/rex/:id/approve        // Approve REX
```

### **Analytics & Reporting Endpoints**
```typescript
GET    /api/analytics/dashboard    // Dashboard KPIs
GET    /api/analytics/trends       // Trend analysis
GET    /api/analytics/performance  // Performance metrics
GET    /api/analytics/costs        // Cost analysis
POST   /api/reports/generate       // Generate custom report
GET    /api/reports/:id            // Download report
```

### **Bonus Feature Endpoints**
```typescript
// AI/ML Features
GET    /api/ai/predictions         // Equipment predictions
POST   /api/ai/classify            // Classify anomaly criticality
GET    /api/ai/insights            // AI-driven insights

// Voice Commands
POST   /api/voice/process          // Process voice command
GET    /api/voice/commands         // Available commands

// AR Features
GET    /api/ar/equipment/:id       // AR overlay data
POST   /api/ar/recognition         // Image recognition

// IoT Integration
POST   /api/iot/sensor-data        // Receive sensor data
GET    /api/iot/anomaly-triggers   // Auto-detected anomalies
```

## 🎨 Frontend Component Structure

### **Reusable UI Components**
```typescript
// Base Components
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger' | 'success';
  size: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  size: 'sm' | 'md' | 'lg' | 'xl';
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  pagination?: boolean;
  sorting?: boolean;
  filtering?: boolean;
  selection?: boolean;
}
```

### **Feature-Specific Components**
```typescript
// Anomaly Components
interface AnomalyCardProps {
  anomaly: Anomaly;
  onStatusChange: (id: string, status: AnomalyStatus) => void;
  onAssign: (id: string, userId: string) => void;
}

interface AnomalyFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<Anomaly>;
  onSubmit: (data: AnomalyFormData) => void;
  equipmentOptions: Equipment[];
}

interface CriticalityBadgeProps {
  level: 'low' | 'medium' | 'high' | 'critical';
  showIcon?: boolean;
}
```

### **Layout Components**
```typescript
interface DashboardLayoutProps {
  userRole: UserRole;
  notifications: Notification[];
  children: React.ReactNode;
}

interface MobileLayoutProps {
  syncStatus: 'syncing' | 'synced' | 'error';
  children: React.ReactNode;
}
```

## 🔗 Integration Points

### **External System Connectors**

#### **Oracle Integration**
```typescript
class OracleConnector {
  async fetchAnomalies(dateRange: DateRange): Promise<OracleAnomaly[]>
  async syncEquipmentData(): Promise<Equipment[]>
  async validateConnection(): Promise<boolean>
  async mapToStandardFormat(data: OracleAnomaly): Promise<Anomaly>
}
```

#### **Maximo Integration**
```typescript
class MaximoConnector {
  async getMaintenanceOrders(): Promise<MaintenanceOrder[]>
  async createWorkOrder(anomaly: Anomaly): Promise<WorkOrder>
  async updateWorkOrderStatus(id: string, status: string): Promise<void>
  async syncAssetHierarchy(): Promise<Asset[]>
}
```

#### **Excel Processing**
```typescript
class ExcelProcessor {
  async validateStructure(file: File): Promise<ValidationResult>
  async parseAnomalies(file: File): Promise<Anomaly[]>
  async generateTemplate(): Promise<Blob>
  async exportAnomalies(anomalies: Anomaly[]): Promise<Blob>
}
```

## 🔐 Security & Authentication Flow

### **Authentication Strategy**
```typescript
// JWT-based authentication with refresh tokens
interface AuthFlow {
  login: (credentials: LoginCredentials) => Promise<AuthResult>
  refreshToken: (refreshToken: string) => Promise<AuthResult>
  logout: (userId: string) => Promise<void>
  validateSession: (token: string) => Promise<User>
}

// Role-based access control
interface RBAC {
  checkPermission: (user: User, resource: string, action: string) => boolean
  getPermissions: (role: UserRole) => Permission[]
  enforcePermission: (permission: Permission) => Middleware
}
```

### **Security Measures**
- **JWT Tokens**: Short-lived access tokens with longer refresh tokens
- **Rate Limiting**: API endpoint protection against abuse
- **Data Encryption**: Sensitive data encrypted at rest and in transit
- **Audit Logging**: All user actions logged for compliance
- **File Upload Security**: Virus scanning and type validation
- **SQL Injection Prevention**: Parameterized queries only
- **XSS Protection**: Content Security Policy and input sanitization

## 🚀 Bonus Features Implementation

### **AI/ML Integration Architecture**
```python
# Flask Microservice for ML Operations
class AnomalyClassifier:
    def __init__(self, model_path: str):
        self.model = self.load_model(model_path)
    
    def predict_criticality(self, anomaly_data: dict) -> CriticalityPrediction:
        features = self.extract_features(anomaly_data)
        prediction = self.model.predict(features)
        confidence = self.model.predict_proba(features).max()
        return CriticalityPrediction(
            level=prediction,
            confidence=confidence,
            factors=self.get_feature_importance(features)
        )
    
    def predict_failure(self, equipment_data: dict) -> FailurePrediction:
        # Time series analysis for equipment failure prediction
        pass
```

### **Voice & AR Integration**
```typescript
// Voice Command Processing
class VoiceCommandProcessor {
  async processVoiceCommand(audioBlob: Blob): Promise<CommandResult>
  async executeCommand(command: ParsedCommand): Promise<ActionResult>
  async getAvailableCommands(userRole: UserRole): Promise<VoiceCommand[]>
}

// AR Features
class ARManager {
  async getEquipmentOverlay(equipmentId: string): Promise<AROverlayData>
  async processImageRecognition(imageBlob: Blob): Promise<RecognitionResult>
  async generateARInstructions(anomalyId: string): Promise<ARInstruction[]>
}
```

### **Real-time Features**
```typescript
// WebSocket implementation for real-time updates
class RealtimeManager {
  async subscribeToAnomalyUpdates(userId: string): Promise<void>
  async broadcastStatusChange(anomaly: Anomaly): Promise<void>
  async sendNotification(notification: Notification): Promise<void>
  async handleDisconnection(userId: string): Promise<void>
}
```

## 📊 Performance & Monitoring

### **Performance Targets**
- **Page Load Time**: < 2 seconds on 3G connection
- **API Response Time**: < 500ms for 95% of requests
- **Real-time Updates**: < 1 second for status changes
- **Search Performance**: < 100ms for text search
- **File Upload**: Support files up to 100MB

### **Monitoring & Analytics**
```typescript
interface PerformanceMetrics {
  responseTime: number;
  throughput: number;
  errorRate: number;
  userSatisfaction: number;
  systemUptime: number;
}

class MonitoringService {
  trackUserAction(action: string, metadata: object): void
  measureApiPerformance(endpoint: string, duration: number): void
  logError(error: Error, context: object): void
  generatePerformanceReport(): PerformanceReport
}
```

## 🚀 Deployment & DevOps

### **Environment Configuration**
```yaml
# Docker Compose for development
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
  
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/taqa
      - REDIS_URL=redis://redis:6379
  
  database:
    image: postgres:15
    environment:
      - POSTGRES_DB=taqa
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
  
  redis:
    image: redis:7-alpine
```

### **CI/CD Pipeline**
```yaml
# GitHub Actions workflow
name: Deploy TAQA App
on:
  push:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: npm test
      - name: Run linting
        run: npm run lint
  
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: |
          npm run build
          npm run deploy
```

---

## 🎯 Development Strategy: One Codebase, Multiple Experiences

### **📱 Responsive-First Development Approach**

#### **Week 1: Foundation & Responsive Core**
```bash
# Setup unified development environment
npx create-next-app@latest taqa-anomaly-manager --typescript --tailwind --app
cd taqa-anomaly-manager
npm install @headlessui/react @heroicons/react react-query zustand

# PWA setup
npm install next-pwa workbox-webpack-plugin
```

**Deliverables:**
1. ✅ **Responsive Authentication**: Login works on desktop and mobile
2. ✅ **Adaptive Layout**: Sidebar on desktop, bottom nav on mobile
3. ✅ **Basic Anomaly CRUD**: Forms adapt to screen size
4. ✅ **Device Detection**: Automatic experience switching

#### **Week 2: Mobile Enhancement & Core Features**
```typescript
// Mobile-specific functionality
import { useDeviceCapabilities } from '@/hooks/useDevice';
import { VoiceInput } from '@/components/mobile/VoiceInput';
import { CameraCapture } from '@/components/mobile/CameraCapture';

function CreateAnomalyPage() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { hasCamera, hasVoice } = useDeviceCapabilities();
  
  return isMobile ? <MobileAnomalyForm /> : <DesktopAnomalyForm />;
}
```

**Deliverables:**
1. ✅ **Mobile-Optimized Forms**: Touch-friendly, voice-enabled
2. ✅ **Camera Integration**: Photo/video capture for anomalies
3. ✅ **Voice Commands**: Basic voice-to-text functionality
4. ✅ **Lifecycle Management**: Status tracking across devices
5. ✅ **Real-time Sync**: WebSocket updates work on both platforms

#### **Week 3: Advanced Features & PWA**
```json
// manifest.json
{
  "name": "TAQA Anomaly Manager",
  "short_name": "TAQA",
  "theme_color": "#1e40af",
  "background_color": "#ffffff",
  "display": "standalone",
  "start_url": "/dashboard",
  "icons": [...]
}
```

**Deliverables:**
1. ✅ **PWA Installation**: Add to home screen functionality
2. ✅ **Offline Capabilities**: Core functions work without internet
3. ✅ **Push Notifications**: Critical anomaly alerts
4. ✅ **Advanced Analytics**: Responsive charts and dashboards
5. ✅ **REX System**: Knowledge capture optimized for each device

#### **Week 4: AI Integration & Demo Polish**
**Deliverables:**
1. 🚀 **AI Criticality Prediction**: Works seamlessly on mobile and desktop
2. 🚀 **IoT Simulation**: Real-time sensor data visualization
3. 🚀 **Voice Command Enhancement**: "Update anomaly 123 to resolved"
4. 🚀 **Demo Preparation**: Both mobile and desktop demo flows
5. 🚀 **Performance Optimization**: Sub-2-second load times

### **🔧 Technical Implementation Strategy**

#### **Shared Component Architecture**
```typescript
// components/ui/Button.tsx
interface ButtonProps {
  variant: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean; // Useful for mobile
  touch?: boolean; // Larger touch targets
}

// Responsive usage
<Button 
  size={isMobile ? 'lg' : 'md'}
  fullWidth={isMobile}
  touch={isMobile}
>
  Create Anomaly
</Button>
```

#### **Device-Adaptive Hooks**
```typescript
// hooks/useAdaptiveLayout.ts
export function useAdaptiveLayout() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');
  
  return {
    isMobile,
    isTablet,
    layoutMode: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
    navigationStyle: isMobile ? 'bottom' : 'sidebar',
    formLayout: isMobile ? 'stacked' : 'grid'
  };
}
```

#### **Progressive Enhancement Strategy**
```typescript
// Progressive feature detection
const features = {
  camera: 'mediaDevices' in navigator,
  geolocation: 'geolocation' in navigator,
  voiceInput: 'webkitSpeechRecognition' in window,
  pushNotifications: 'Notification' in window,
  serviceWorker: 'serviceWorker' in navigator
};

// Enhance experience based on capabilities
if (features.camera && isMobile) {
  return <CameraEnabledForm />;
}
```

### **🎭 Demo Strategy: Showcasing Both Experiences**

#### **Demo Flow Structure**
1. **Opening (2 min)**: Problem statement with TAQA context
2. **Desktop Demo (4 min)**: Manager dashboard, analytics, system overview
3. **Mobile Demo (4 min)**: Technician workflow, voice commands, camera
4. **Real-time Sync (2 min)**: Show updates flowing between devices
5. **AI Features (3 min)**: Predictions, IoT integration, smart insights

#### **Interactive Demo Setup**
```bash
# Demo environment setup
npm run build
npm start

# Open multiple browser windows
- Desktop: http://localhost:3000 (Manager view)
- Mobile: http://192.168.x.x:3000 (Technician on tablet)
- Admin: http://localhost:3000/admin (System overview)
```

#### **Demo Script Key Points**
- **"Same application, optimized for each user"**
- **Live mobile interaction**: Hand tablet to judge
- **Real-time updates**: Changes sync instantly
- **Voice commands**: "Create critical anomaly on Turbine 3"
- **Photo capture**: Instant anomaly documentation
- **Seamless handoff**: Start on mobile, continue on desktop

### **🏆 Winning Advantages of This Approach**

1. **Technical Excellence**: Modern, scalable architecture
2. **User-Centered Design**: Each role gets optimized experience
3. **Development Efficiency**: Single codebase, faster iteration
4. **Real-world Applicability**: Matches actual TAQA workflows
5. **Demo Impact**: Interactive, engaging presentation
6. **Future-Ready**: Foundation for advanced features

### **📊 Success Metrics**

**Technical KPIs:**
- ✅ Single codebase serving both experiences
- ✅ Sub-2-second load times on mobile networks
- ✅ 90+ PWA Lighthouse score
- ✅ Offline functionality for core features
- ✅ Real-time sync between devices

**User Experience KPIs:**
- ✅ Touch targets ≥44px on mobile
- ✅ Voice commands with 95% accuracy
- ✅ Camera integration in <3 taps
- ✅ Form completion 50% faster on mobile
- ✅ Manager dashboard information density optimized for desktop

---

*This comprehensive flow and structure guide ensures the development team has a clear roadmap for building the TAQA Morocco Industrial Anomaly Management System with all planned features and bonus capabilities.* 