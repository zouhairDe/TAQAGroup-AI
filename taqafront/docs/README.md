# TAQA Morocco - Industrial Anomaly Management System

> A centralized digital platform for tracking, managing, and resolving critical anomalies in TAQA Morocco's industrial units.

## 🎯 Problem Statement

In TAQA Morocco's industrial units, critical anomalies—unexpected events or malfunctions—are currently tracked through fragmented and often manual systems (e.g., Oracle exports, Maximo entries, Excel sheets). This decentralization reduces visibility and makes tracking, prioritizing, and resolving these anomalies inefficient.

### Current Challenges
- **Delayed decisions and responses**
- **Missed learning opportunities** from past anomalies
- **Poor traceability** of resolution efforts
- **Difficulty aligning** anomalies with planned maintenance

## 🛠️ Solution Objectives

Build a centralized, intuitive, and efficient digital anomaly management system that can:

- ✅ Collect and unify anomaly reports from various sources
- ✅ Classify and prioritize anomalies based on safety and equipment availability impact
- ✅ Track anomaly resolution status and updates
- ✅ Provide insights through historical analysis and Return of Experience (REX)
- ✅ Link anomalies with operational calendars (e.g., planned maintenance)
- ✅ Provide dashboards, filters, and visual tools for decision-makers

## 🧩 Core Functionalities (Mandatory)

### 📥 Centralized Anomaly Registration and Display
**Unified Data Collection:**
- **Multi-channel Input**: Manual entry, IoT sensors, Oracle/Maximo imports, Excel uploads
- **Smart Form Interface**: Dynamic forms that adapt based on equipment type and anomaly category
- **Required Information**: Title, description, type, equipment, location, reporter, discovery date
- **Rich Media Support**: Photos, videos, audio recordings, documents from moment of creation
- **GPS Integration**: Automatic location tagging for mobile entries
- **Voice-to-Text**: Hands-free anomaly reporting for field technicians

**Real-time Communication & Notifications:**
- **Instant Alerts**: Critical anomalies trigger immediate notifications to relevant teams
- **Multi-channel Notifications**: SMS, email, in-app, WhatsApp based on criticality and role
- **Escalation Chains**: Automatic escalation if anomalies aren't acknowledged within timeframes
- **Team Collaboration**: Comments, @mentions, file sharing, and status updates
- **Mobile-first Design**: Optimized for tablets and smartphones used by field technicians

### 🚦 Advanced Criticality Assessment & Assignment
**Intelligent Risk Evaluation:**
- **Safety Impact Analysis**: Immediate and potential safety risks assessment
- **Equipment Availability Impact**: Production downtime cost calculation
- **Urgency Evaluation**: Time-sensitivity based on equipment condition
- **AI-Powered Suggestions**: ML model recommends criticality with confidence scores
- **Human Override**: Experts can always override AI recommendations

**Smart Assignment System:**
- **Skill-Based Matching**: Assign to technicians with relevant expertise
- **Workload Balancing**: Consider current assignments and availability
- **Location Optimization**: Assign to nearest available qualified technician
- **Escalation Rules**: Auto-escalate if not accepted within defined timeframes
- **Team Coordination**: Multi-technician assignments for complex anomalies

### 📍 Complete Anomaly Lifecycle Management
- **Enhanced Lifecycle stages**: New → Classified → Assigned → In Progress → Under Review → Resolved → REX Complete → Archived
- **Real-time Status Updates**: Instant notifications across all stakeholders
- **Attachments Management**: Reports, photos, videos, documents at every stage
- **Communication Hub**: Comments, notes, and updates with timestamps
- **Progress Tracking**: Time spent in each stage with performance metrics
- **Escalation Management**: Automatic escalation for overdue anomalies

### 📚 Enhanced Return of Experience (REX)
- **Mandatory REX Process**: Cannot close anomaly without completing REX
- **Structured Knowledge Capture**: Root cause analysis, lessons learned, preventive actions
- **Rich Media Support**: Attach reports, documents, videos, audio explanations
- **Knowledge Tagging**: Categorize learnings for easy future reference
- **Peer Review System**: Senior technicians validate and approve REX entries
- **Knowledge Search**: AI-powered search through historical REX database
- **Best Practices Library**: Crowdsourced solutions and successful resolution methods

### 📅 Smart Maintenance Integration
- **Intelligent Scheduling**: Assign anomalies to optimal maintenance windows
- **Resource Optimization**: Coordinate parts, tools, and technician availability
- **Cost Analysis**: Calculate impact of immediate vs. scheduled repairs
- **Maintenance Planning**: Integration with TAQA's existing maintenance calendars
- **Opportunity Maintenance**: Group related anomalies for efficient resolution
- **Emergency Override**: Fast-track critical anomalies outside normal schedules

### 🔍 Advanced Search, Filtering & Quality Assurance
**Powerful Search & Filter:**
- **Multi-criteria Filtering**: Equipment, date ranges, criticality, status, technician, location
- **Smart Search**: AI-powered search through descriptions, comments, and REX entries
- **Saved Filters**: Custom filter sets for different user roles and common queries
- **Real-time Filtering**: Instant results as you type with performance optimization

**Quality Assurance & Verification:**
- **Supervisor Review Process**: Mandatory review for critical anomalies before closure
- **Photo Evidence Requirements**: Before/after photos for visual verification
- **Solution Validation**: Test procedures to confirm anomaly resolution
- **Peer Review System**: Senior technicians validate complex resolutions
- **Quality Metrics**: Track resolution quality scores and re-occurrence rates

## ✨ Optional Features (Bonus)

### 🧾 Complete Anomaly Lifecycle Tracking
- **Detailed Change History**: Log every field modification with user, timestamp, and reason
- **Stage Duration Analytics**: Track time spent in each lifecycle stage
- **Performance Metrics**: Measure resolution efficiency and identify bottlenecks
- **Compliance Audit Trail**: Immutable records for regulatory requirements
- **Lifecycle Visualization**: Timeline view showing anomaly journey from creation to archive
- **Automated Reporting**: Generate lifecycle reports for management review

### 📊 Dashboard with Key Indicators
KPIs including:
- Open anomalies by type or equipment
- Mean resolution time
- Critical anomalies pending

### 📁 Archived Anomalies + REX Access
- Historical database for learning
- Timeline views of anomaly evolution over time

## 🏆 Hackathon-Winning Features & Critical Bonuses

### 🚀 **CRITICAL BONUS: AI-Powered Anomaly Prevention System**

#### **Predictive Anomaly Detection Engine**
- **Real-time Pattern Recognition**: Analyze historical data to predict anomalies 24-48 hours before they occur
- **Equipment Health Scoring**: AI-driven health metrics for each piece of equipment
- **Maintenance Optimization**: Suggest optimal maintenance windows based on predicted failures
- **ROI Calculator**: Show cost savings from prevented downtime

#### **Smart Decision Engine**
```
Current State → AI Analysis → Prediction → Preventive Action → Cost Savings
```

### 🎯 **Game-Changing Extra Features**

#### 1. **Smart Mobile Assistant with Voice Commands**
- **Voice-to-Text Anomaly Reporting**: "Log critical anomaly on Turbine 3, bearing failure, high priority"
- **Audio Anomaly Detection**: Record equipment sounds, AI analyzes for irregular patterns
- **Hands-free Updates**: Perfect for field technicians wearing safety equipment
- **Multi-language Support**: Arabic, French, English for TAQA Morocco's diverse workforce

#### 2. **Augmented Reality (AR) Anomaly Visualization**
- **Equipment Overlay**: Point phone at equipment to see anomaly history, status, instructions
- **Step-by-step Repair Guidance**: AR overlays showing exactly where to inspect/repair
- **Remote Expert Assistance**: AR-powered remote support from senior technicians
- **QR Code Integration**: Instant equipment identification and anomaly reporting

#### 3. **Advanced Analytics & Business Intelligence**
- **Equipment Failure Heatmaps**: Visual representation of failure-prone areas
- **Seasonal Pattern Recognition**: Identify weather/seasonal anomaly correlations
- **Cost Impact Analysis**: Real-time calculation of downtime costs and prevention savings
- **Performance Benchmarking**: Compare TAQA sites, equipment types, teams

#### 4. **Intelligent Notification & Escalation System**
- **Smart Escalation Rules**: Auto-escalate based on criticality, time, and availability
- **Contextual Notifications**: Different alerts for different roles (SMS for critical, email for updates)
- **WhatsApp Integration**: Instant team communication for urgent anomalies
- **Geofencing Alerts**: Notify nearby technicians for immediate response

#### 5. **Collaborative Features & Knowledge Sharing**
- **Expert Network**: Connect with specialists across TAQA global network
- **Video REX Sessions**: Record video explanations for complex resolutions
- **Peer Review System**: Senior technicians validate anomaly classifications
- **Best Practices Sharing**: Crowdsourced solutions from the global TAQA community

### 🔥 **Technical Innovations**

#### 6. **Edge Computing & Offline-First Architecture**
- **Offline-capable PWA**: Full functionality without internet connection
- **Edge AI Processing**: Run ML models locally on mobile devices
- **Smart Sync**: Intelligent data synchronization when connection returns
- **Low-bandwidth Mode**: Optimized for poor network conditions

#### 7. **Blockchain-based Audit Trail**
- **Immutable Records**: Blockchain ensures anomaly records can't be tampered with
- **Compliance Tracking**: Automatic regulatory compliance documentation
- **Smart Contracts**: Automated workflows for critical anomaly responses
- **Supply Chain Integration**: Track equipment warranties and vendor responsibilities

#### 8. **IoT Integration & Sensor Fusion**
- **Real-time Sensor Monitoring**: Integrate with existing TAQA sensors
- **Automated Anomaly Detection**: Sensors trigger automatic anomaly creation
- **Environmental Correlation**: Weather, temperature, pressure data integration
- **Predictive Maintenance Scheduling**: IoT data drives maintenance predictions

### 🎨 **UX/UI Innovations**

#### 9. **Dynamic UI Adaptation**
- **Role-based Interface**: UI automatically adapts based on user role and context
- **Dark/Light/High-Contrast Modes**: Perfect for different working conditions
- **Gesture Controls**: Swipe gestures for quick status updates
- **Voice Interface**: Complete voice control for hands-free operation

#### 10. **Gamification & Engagement**
- **Technician Leaderboards**: Recognition for fastest resolutions, best REX contributions
- **Achievement Badges**: Certifications for different types of anomaly resolutions
- **Knowledge Quests**: Interactive training modules based on real anomalies
- **Team Challenges**: Cross-site competitions for safety improvements

### 🌟 **Industry 4.0 Integration**

#### 11. **Digital Twin Integration**
- **3D Equipment Models**: Interactive 3D models showing anomaly locations
- **Simulation Capabilities**: Test repair scenarios before implementation
- **Virtual Training**: Train on digital twins before working on real equipment
- **Predictive Modeling**: Simulate equipment behavior under different conditions

#### 12. **Advanced Reporting & Compliance**
- **Automated ESG Reporting**: Generate sustainability reports automatically
- **Regulatory Compliance**: Auto-generate reports for Moroccan industrial regulations
- **Executive Dashboards**: C-level views with strategic insights
- **Custom Report Builder**: Drag-and-drop report creation for any stakeholder

### 🏆 **Competitive Advantages**

#### **Technical Excellence**
- **Sub-second Response Times**: Edge computing ensures lightning-fast performance
- **99.9% Uptime**: Offline-first architecture guarantees reliability
- **Multi-modal Interaction**: Voice, touch, AR, and gesture controls
- **Real-time Collaboration**: Seamless teamwork across global TAQA network

#### **Business Impact**
- **Predictive Cost Savings**: Prevent downtime before it happens
- **Operational Efficiency**: 50% reduction in anomaly resolution time
- **Knowledge Preservation**: Institutional knowledge captured and shared
- **Regulatory Compliance**: Automated adherence to safety standards

#### **Innovation Leadership**
- **AI-First Approach**: Machine learning drives every decision
- **Future-Ready Architecture**: Built for Industry 4.0 integration
- **Scalable Design**: From single plant to global enterprise
- **Sustainability Focus**: ESG reporting and environmental impact tracking

## 📦 Technology Stack & Architecture

| Layer | Tool/Framework | Purpose |
|-------|----------------|---------|
| **Frontend** | Next.js, Tailwind CSS, TypeScript | Unified web/mobile experience |
| **Mobile Experience** | PWA (Progressive Web App) | Native-like mobile functionality |
| **Backend** | Fastify, Node.js | High-performance API server |
| **Database** | PostgreSQL, Prisma ORM | Structured data with relationships |
| **ML Engine** | Flask (Python), scikit-learn | AI/ML microservice |
| **Real-time** | WebSockets, Server-Sent Events | Live updates and notifications |
| **Hosting** | Vercel (Frontend), Railway/Render (Backend) | Scalable cloud deployment |
| **Design** | Figma, Tailwind UI | TAQA-branded design system |

### **🏗️ Application Architecture: One Codebase, Multiple Experiences**

```
📱 TAQA Anomaly Manager (Single Next.js Application)
├── 🖥️ Desktop Web Experience
│   ├── Manager Dashboard (Analytics, Team Management)
│   ├── Admin Panel (System Configuration, Imports)
│   └── Advanced Features (Bulk Operations, Reports)
├── 📱 Mobile Web Experience (PWA)
│   ├── Technician Interface (Touch-optimized)
│   ├── Voice Commands & Camera Integration
│   ├── Offline Capabilities & Sync
│   └── Field-optimized Workflows
└── 🔄 Shared Components & Logic
    ├── API Client & State Management
    ├── Authentication & Authorization
    ├── Real-time Updates & Notifications
    └── Data Models & Business Logic
```

## 🗂️ Data Sources

- **Oracle exports** of anomaly records
- **Maximo** maintenance data
- **Excel sheets** for important anomalies
- **Planning/maintenance** calendars
- **Manual inputs** from operators

## 📐 UI/UX Goals & Device Strategy

### **🖥️ Desktop Experience (Managers & Admins)**
- **Comprehensive Dashboards**: Multi-column layouts with detailed analytics
- **Advanced Interactions**: Hover states, keyboard shortcuts, drag & drop
- **Data-Rich Views**: Complex tables, charts, and reporting interfaces
- **Multi-tasking Support**: Side panels, modals, and tabbed interfaces
- **Professional Aesthetic**: Clean, corporate design following TAQA branding

### **📱 Mobile Experience (Field Technicians)**
- **Touch-First Design**: Large buttons (min 44px) for gloved hands
- **Thumb-Friendly Navigation**: Bottom navigation, swipe gestures
- **Voice Integration**: Hands-free operation with voice commands
- **Camera Integration**: Instant photo/video capture for anomaly documentation
- **GPS & Location**: Automatic location tagging and geofencing
- **Offline Capabilities**: Full functionality without internet connection
- **High Visibility**: High contrast modes for outdoor/harsh lighting conditions

### **🔄 Shared Design Principles**
- **TAQA Branding**: Navy, electric blue, white color scheme with mustard accents
- **Role-Based Interfaces**: UI adapts automatically based on user role and device
- **Dark/Light Modes**: Optimized for control rooms and field conditions
- **Accessibility**: WCAG 2.1 compliant with keyboard navigation support
- **Performance**: Sub-2-second load times on 3G connections
- **Internationalization**: Arabic, French, English language support

## 🔐 Security and Access (Optional)

- Authentication and user roles (Admin, Technician, Manager)
- Permissions to edit/delete/update anomaly records
- Secure file uploads (REX, attachments)

## 🚀 Expected Impact

- 🔒 **Increased operational safety** and faster response
- 🤝 **Better team collaboration** and transparency
- 📖 **Long-term knowledge base** through REX
- ⚡ **Efficient planning** and resource allocation
- 🔮 **Foundation for integrating** predictive analytics

## 🧪 Future Scope

- 🌐 Integrate IoT and sensor data to auto-detect anomalies
- 📱 Full mobile version for on-site input
- 🗣️ Natural language inputs for anomaly description
- 🔗 Integration with TAQA's ERP or CMMS systems
- 🗺️ Historical anomaly heatmaps or equipment failure trend analysis

## 🤝 Partners

- **TAQA Morocco** – Industrial sponsor and use case provider
- **1337 School (UM6P)** – Educational and innovation facilitator

## 💬 How to Use This README

This README can be used:
- 📚 As documentation for your GitHub repo
- 🎤 As a tech brief in your final presentation
- 👥 To onboard new team members
- 🎯 To structure your demo pitch and explain the value

## 🎨 TAQA Morocco Design Context

### Brand Identity & Visual Guidelines

**TAQA Global Brand**: Bold navy and electric blue, combining structured forms ("T"/"A") with circular, dynamic shapes in the wordmark—reflecting robustness, agility, and sustainable energy.

**TAQA Morocco**: Visual identity may include yellow, maroon, olive variations (local adaptations), though official TAQA colors align with the global palette.

**Digital Focus**: TAQA Morocco emphasizes industrial-grade, data-driven digital transformation: ESG reporting, digital supply-chain, e-monitoring, AI-based anomaly detection.

### 🚀 UI/UX Design Direction

**Color Palette**: 
- Primary: Navy, electric blue, and white
- Accent: #F59E19 (mustard) for energy dashboards
- Focus on high contrast and legibility

**Style**: 
- Clean, modern industrial dashboards
- Real-time data views with clear alert colors (red/yellow/green)
- Strong typography for technical environments

**Tone**: 
- Authoritative and technical, yet human-centered
- Predictive anomaly systems with clear technician guidance
- Lean, efficient workflows

## 🔍 Design Inspiration – Targeted Keywords

Use these search terms on Dribbble, Behance, Figma Community, and Pinterest:

### 🎛️ Industrial & Monitoring UI
- "industrial dashboard UI dark mode"
- "equipment monitoring interface"
- "plant operations dashboard"
- "industrial control panel design"
- "factory maintenance app UI"

### 📈 Data & Alerts Focus
- "real-time KPI dashboard"
- "emergency alert UI design"
- "anomaly detection dashboard"
- "critical alert system UI"
- "incident management app design"

### 🛠️ Technician/Field UX
- "field technician mobile UI"
- "tablet interface maintenance app"
- "on-site engineer UI dark mode"
- "maintenance scheduling UI design"

### 💡 Smart/AI-Driven Interfaces
- "predictive maintenance dashboard"
- "AI anomaly classification UI"
- "smart factory interface"
- "machine learning industrial UI"

### 🔧 Corporate & Industry Branding
- "energy company dashboard UI"
- "utilities dashboard design"
- "corporate industrial portal UI"
- "oil and gas dashboard UI"

---

## 🚀 Getting Started

### **Development Setup**

```bash
# Clone the repository
git clone <repository-url>
cd taqathon

# Frontend setup (Next.js with PWA)
cd software-front
npm install
npm run dev

# Backend setup (Fastify API)
cd ../backend  # When created
npm install
npm run dev

# Database setup (PostgreSQL)
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

### **Access Points**
- **🖥️ Desktop Web**: [http://localhost:3000](http://localhost:3000)
- **📱 Mobile Web**: Same URL, responsive design auto-detects mobile
- **🔧 API Server**: [http://localhost:8000](http://localhost:8000)
- **📊 Database**: PostgreSQL on localhost:5432

### **Demo Credentials**
```
👨‍💼 Manager: manager@taqa.ma / demo123
👨‍🔧 Technician: tech@taqa.ma / demo123  
⚙️ Admin: admin@taqa.ma / demo123
```

### **Mobile Testing**
```bash
# Test on mobile devices
npm run dev -- --host 0.0.0.0
# Access via your local IP: http://192.168.x.x:3000
```

---

*Built with ❤️ for TAQA Morocco's industrial excellence* 