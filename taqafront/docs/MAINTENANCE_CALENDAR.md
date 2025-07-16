# 🔧 Maintenance Calendar - Documentation

## 📋 Overview

The Maintenance Calendar is a comprehensive scheduling and management system designed for industrial maintenance operations. It provides priority-based anomaly scheduling, visual calendar management, and intelligent time allocation for maintenance interventions.

## 🚀 Features

### 📅 **Interactive Calendar**
- **Monthly View**: Clean grid layout with navigation controls
- **Click-to-Schedule**: Click any date to create new maintenance events
- **Visual Events**: Color-coded events displayed directly on calendar dates
- **Today Highlighting**: Current date clearly marked
- **Month Navigation**: Previous/Next buttons and "Today" shortcut

### 🚨 **Emergency Response System**
- **Critical Anomalies**: Automatically scheduled to the earliest available time slot
- **Immediate Intervention**: Critical anomalies get scheduling within the hour when possible
- **Override Capability**: System can suggest overriding lower-priority maintenance for critical repairs
- **Smart Scheduling**: Non-critical anomalies get intelligent date suggestions based on:
  - Anomaly priority level
  - Available capacity on each date
  - Urgency scoring algorithm
- **Visual Emergency Indicators**: Pulsing red buttons and immediate scheduling alerts
- **Real-time Slot Finding**: Live search for the earliest possible intervention time

### 🎨 **Visual Priority System**
- **Critical**: Red (🔴) - Immediate attention required
- **High**: Orange (🟠) - High priority intervention
- **Medium**: Yellow (🟡) - Standard maintenance
- **Low**: Green (🟢) - Routine maintenance

### 📊 **Visual Availability System**
- **24-Hour Capacity**: Each date operates on 24-hour availability
- **Color-Coded Indicators**:
  - **Green dots**: High availability (20+ hours remaining)
  - **Orange dots**: Medium availability (12-19 hours remaining)
  - **Red dots**: Low availability (1-11 hours remaining)
  - **No dot**: Fully booked (0 hours remaining)
- **Progress Bars**: Visual capacity usage representation
- **Disabled Dates**: Past dates and fully booked dates are not selectable
- **Hover Tooltips**: Show exact remaining hours on calendar hover

### 📊 **Event Management**
- **Dual Event Types**:
  - **Maintenance**: Preventive and scheduled maintenance
  - **Anomaly**: Reactive repairs and fixes
- **Comprehensive Details**: Equipment, technician, location, duration tracking
- **Status Tracking**: Planned → In Progress → Completed workflow

## 🛠️ Usage Guide

### **Accessing the Calendar**
```
URL: http://localhost:3000/maintenance
Navigation: Sidebar → Maintenance → Planification
```

### **Creating New Interventions**

#### Method 1: Calendar Click
1. Click on any date in the calendar
2. Fill out the intervention form
3. Select type (Maintenance/Anomaly) and priority
4. Assign equipment, technician, and location
5. Set estimated duration
6. Click "Planifier" to save

#### Method 2: New Intervention Button
1. Click "Nouvelle intervention" button
2. Complete the same form process
3. Select specific date and time

### **Managing Anomalies**

#### Viewing Pending Anomalies
1. Click "Anomalies en attente" button
2. View list of open anomalies with priority indicators
3. See equipment, location, and estimated repair time

#### Auto-Scheduling Anomalies
1. From the anomalies list, click "Planifier" on any anomaly
2. System automatically suggests optimal time slot based on priority
3. Modify details if needed
4. Confirm scheduling

### **Editing Existing Events**

#### From Calendar
1. Click on any event in the calendar grid
2. Modify details in the edit form
3. Save changes or delete if needed

#### From Events List
1. Scroll to "Interventions Planifiées" section
2. Click the edit button (✏️) on any event
3. Update information as needed

## 🎯 Key Components

### **Main Interface Elements**

1. **Header Section**
   - Page title and description
   - Anomalies counter button
   - New intervention button

2. **Critical Alerts Banner**
   - Displays when critical anomalies are detected
   - Direct link to anomaly scheduling
   - Prominent red styling for urgency

3. **Calendar Grid**
   - 7-day week layout
   - Month/year navigation
   - Event indicators on dates
   - Hover effects and interactions

4. **Events List**
   - Chronological list of all planned interventions
   - Priority and type badges
   - Equipment and location details
   - Quick edit access

### **Modal Dialogs**

#### Intervention Form
- **Basic Info**: Title, type, priority
- **Assignment**: Equipment, technician, location
- **Scheduling**: Date, time, duration
- **Details**: Description and notes
- **Actions**: Save, cancel, delete options

#### Anomalies Manager
- **Anomaly Cards**: Priority badges, equipment info
- **Quick Details**: Location, estimated repair time
- **One-Click Scheduling**: Automatic time allocation

## 🔧 Technical Details

### **Built With**
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Radix UI** components (Dialog, Select, etc.)
- **Lucide React** icons
- **Custom Calendar Logic** (no external dependencies)

### **Component Structure**
```
MaintenanceCalendar/
├── Calendar Grid Generation
├── Event Management System
├── Anomaly Integration
├── Form Handling
├── Priority-Based Scheduling
└── UI Components Integration
```

### **Data Models**

#### MaintenanceEvent
```typescript
interface MaintenanceEvent {
  id: string;
  title: string;
  type: "maintenance" | "anomaly";
  priority: "critical" | "high" | "medium" | "low";
  equipment: string;
  technician: string;
  location: string;
  description: string;
  estimatedDuration: number;
  status: "planned" | "in_progress" | "completed" | "cancelled";
  date: string;
  time: string;
  anomalyId?: string;
}
```

#### Anomaly
```typescript
interface Anomaly {
  id: string;
  title: string;
  priority: "critical" | "high" | "medium" | "low";
  equipment: string;
  location: string;
  description: string;
  estimatedRepairTime: number;
  reportedAt: Date;
  requiredSkills: string[];
  status: "open" | "assigned" | "in_progress" | "resolved";
}
```

## 🎨 Styling & Theming

### **Color Scheme**
- **TAQA Navy**: Primary text and headers
- **TAQA Electric Blue**: Buttons and accents
- **Priority Colors**: Red, Orange, Yellow, Green system
- **Gray Scale**: Background and secondary elements

### **Responsive Design**
- **Mobile First**: Optimized for all screen sizes
- **Grid Layout**: Responsive calendar grid
- **Touch Friendly**: Large click targets
- **Scroll Management**: Proper overflow handling

## 🚀 Future Enhancements

### **Planned Features**
- [ ] **Real-time Updates**: WebSocket integration for live anomaly detection
- [ ] **Technician Availability**: Calendar integration with staff schedules
- [ ] **Equipment Status**: Real-time equipment health monitoring
- [ ] **Automated Notifications**: Email/SMS alerts for critical anomalies
- [ ] **Reporting Dashboard**: Analytics and performance metrics
- [ ] **Mobile App**: Native mobile application
- [ ] **Integration APIs**: Connect with external maintenance systems

### **Advanced Scheduling**
- [ ] **Resource Optimization**: Automatic technician and equipment allocation
- [ ] **Conflict Resolution**: Smart scheduling to avoid overlaps
- [ ] **Predictive Maintenance**: AI-driven maintenance scheduling
- [ ] **Weather Integration**: Weather-dependent outdoor maintenance scheduling

## 🛡️ Best Practices

### **Using the System Effectively**

1. **Regular Monitoring**: Check for critical anomalies daily
2. **Proactive Scheduling**: Plan maintenance during optimal windows
3. **Accurate Estimates**: Provide realistic duration estimates
4. **Status Updates**: Keep event statuses current
5. **Documentation**: Include detailed descriptions for future reference

### **Priority Management**
- **Critical**: Reserve for safety-critical issues only
- **High**: Equipment that affects production significantly
- **Medium**: Standard maintenance and minor repairs
- **Low**: Cosmetic issues and non-urgent tasks

## 📞 Support

For technical support or feature requests, please contact the development team or refer to the main project documentation.

---

**Version**: 1.0.0  
**Last Updated**: December 2024  
**Compatibility**: React 18+, Modern Browsers 