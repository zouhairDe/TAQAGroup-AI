# TAQA Backend - API Endpoints Documentation

## 🏗️ Complete TAQA Management System API

This document provides complete documentation for all available API endpoints in the TAQA Backend system, which implements a comprehensive anomaly management platform with **Medallion Architecture** for data processing.

---

## 🔗 Base URL
```
http://10.30.249.128:3333/api/v1
```

---

## 🏥 Health Check Endpoints

### Basic Health Check
Check if the API is running.

```bash
curl "http://localhost:3333/api/v1/health"
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-06-24T13:59:37.930Z",
  "uptime": 66.557332212,
  "environment": "development"
}
```

### Detailed Health Check
Get detailed system health including database connectivity.

```bash
curl "http://localhost:3333/api/v1/health/detailed"
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-06-24T13:59:45.825Z",
  "uptime": 74.451697452,
  "environment": "development",
  "database": {
    "status": "connected",
    "connected": true
  },
  "memory": {
    "used": 17,
    "total": 19,
    "percentage": 90
  }
}
```

---

## 👥 User Management Endpoints

### Get All Users
Get all users with filtering and pagination.

```bash
curl "http://10.30.249.128:3333/api/v1/users"
```

**With filters:**
```bash
curl "http://10.30.249.128:3333/api/v1/users?page=1&limit=10&role=technician&isActive=true&search=hassan"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "cm123456",
      "email": "h.alami@taqa.ma",
      "name": "Hassan Alami",
      "role": "manager",
      "isActive": true,
      "createdAt": "2025-06-27T10:00:00.000Z",
      "updatedAt": "2025-06-27T10:00:00.000Z",
      "profile": {
        "phone": "+212612345678",
        "department": "Operations",
        "site": "Noor Ouarzazate"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 12,
    "totalPages": 2
  }
}
```

### Get User by ID
```bash
curl "http://10.30.249.128:3333/api/v1/users/cm123456"
```

### Create User by Manager/Admin (Enhanced)

**POST** `/api/v1/users/create-by-manager`

Creates a new user with full profile information. Only managers and admins can use this endpoint.

> **Note:** All API endpoints use the `/api/v1` prefix.

#### Request Body
```json
{
  "email": "john.doe@taqa.com",
  "fullName": "John Doe",
  "role": "technician",
  "password": "securePassword123",
  "phoneNumber": "+212 6 12 34 56 78",
  "department": "MAINTENANCE",
  "site": "NOOR_OUARZAZATE",
  "createdBy": "userId_of_manager_or_admin",
  "isActive": true
}
```

#### Field Descriptions
- `email`: User's email address (required, must be unique)
- `fullName`: User's full name (required, minimum 2 characters)
- `role`: User role (required, one of: "admin", "manager", "technician")
- `password`: User's password (required, minimum 8 characters)
- `phoneNumber`: User's phone number (optional)
- `department`: Department code (required, must exist in database)
- `site`: Site code (required, must exist in database)
- `createdBy`: User ID of the manager/admin creating this user (required)
- `isActive`: Whether the user is active (optional, default: true)

#### Response
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "user123",
    "email": "john.doe@taqa.com",
    "name": "John Doe",
    "role": "technician",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z",
    "profile": {
      "id": "profile123",
      "department": "MAINTENANCE",
      "site": "NOOR_OUARZAZATE",
      "phone": "+212 6 12 34 56 78",
      "createdBy": "userId_of_manager_or_admin",
      "isFirstLogin": true
    }
  }
}
```

#### Error Responses

**400 Bad Request**
```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

**403 Forbidden**
```json
{
  "success": false,
  "message": "Only administrators and managers can create users"
}
```

**400 Bad Request - Invalid Department**
```json
{
  "success": false,
  "message": "Department not found"
}
```

**400 Bad Request - Invalid Site**
```json
{
  "success": false,
  "message": "Site not found"
}
```

### Get Available Departments

**GET** `/api/v1/users/departments`

Gets all active departments for user creation dropdowns.

#### Response
```json
{
  "success": true,
  "data": [
    {
      "id": "dept1",
      "name": "Maintenance",
      "code": "MAINTENANCE",
      "description": "Equipment maintenance and repair"
    },
    {
      "id": "dept2",
      "name": "Operations",
      "code": "OPERATIONS",
      "description": "Plant operations and monitoring"
    }
  ]
}
```

### Get Available Sites

**GET** `/api/v1/users/sites`

Gets all operational sites for user creation dropdowns.

#### Response
```json
{
  "success": true,
  "data": [
    {
      "id": "site1",
      "name": "Noor Ouarzazate I",
      "code": "NOOR_OUARZAZATE",
      "location": "Ouarzazate, Morocco",
      "status": "operational"
    },
    {
      "id": "site2",
      "name": "Noor Midelt",
      "code": "NOOR_MIDELT",
      "location": "Midelt, Morocco",
      "status": "operational"
    }
  ]
}
```

### Authorization Requirements

- **Create User by Manager/Admin**: Only users with `admin` or `manager` roles can create users
- **Get Departments/Sites**: No specific authorization required (these are reference data)

### Usage Examples

#### Complete User Creation Flow

1. **Get available departments and sites:**
```bash
curl -X GET "http://10.30.249.128:3333/api/v1/users/departments"
curl -X GET "http://10.30.249.128:3333/api/v1/users/sites"
```

2. **Create a new user:**
```bash
curl -X POST "http://10.30.249.128:3333/api/v1/users/create-by-manager" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "technician@taqa.com",
    "fullName": "Ahmed Hassan",
    "role": "technician",
    "password": "TechPass123!",
    "phoneNumber": "+212 6 12 34 56 78",
    "department": "MAINTENANCE",
    "site": "NOOR_OUARZAZATE",
    "createdBy": "manager_user_id"
  }'
```

#### Business Rules

1. **Email Uniqueness**: Each user must have a unique email address
2. **Department Validation**: Department must exist and be active
3. **Site Validation**: Site must exist and be operational
4. **Creator Validation**: The `createdBy` user must exist, be active, and have admin/manager role
5. **Password Security**: Passwords are hashed using bcrypt before storage
6. **Transaction Safety**: User and profile creation happens in a database transaction
7. **Default Values**: New users are created with `isFirstLogin: true` for profile setup

### Update User
```bash
curl -X PUT "http://10.30.249.128:3333/api/v1/users/cm123456" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "isActive": false
  }'
```

### Delete User
```bash
curl -X DELETE "http://10.30.249.128:3333/api/v1/users/cm123456"
```

### Get User Statistics
```bash
curl "http://10.30.249.128:3333/api/v1/users/stats/overview"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 12,
    "activeUsers": 11,
    "inactiveUsers": 1,
    "roleDistribution": {
      "admin": 1,
      "manager": 3,
      "technician": 8
    },
    "siteDistribution": {
      "Noor Ouarzazate": 6,
      "Noor Midelt": 4,
      "Noor Atlas": 2
    }
  }
}
```

---

## 🚨 Anomaly Management Endpoints

### Get All Anomalies
Get all anomalies with advanced filtering and pagination.

```bash
curl "http://10.30.249.128:3333/api/v1/anomalies"
```

**With comprehensive filters:**
```bash
curl "http://10.30.249.128:3333/api/v1/anomalies?status=open&priority=critical&site=Noor%20Ouarzazate&dateFrom=2025-06-01&dateTo=2025-06-30&search=pump"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "anom123",
      "title": "Pompe principale défaillante",
      "description": "La pompe principale présente des vibrations anormales",
      "priority": "critical",
      "status": "open",
      "category": "Mechanical",
      "detectedAt": "2025-06-27T08:30:00.000Z",
      "equipment": {
        "id": "eq123",
        "code": "NO-PMP-001",
        "name": "Pompe Principale",
        "zone": {
          "name": "Zone Production",
          "site": {
            "name": "Noor Ouarzazate"
          }
        }
      },
      "reportedBy": {
        "name": "Youssef Bennani",
        "email": "y.bennani@taqa.ma"
      },
      "comments": [],
      "attachments": []
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 4,
    "totalPages": 1
  }
}
```

### Get Anomaly by ID
```bash
curl "http://10.30.249.128:3333/api/v1/anomalies/anom123"
```

### Create New Anomaly
```bash
curl -X POST "http://10.30.249.128:3333/api/v1/anomalies" \
  -H "Content-Type: application/json" \
  -d '{
    "equipmentId": "eq123",
    "reportedById": "user123",
    "title": "Nouvelle anomalie détectée",
    "description": "Description détaillée de l'anomalie observée",
    "priority": "high",
    "category": "Electrical"
  }'
```

### Update Anomaly
```bash
curl -X PUT "http://10.30.249.128:3333/api/v1/anomalies/anom123" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress",
    "assignedToId": "user456",
    "priority": "critical"
  }'
```

### Add Comment to Anomaly
```bash
curl -X POST "http://10.30.249.128:3333/api/v1/anomalies/anom123/comments" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Intervention programmée pour demain matin",
    "authorId": "user123"
  }'
```

### Get Anomaly Statistics
```bash
curl "http://10.30.249.128:3333/api/v1/anomalies/stats/overview"
```

---

## 👥 Team Management Endpoints

### Get All Teams
```bash
curl "http://10.30.249.128:3333/api/v1/teams"
```

**With filters:**
```bash
curl "http://10.30.249.128:3333/api/v1/teams?type=maintenance&isActive=true"
```

### Get Team by ID
```bash
curl "http://10.30.249.128:3333/api/v1/teams/team123"
```

### Create New Team
```bash
curl -X POST "http://10.30.249.128:3333/api/v1/teams" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Équipe Maintenance Électrique",
    "description": "Équipe spécialisée en maintenance électrique",
    "type": "maintenance",
    "leaderId": "user123"
  }'
```

### Add Member to Team
```bash
curl -X POST "http://10.30.249.128:3333/api/v1/teams/team123/members" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user456",
    "role": "Technicien Senior",
    "specializations": ["Electrical", "Instrumentation"]
  }'
```

### Remove Member from Team
```bash
curl -X DELETE "http://10.30.249.128:3333/api/v1/teams/team123/members/user456"
```

### Get Team Statistics
```bash
curl "http://10.30.249.128:3333/api/v1/teams/stats/overview"
```

---

## ⚙️ Equipment Management Endpoints

### Get All Equipment
```bash
curl "http://10.30.249.128:3333/api/v1/equipment"
```

**With filters:**
```bash
curl "http://10.30.249.128:3333/api/v1/equipment?type=pump&status=operational&site=Noor%20Ouarzazate"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "eq123",
      "code": "NO-PMP-001",
      "name": "Pompe Principale",
      "type": "Centrifugal Pump",
      "manufacturer": "Grundfos",
      "model": "CR64-2",
      "status": "operational",
      "isActive": true,
      "zone": {
        "name": "Zone Production",
        "site": {
          "name": "Noor Ouarzazate"
        }
      },
      "anomalies": [],
      "maintenanceTasks": [],
      "_count": {
        "anomalies": 0,
        "maintenanceTasks": 1
      }
    }
  ]
}
```

### Get Equipment by ID
```bash
curl "http://10.30.249.128:3333/api/v1/equipment/eq123"
```

### Create New Equipment
```bash
curl -X POST "http://10.30.249.128:3333/api/v1/equipment" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "NO-VAL-010",
    "name": "Vanne de Régulation",
    "type": "Control Valve",
    "manufacturer": "Emerson",
    "model": "Fisher DVC6200",
    "zoneId": "zone123",
    "specifications": {
      "pressure": "16 bar",
      "temperature": "200°C"
    }
  }'
```

### Get Equipment Health Overview
```bash
curl "http://10.30.249.128:3333/api/v1/equipment/health/overview"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "equipmentHealth": [
      {
        "id": "eq123",
        "code": "NO-PMP-001",
        "name": "Pompe Principale",
        "healthScore": 65,
        "status": "operational",
        "openAnomalies": 2,
        "criticalAnomalies": 1,
        "pendingMaintenance": 1
      }
    ],
    "summary": {
      "totalEquipment": 36,
      "healthyEquipment": 28,
      "warningEquipment": 6,
      "criticalEquipment": 2,
      "averageHealthScore": 82.5
    }
  }
}
```

---

## 📅 Slotting System - Maintenance Window Management

The slotting system allows managers to book maintenance windows and assign anomalies to be fixed during specific time periods. This enables flexible scheduling where anomaly fixes can be split across multiple periods.

### Get All Slots
Get all maintenance slots with their associated anomalies and assignments.

```bash
curl "http://10.30.249.128:3333/api/v1/slots"
```

**Response:**
```json
{
  "data": [
    {
      "id": "slot123",
      "code": "SLT-2025-001",
      "title": "Maintenance Préventive Turbine - Janvier 2025",
      "description": "Slot de maintenance majeure pour turbine principale durant fenêtre de janvier",
      "anomalyId": "anom123",
      "dates": [
        "2025-01-10T08:00:00.000Z",
        "2025-01-11T08:00:00.000Z",
        "2025-01-12T08:00:00.000Z"
      ],
      "estimatedDuration": 48,
      "actualDuration": null,
      "status": "scheduled",
      "priority": "high",
      "windowType": "planned",
      "downtime": true,
      "safetyPrecautions": ["Consignation électrique", "Isolation système"],
      "resourcesNeeded": ["Équipe spécialisée", "Pièces de rechange"],
      "estimatedCost": 25000,
      "actualCost": null,
      "productionImpact": true,
      "notes": "Maintenance critique planifiée durant arrêt programmé",
      "createdAt": "2025-07-06T14:00:00.000Z",
      "scheduledAt": "2025-07-06T14:00:00.000Z",
      "anomaly": {
        "id": "anom123",
        "code": "ABO-2024-158",
        "title": "Vibrations anormales turbine",
        "severity": "critical",
        "priority": "P1"
      },
      "createdBy": {
        "id": "user123",
        "name": "Hassan Alami",
        "email": "h.alami@taqa.ma"
      },
      "assignedTeam": {
        "id": "team123",
        "name": "Équipe Maintenance Mécanique",
        "code": "EQU-MEC-01"
      }
    }
  ]
}
```

### Get Slot by ID
```bash
curl "http://10.30.249.128:3333/api/v1/slots/slot123"
```

### Create New Slot
Create a new maintenance slot by assigning an anomaly to specific dates.

```bash
curl -X POST "http://10.30.249.128:3333/api/v1/slots" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Réparation Système Hydraulique - Février 2025",
    "description": "Intervention sur système hydraulique durant courte fenêtre",
    "anomalyId": "anom456",
    "dates": [
      "2025-02-10T14:00:00.000Z",
      "2025-02-11T14:00:00.000Z"
    ],
    "estimatedDuration": 12,
    "priority": "medium",
    "assignedTeamId": "team456",
    "windowType": "planned",
    "downtime": false,
    "safetyPrecautions": ["Dépressurisation", "Nettoyage zone"],
    "resourcesNeeded": ["Joints hydrauliques", "Huile spéciale"],
    "estimatedCost": 8000,
    "productionImpact": false,
    "notes": "Intervention rapide sans arrêt production"
  }'
```

### Update Slot
Update slot information including status, actual costs, and completion details.

```bash
curl -X PUT "http://10.30.249.128:3333/api/v1/slots/slot123" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress",
    "startedAt": "2025-01-10T08:15:00.000Z",
    "actualCost": 23500,
    "completionNotes": "Intervention commencée avec 15 minutes de retard"
  }'
```

### Delete Slot
```bash
curl -X DELETE "http://10.30.249.128:3333/api/v1/slots/slot123"
```

### Get Slots by Anomaly
Get all slots associated with a specific anomaly.

```bash
curl "http://10.30.249.128:3333/api/v1/slots/anomaly/anom123"
```

### Get Available Maintenance Windows
Get predefined maintenance windows based on operational calendar.

```bash
curl "http://10.30.249.128:3333/api/v1/slots/available-windows"
```

**Response:**
```json
{
  "data": [
    {
      "id": "window-1",
      "startDate": "2025-01-08T00:00:00.000Z",
      "endDate": "2025-01-14T23:59:59.999Z",
      "durationDays": 7,
      "durationHours": 168,
      "description": "January maintenance window"
    },
    {
      "id": "window-2",
      "startDate": "2025-02-09T00:00:00.000Z",
      "endDate": "2025-02-12T23:59:59.999Z",
      "durationDays": 4,
      "durationHours": 96,
      "description": "February maintenance window"
    },
    {
      "id": "window-3",
      "startDate": "2026-01-02T00:00:00.000Z",
      "endDate": "2026-02-02T23:59:59.999Z",
      "durationDays": 30,
      "durationHours": 720,
      "description": "Extended maintenance window"
    }
  ]
}
```

### Slot Status Workflow
- **scheduled** - Slot created and planned
- **in_progress** - Work has started
- **completed** - Work finished successfully
- **cancelled** - Slot cancelled
- **delayed** - Slot postponed

### Flexible Date Scheduling
The slotting system supports flexible scheduling where a single anomaly fix can be split across multiple non-consecutive dates:

```json
{
  "dates": [
    "2025-01-10T08:00:00.000Z",  // 3 days of work
    "2025-01-11T08:00:00.000Z",
    "2025-01-12T08:00:00.000Z",
    "2025-01-20T08:00:00.000Z"   // 1 additional day later
  ]
}
```

This allows managers to optimize resource allocation and minimize production impact.

---

## 🔧 Maintenance Management Endpoints

### Get All Maintenance Tasks
```bash
curl "http://10.30.249.128:3333/api/v1/maintenance"
```

**With filters:**
```bash
curl "http://10.30.249.128:3333/api/v1/maintenance?type=preventive&status=scheduled&priority=high"
```

### Get Maintenance Task by ID
```bash
curl "http://10.30.249.128:3333/api/v1/maintenance/maint123"
```

### Create New Maintenance Task
```bash
curl -X POST "http://10.30.249.128:3333/api/v1/maintenance" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Maintenance préventive pompe",
    "description": "Révision complète de la pompe principale",
    "type": "preventive",
    "priority": "medium",
    "scheduledDate": "2025-07-01T08:00:00.000Z",
    "estimatedDuration": 240,
    "assignedTeamId": "team123",
    "equipmentIds": ["eq123", "eq124"],
    "instructions": "Suivre la procédure MP-001"
  }'
```

### Update Maintenance Task
```bash
curl -X PUT "http://10.30.249.128:3333/api/v1/maintenance/maint123" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress",
    "actualStartDate": "2025-07-01T08:15:00.000Z",
    "notes": "Démarrage avec 15 minutes de retard"
  }'
```

### Get Maintenance Statistics
```bash
curl "http://10.30.249.128:3333/api/v1/maintenance/stats/overview"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalTasks": 15,
    "statusDistribution": {
      "scheduled": 8,
      "in_progress": 2,
      "completed": 4,
      "cancelled": 1
    },
    "typeDistribution": {
      "preventive": 10,
      "corrective": 4,
      "emergency": 1
    },
    "upcomingTasksCount": 5,
    "overdueTasksCount": 2,
    "upcomingTasks": [],
    "overdueTasks": []
  }
}
```

---

## 📂 Data Import Endpoints

### Import Sample Data
Import predefined sample data into the Bronze layer for testing.

```bash
curl -X POST "http://localhost:3333/api/v1/medallion/import/sample"
```

**Response:**
```json
{
  "success": true,
  "message": "Sample data import completed. 3/3 records imported.",
  "result": {
    "totalRows": 3,
    "successCount": 3,
    "errorCount": 0,
    "errors": []
  }
}
```

### Import CSV File
Upload and import a CSV file into the Bronze layer. The system filters out records with null/empty required fields and tracks processing with DataProcessingLog.

```bash
curl -X POST "http://localhost:3333/api/v1/medallion/import/csv" \
  -F "file=@path/to/your/anomalies.csv"
```

**Example with test file:**
```bash
curl -X POST "http://localhost:3333/api/v1/medallion/import/csv" \
  -F "file=@test-anomalies.csv"
```

**Response:**
```json
{
  "success": true,
  "message": "CSV file import completed. 3/3 records imported into Bronze layer.",
  "result": {
    "totalRows": 3,
    "successCount": 3,
    "errorCount": 0,
    "errors": [],
    "processingLogId": "cm1234567890",
    "nextSteps": [
      "Run Bronze to Silver processing to clean and validate data",
      "Run Silver to Gold processing to create business-ready anomalies",
      "Or use the complete pipeline endpoint to run all steps"
    ]
  }
}
```

**CSV Format Expected (New Medallion Format):**
```csv
Num_equipement,Systeme,Description,Date de détéction de l'anomalie,Description de l'équipement,Section propriétaire,Fiabilité Intégrité,Disponibilté,Process Safety,Criticité
EQ-001-TURB-01,Turbine,Vibration excessive détectée sur palier principal,2024-01-15 10:30:00,Turbine à vapeur principale unité 1,Production,85,92,78,Haute
EQ-002-COMP-01,Compression,Fuite détectée au niveau du joint d'étanchéité,2024-01-16 14:15:00,Compresseur centrifuge circuit principal,Maintenance,72,88,95,Moyenne
```

**Field Descriptions:**
- `Num_equipement`: Equipment identifier (required)
- `Systeme`: System type (optional) 
- `Description`: Anomaly description (required)
- `Date de détéction de l'anomalie`: Detection date (required, format: YYYY-MM-DD HH:MM:SS)
- `Description de l'équipement`: Equipment description (required)
- `Section propriétaire`: Owner section (required)
- `Fiabilité Intégrité`: Reliability score 0-100 (optional)
- `Disponibilté`: Availability score 0-100 (optional)
- `Process Safety`: Process safety score 0-100 (optional)
- `Criticité`: Criticality level - Haute/Moyenne/Basse (optional)

---

## 🔄 Data Processing Endpoints

### Process Bronze → Silver Layer
Clean, validate, and standardize raw data from Bronze to Silver layer. Filters out records with null/empty required fields (Num_equipement, Description, Date de détéction de l'anomalie, Description de l'équipement, Section propriétaire) and removes duplicates.

```bash
curl -X POST "http://10.30.249.128:3333/api/v1/medallion/process/bronze-to-silver"
```

**Response:**
```json
{
  "success": true,
  "message": "Bronze to Silver processing completed. 3/3 records processed successfully.",
  "result": {
    "recordsProcessed": 3,
    "recordsSucceeded": 3,
    "recordsFailed": 0,
    "duplicatesSkipped": 0,
    "nextStep": "Run Silver to Gold processing to create business-ready anomalies"
  }
}
```

### Process Silver → Gold Layer
Transform clean data into business-ready format (creates/updates Anomaly records).

```bash
curl -X POST "http://localhost:3333/api/v1/medallion/process/silver-to-gold"
```

**Response:**
```json
{
  "success": true,
  "message": "Silver to Gold processing completed. 3/3 anomalies created/updated in the Gold layer.",
  "result": {
    "recordsProcessed": 3,
    "recordsSucceeded": 3,
    "recordsFailed": 0,
    "note": "Anomalies are now available in the main anomaly management system"
  }
}
```

### Run Complete Pipeline
Execute the complete medallion pipeline: Bronze → Silver → Gold in one operation.

```bash
curl -X POST "http://localhost:3333/api/v1/medallion/process/complete-pipeline"
```

**Response:**
```json
{
  "success": true,
  "message": "Complete medallion pipeline executed successfully. 6 Bronze records processed, 6 Silver records created, 6 Gold anomalies created/updated.",
  "result": {
    "bronzeToSilver": {
      "recordsProcessed": 6,
      "recordsSucceeded": 6,
      "recordsFailed": 0
    },
    "silverToGold": {
      "recordsProcessed": 6,
      "recordsSucceeded": 6,
      "recordsFailed": 0
    },
    "summary": {
      "bronzeRecordsProcessed": 6,
      "silverRecordsCreated": 6,
      "goldAnomaliesCreated": 6,
      "duplicatesSkipped": 0,
      "pipelineSuccess": true
    }
  }
}
```

### Import CSV and Process Pipeline
Upload CSV file and run complete pipeline in one operation.

```bash
curl -X POST "http://localhost:3333/api/v1/medallion/import-and-process" \
  -F "file=@path/to/your/anomalies.csv"
```

**Response:**
```json
{
  "success": true,
  "message": "CSV import and complete pipeline executed successfully. 3 records imported, 3 anomalies created in Gold layer.",
  "result": {
    "import": {
      "totalRows": 3,
      "successCount": 3,
      "errorCount": 0
    },
    "pipeline": {
      "bronzeToSilver": {
        "recordsProcessed": 3,
        "recordsSucceeded": 3,
        "recordsFailed": 0
      },
      "silverToGold": {
        "recordsProcessed": 3,
        "recordsSucceeded": 3,
        "recordsFailed": 0
      }
    },
    "summary": {
      "csvRecordsImported": 3,
      "anomaliesCreated": 3,
      "totalSuccess": true
    }
  }
}
```

---

## 📊 Statistics Endpoints

### Bronze Layer Statistics
Get statistics about raw data in the Bronze layer.

```bash
curl "http://localhost:3333/api/v1/medallion/stats/bronze"
```

**Response:**
```json
{
  "totalRecords": 6,
  "processedRecords": 6,
  "unprocessedRecords": 0,
  "recentImports": [
    {
      "id": "cmcakg8lb0002yawifqruzkx2",
      "sourceFile": "uploaded_file.csv",
      "ingestedAt": "2025-06-24T13:33:29.855Z",
      "isProcessed": true
    }
  ]
}
```

### Silver Layer Statistics
Get statistics about cleaned data in the Silver layer.

```bash
curl "http://localhost:3333/api/v1/medallion/stats/silver"
```

**Response:**
```json
{
  "totalRecords": 6,
  "dataQualityScore": 100,
  "statusDistribution": {
    "COMPLETED": 4,
    "IN_PROGRESS": 1,
    "SCHEDULED": 1
  },
  "sectionDistribution": {
    "34MC": 3,
    "34MD": 2,
    "34ME": 1
  }
}
```

---

## 🎯 Analytics Endpoints

### Get Analytics Summary
Retrieve business analytics from the Gold layer.

```bash
curl "http://localhost:3333/api/v1/medallion/analytics/summary"
```

**With specific period:**
```bash
curl "http://localhost:3333/api/v1/medallion/analytics/summary?period=2025-06"
```

**Response:**
```json
{
  "period": "2025-06",
  "anomalySummaries": [
    {
      "id": "clxxxxx",
      "sectionCode": "34MC",
      "equipmentCategory": "VALVE",
      "statusCategory": "COMPLETED",
      "totalAnomalies": 2,
      "criticalAnomalies": 1,
      "resolvedAnomalies": 2,
      "pendingAnomalies": 0,
      "resolutionRate": 100,
      "reportPeriod": "2025-06"
    }
  ],
  "equipmentHealth": [],
  "sectionPerformance": []
}
```

---

## 🔍 Debug Endpoints

### View All Tables
Get a complete overview of all medallion tables with their content.

```bash
curl "http://localhost:3333/api/v1/medallion/debug/tables"
```

**With limit:**
```bash
curl "http://localhost:3333/api/v1/medallion/debug/tables?limit=10"
```

**Response:**
```json
{
  "bronze": {
    "anomalies": [...],
    "equipment": [...]
  },
  "silver": {
    "anomalies": [...],
    "equipment": [...],
    "sections": [...]
  },
  "gold": {
    "anomalySummaries": [...],
    "equipmentHealth": [...],
    "sectionPerformance": [...]
  },
  "logs": {
    "processingLogs": [...]
  },
  "users": {
    "users": [...]
  },
  "metadata": {
    "limit": 10,
    "timestamp": "2025-06-24T13:35:00.000Z"
  }
}
```

### View Bronze Layer
Get detailed content of Bronze layer tables.

```bash
curl "http://localhost:3333/api/v1/medallion/debug/bronze"
```

**Response:**
```json
{
  "anomalies": [
    {
      "id": "cmcakg8lb0002yawifqruzkx2",
      "numEquipement": "54321-test-3",
      "description": "Temperature sensor malfunction",
      "dateDetectionAnomalie": "2025-06-24 14:15:00",
      "statut": "Ordonnancé",
      "priorite": "3",
      "sourceFile": "uploaded_file.csv",
      "isProcessed": true,
      "ingestedAt": "2025-06-24T13:33:29.855Z"
    }
  ],
  "equipment": [],
  "counts": {
    "totalAnomalies": 6,
    "totalEquipment": 0
  }
}
```

### View Silver Layer
Get detailed content of Silver layer tables.

```bash
curl "http://localhost:3333/api/v1/medallion/debug/silver"
```

**Response:**
```json
{
  "anomalies": [
    {
      "id": "cmcakgqxy0006yawi95nci7ct",
      "numEquipement": "54321-test-3",
      "description": "Temperature sensor malfunction",
      "dateDetectionAnomalie": "2025-06-24T13:15:00.000Z",
      "statut": "Ordonnancé",
      "priorite": "3",
      "dataQualityScore": 100,
      "priorityLevel": 3,
      "statusCategory": "SCHEDULED",
      "equipmentCategory": "OTHER",
      "bronzeSourceId": "cmcakg8lb0002yawifqruzkx2",
      "processedAt": "2025-06-24T13:33:53.638Z"
    }
  ],
  "equipment": [],
  "sections": [],
  "counts": {
    "totalAnomalies": 6,
    "totalEquipment": 0,
    "totalSections": 0
  }
}
```

### View Gold Layer
Get detailed content of Gold layer analytics tables.

```bash
curl "http://localhost:3333/api/v1/medallion/debug/gold"
```

**Response:**
```json
{
  "anomalySummaries": [],
  "equipmentHealth": [],
  "sectionPerformance": [],
  "counts": {
    "totalAnomalySummaries": 0,
    "totalEquipmentHealth": 0,
    "totalSectionPerformance": 0
  }
}
```

---

## 📝 Logs Endpoints

### Get Processing Logs
View data processing logs and audit trails.

```bash
curl "http://localhost:3333/api/v1/medallion/logs"
```

**With parameters:**
```bash
curl "http://localhost:3333/api/v1/medallion/logs?limit=10&jobName=bronze_to_silver_anomalies"
```

**Response:**
```json
{
  "logs": [
    {
      "id": "cmcakg123",
      "jobName": "bronze_to_silver_anomalies",
      "sourceLayer": "bronze",
      "targetLayer": "silver",
      "recordsProcessed": 3,
      "recordsSucceeded": 3,
      "recordsFailed": 0,
      "startTime": "2025-06-24T13:33:52.316Z",
      "endTime": "2025-06-24T13:33:54.205Z",
      "status": "COMPLETED",
      "errorMessage": null
    }
  ],
  "total": 1,
  "limit": 10
}
```

---

## 🚀 Complete Workflow Examples

### Full Anomaly Management Workflow

1. **Create a new user:**
```bash
curl -X POST "http://10.30.249.128:3333/api/v1/users" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "technician@taqa.ma",
    "name": "Ahmed Technician",
    "role": "technician",
    "password": "SecurePass123!"
  }'
```

2. **Create a maintenance team:**
```bash
curl -X POST "http://10.30.249.128:3333/api/v1/teams" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Équipe Maintenance Urgence",
    "type": "maintenance",
    "leaderId": "USER_ID_FROM_STEP_1"
  }'
```

3. **Create equipment:**
```bash
curl -X POST "http://10.30.249.128:3333/api/v1/equipment" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "NO-PMP-999",
    "name": "Pompe Test",
    "type": "Centrifugal Pump",
    "zoneId": "EXISTING_ZONE_ID"
  }'
```

4. **Report an anomaly:**
```bash
curl -X POST "http://10.30.249.128:3333/api/v1/anomalies" \
  -H "Content-Type: application/json" \
  -d '{
    "equipmentId": "EQUIPMENT_ID_FROM_STEP_3",
    "reportedById": "USER_ID_FROM_STEP_1",
    "title": "Vibrations anormales détectées",
    "description": "La pompe présente des vibrations importantes",
    "priority": "critical",
    "category": "Mechanical"
  }'
```

5. **Create maintenance slot:**
```bash
curl -X POST "http://10.30.249.128:3333/api/v1/slots" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Maintenance Critique Pompe - Janvier 2025",
    "description": "Slot de maintenance pour réparation pompe durant fenêtre planifiée",
    "anomalyId": "ANOMALY_ID_FROM_STEP_4",
    "dates": [
      "2025-01-10T08:00:00.000Z",
      "2025-01-11T08:00:00.000Z"
    ],
    "estimatedDuration": 24,
    "priority": "critical",
    "assignedTeamId": "TEAM_ID_FROM_STEP_2",
    "windowType": "planned",
    "downtime": true,
    "safetyPrecautions": ["Consignation électrique", "Zone sécurisée"],
    "resourcesNeeded": ["Pièces de rechange", "Équipe spécialisée"],
    "estimatedCost": 15000,
    "productionImpact": true,
    "notes": "Maintenance critique planifiée"
  }'
```

6. **Create maintenance task:**
```bash
curl -X POST "http://10.30.249.128:3333/api/v1/maintenance" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Intervention urgente pompe",
    "description": "Réparation suite à anomalie critique",
    "type": "emergency",
    "priority": "critical",
    "scheduledDate": "2025-06-28T08:00:00.000Z",
    "estimatedDuration": 180,
    "assignedTeamId": "TEAM_ID_FROM_STEP_2",
    "equipmentIds": ["EQUIPMENT_ID_FROM_STEP_3"]
  }'
```

7. **Check system overview:**
```bash
# Get anomaly statistics
curl "http://10.30.249.128:3333/api/v1/anomalies/stats/overview"

# Get equipment health
curl "http://10.30.249.128:3333/api/v1/equipment/health/overview"

# Get maintenance overview
curl "http://10.30.249.128:3333/api/v1/maintenance/stats/overview"
```

### Data Import and Processing Workflow

1. **Import CSV data:**
```bash
curl -X POST "http://10.30.249.128:3333/api/v1/medallion/import/csv" \
  -F "file=@Subject/Anonymized_data_extract_anomaliesimportantes.csv"
```

2. **Process through medallion layers:**
```bash
curl -X POST "http://10.30.249.128:3333/api/v1/medallion/process/bronze-to-silver"
curl -X POST "http://10.30.249.128:3333/api/v1/medallion/process/silver-to-gold"
```

3. **View analytics:**
```bash
curl "http://10.30.249.128:3333/api/v1/medallion/analytics/summary"
```

### Dashboard Data Retrieval

```bash
# Get all key statistics for dashboard
curl "http://10.30.249.128:3333/api/v1/users/stats/overview"
curl "http://10.30.249.128:3333/api/v1/anomalies/stats/overview"
curl "http://10.30.249.128:3333/api/v1/equipment/stats/overview"
curl "http://10.30.249.128:3333/api/v1/teams/stats/overview"
curl "http://10.30.249.128:3333/api/v1/maintenance/stats/overview"

# Get recent activity
curl "http://10.30.249.128:3333/api/v1/anomalies?limit=5&page=1"
curl "http://10.30.249.128:3333/api/v1/maintenance?status=scheduled&limit=5"
```

---

## 📊 Data Quality & Transformations

### What happens in each layer:

**🥉 Bronze Layer (Raw Data):**
- Stores data exactly as imported
- Preserves original structure and values
- Tracks source files and ingestion timestamps
- Maintains complete data lineage

**🥈 Silver Layer (Cleaned Data):**
- Validates required fields
- Converts dates to proper DateTime format
- Normalizes status values (`Terminé` → `COMPLETED`)
- Converts priorities to numeric levels (1=High, 2=Medium, 3=Low)
- Categorizes equipment automatically
- Calculates data quality scores (0-100%)

**🥇 Gold Layer (Analytics):**
- Aggregates data by section, equipment, priority
- Calculates business KPIs and metrics
- Generates time-series data for trends
- Creates health scores and risk assessments

---

## 🛠️ Swagger Documentation

Interactive API documentation is available at:
```
http://10.30.249.128:3333/documentation
```

---

## 📋 Error Responses

All endpoints return structured error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request (invalid input)
- `404` - Not Found
- `500` - Internal Server Error

---

## 🔧 Tips & Best Practices

### General API Usage
1. **Use pagination** for large datasets (page, limit parameters)
2. **Leverage filtering** to get specific data subsets
3. **Check statistics endpoints** for dashboard overviews
4. **Use search parameters** for text-based filtering
5. **Include proper Content-Type headers** for POST/PUT requests

### Anomaly Management
1. **Create users and teams** before assigning anomalies
2. **Link equipment to zones and sites** for proper organization
3. **Use priority levels** effectively (low, medium, high, critical)
4. **Add comments** to track anomaly resolution progress
5. **Update status** as work progresses (open → in_progress → resolved → closed)

### Equipment Management
1. **Monitor equipment health scores** regularly
2. **Use unique equipment codes** for identification
3. **Track maintenance history** through related tasks
4. **Filter by site and zone** for location-based views

### Maintenance Planning
1. **Schedule preventive maintenance** in advance
2. **Assign teams** to maintenance tasks
3. **Track actual vs estimated duration** for planning improvement
4. **Use equipment health data** to prioritize maintenance

### Data Import & Processing
1. **Import CSV data** through medallion architecture
2. **Process Bronze → Silver → Gold** for clean analytics
3. **Monitor processing logs** for troubleshooting
4. **Use debug endpoints** to inspect data transformations

---

## 📈 Performance Notes

- All endpoints support pagination to handle large datasets efficiently
- Database queries are optimized with proper indexing and relationships
- Statistics endpoints use aggregation for fast performance
- Search functionality uses case-insensitive matching
- Related data is included using Prisma's include feature for efficient joins
- Background processing available for heavy data import operations

---

## 🎯 API Coverage Summary

✅ **User Management** - Complete CRUD with role-based access
✅ **Anomaly Management** - Full lifecycle with comments and attachments
✅ **Team Management** - Team creation with member management
✅ **Equipment Management** - Asset tracking with health monitoring
✅ **Maintenance Management** - Task scheduling and tracking
✅ **Slotting System** - Flexible maintenance window management with split scheduling
✅ **Data Import/Export** - Medallion architecture for data processing
✅ **Statistics & Analytics** - Comprehensive reporting endpoints
✅ **Health Monitoring** - System and equipment health checks

Your **Complete TAQA Management System** is now ready for production use! 🎉

**Total Endpoints:** 60+ comprehensive API endpoints covering all aspects of industrial anomaly management including advanced maintenance scheduling. 