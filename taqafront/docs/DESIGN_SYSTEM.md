# TAQA Morocco - Industrial Anomaly Manager Design System

> Complete visual design and UX documentation for the industrial anomaly management system, optimized for both field technicians and control room operations.

## 📋 Table of Contents

- [Brand Foundation](#-brand-foundation)
- [Color System](#-color-system)
- [Typography](#-typography)
- [Layout Architecture](#️-layout-architecture)
- [Component Library](#-component-library)
- [Responsive Design](#-responsive-design)
- [User Experience Patterns](#-user-experience-patterns)
- [Accessibility](#♿-accessibility)
- [Implementation Guidelines](#-implementation-guidelines)

---

## 🎨 Brand Foundation

### **Logo Analysis & Brand Identity**

The TAQA Morocco logo establishes our design foundation:
- **Primary Brand Color**: `#00A0DF` (Electric Blue)
- **Visual Language**: Geometric precision with circular dynamism
- **Typography Style**: Clean, technical sans-serif
- **Brand Personality**: Authoritative, technical, yet human-centered
- **Industrial Heritage**: Reflects robustness, agility, and sustainable energy

### **Design Philosophy**

**"Industrial Precision Meets Human Intuition"**

- **Authoritative**: Professional appearance that instills confidence
- **Technical**: Precise, data-driven interfaces for critical operations
- **Human-Centered**: Intuitive workflows that reduce cognitive load
- **Adaptive**: Responds to user context and device capabilities
- **Efficient**: Optimized for speed and accuracy in high-pressure situations

---

## 🎨 Color System

### **Primary Palette**

#### **Brand Colors**
```css
/* Primary Brand Colors */
--taqa-navy: #1e3a8a;           /* Professional authority */
--taqa-electric-blue: #00A0DF;   /* Brand primary (from logo) */
--taqa-white: #ffffff;           /* Clean, technical */
--taqa-mustard: #F59E19;         /* Energy accent */
```

#### **Alert & Status System**
```css
/* Criticality Levels */
--alert-critical: #dc2626;       /* Emergency red */
--alert-high: #f59e0b;          /* Warning amber */
--alert-medium: #0891b2;        /* Informational cyan */
--alert-low: #16a34a;           /* Safe green */

/* Functional Colors */
--color-success: #059669;        /* Confirmation actions */
--color-warning: #d97706;        /* Caution states */
--color-error: #dc2626;         /* Critical errors */
--color-info: #2563eb;          /* General information */
```

#### **Industrial Gray Scale**
```css
/* Neutral Grays */
--gray-50: #f9fafb;             /* Page backgrounds */
--gray-100: #f3f4f6;            /* Light backgrounds */
--gray-200: #e5e7eb;            /* Light borders */
--gray-400: #9ca3af;            /* Placeholder text */
--gray-600: #4b5563;            /* Secondary text */
--gray-700: #374151;            /* Borders, dividers */
--gray-800: #1f2937;            /* Cards, panels */
--gray-900: #111827;            /* Dark mode backgrounds */
```

### **Context-Specific Palettes**

#### **Control Room Mode (Dark Theme)**
```css
/* Dark Theme Variables */
--dark-background: #0f172a;      /* Deep navy background */
--dark-surface: #1e293b;         /* Slate gray surfaces */
--dark-text-primary: #f1f5f9;    /* Light gray text */
--dark-text-secondary: #cbd5e1;  /* Muted text */
--dark-border: #334155;          /* Subtle borders */
```

#### **Field Mode (High Contrast)**
```css
/* High Contrast Variables */
--field-background: #ffffff;     /* Maximum visibility */
--field-surface: #f8fafc;        /* Subtle gray */
--field-text: #0f172a;          /* Maximum contrast */
--field-border: #1e293b;        /* Strong borders */
```

---

## 📝 Typography

### **Font System**

#### **Primary Typeface: Inter**
```css
/* Inter - Modern, readable, technical */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
```

#### **Technical Typeface: JetBrains Mono**
```css
/* JetBrains Mono - Equipment IDs, measurements, data */
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500&display=swap');

--font-mono: 'JetBrains Mono', Consolas, 'Courier New', monospace;
```

#### **Arabic Support: Noto Sans Arabic**
```css
/* Arabic Language Support */
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@300;400;500;600;700&display=swap');

--font-arabic: 'Noto Sans Arabic', sans-serif;
```

### **Type Scale & Hierarchy**

```css
/* Type Scale */
--text-display: 48px / 56px;     /* Page headers, hero elements */
--text-h1: 36px / 44px;          /* Section headers */
--text-h2: 30px / 38px;          /* Subsection headers */
--text-h3: 24px / 32px;          /* Component headers */
--text-h4: 20px / 28px;          /* Card headers */
--text-body-lg: 18px / 28px;     /* Important body text */
--text-body: 16px / 24px;        /* Default body text */
--text-body-sm: 14px / 20px;     /* Secondary text */
--text-caption: 12px / 16px;     /* Labels, captions */

/* Font Weights */
--font-light: 300;
--font-regular: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### **Typography Usage Guidelines**

#### **Hierarchy Examples**
- **Page Titles**: Display / H1 - Bold weight
- **Section Headers**: H2 - Semibold weight
- **Card Headers**: H4 - Medium weight
- **Body Content**: Body - Regular weight
- **Equipment IDs**: Mono - Regular weight
- **Measurements**: Mono - Medium weight

---

## 🏗️ Layout Architecture

### **Grid System**

#### **Desktop Layout (1024px+)**
```css
/* Desktop Grid System */
.layout-desktop {
  display: grid;
  grid-template-areas: 
    "header header header"
    "sidebar main panel";
  grid-template-columns: 280px 1fr 320px;
  grid-template-rows: 64px 1fr;
  height: 100vh;
}

/* Layout Areas */
.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main { grid-area: main; }
.panel { grid-area: panel; }
```

#### **Mobile Layout (320px - 767px)**
```css
/* Mobile Grid System */
.layout-mobile {
  display: grid;
  grid-template-areas: 
    "header"
    "main"
    "navigation";
  grid-template-rows: 56px 1fr 60px;
  height: 100vh;
}
```

### **Spacing System**

```css
/* Spacing Scale (8px base unit) */
--space-0: 0px;
--space-1: 4px;      /* 0.25rem */
--space-2: 8px;      /* 0.5rem */
--space-3: 12px;     /* 0.75rem */
--space-4: 16px;     /* 1rem */
--space-5: 20px;     /* 1.25rem */
--space-6: 24px;     /* 1.5rem */
--space-8: 32px;     /* 2rem */
--space-10: 40px;    /* 2.5rem */
--space-12: 48px;    /* 3rem */
--space-16: 64px;    /* 4rem */
--space-20: 80px;    /* 5rem */
```

### **Container Sizes**

```css
/* Container Breakpoints */
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
--container-2xl: 1536px;
```

---

## 🧩 Component Library

### **Navigation Components**

#### **Desktop Sidebar Navigation**
```
Visual Structure:
├── Logo & Branding (240px height)
├── Main Navigation Items
│   ├── Dashboard (with badge for alerts)
│   ├── Anomalies (with count indicator)
│   ├── Maintenance (with schedule indicator)
│   ├── Analytics (with trend arrow)
│   └── REX Knowledge
├── Quick Filters Section
│   ├── My Assignments
│   ├── Critical Items
│   └── Recent Activity
└── System Status Footer
    ├── Connection Status
    ├── Sync Indicator
    └── User Profile
```

#### **Mobile Bottom Navigation**
```
Tab Structure:
├── Dashboard (🏠) - Home overview
├── Anomalies (⚠️) - List view with badge
├── Create (+) - Floating action style
├── REX (📚) - Knowledge base
└── Profile (👤) - User settings
```

### **Data Display Components**

#### **Anomaly Status Card**
```
Card Layout:
├── Header
│   ├── Priority Indicator (Color dot + animation)
│   ├── Anomaly ID (Monospace font)
│   └── Time Stamp (Relative time)
├── Content
│   ├── Title (Truncated with tooltip)
│   ├── Equipment Name (Link style)
│   ├── Description Preview (2 lines max)
│   └── Assigned Technician (Avatar + name)
├── Metadata
│   ├── Location (GPS icon + text)
│   ├── Category (Tag style)
│   └── Last Update (Time ago)
└── Actions
    ├── Quick Status Change (Mobile: swipe actions)
    ├── View Details (Button)
    └── Comment Count (Icon + number)
```

#### **Equipment Status Panel**
```
Panel Layout:
├── Equipment Header
│   ├── Equipment Icon (Based on type)
│   ├── Equipment Name
│   └── Status Indicator (LED style)
├── Health Metrics
│   ├── Health Score (Gauge chart)
│   ├── Last Maintenance (Date)
│   └── Next Scheduled (Countdown)
├── Recent Anomalies
│   ├── Count by Severity
│   └── Trend Indicator (↑↓→)
└── Quick Actions
    ├── Report Anomaly
    ├── Schedule Maintenance
    └── View History
```

### **Form Components**

#### **Anomaly Creation Form**
```
Form Structure:
├── Basic Information
│   ├── Title (Required text input)
│   ├── Equipment Selection (Searchable dropdown)
│   ├── Category (Radio buttons with icons)
│   └── Priority (Visual severity selector)
├── Description
│   ├── Text Area (Rich text, voice input available)
│   ├── Photo Capture (Camera integration)
│   └── Voice Notes (Audio recording)
├── Location & Context
│   ├── GPS Location (Auto-filled, editable)
│   ├── Work Area (Dropdown)
│   └── Environmental Conditions (Optional)
└── Assignment
    ├── Suggested Technician (AI recommendation)
    ├── Urgency Level (Timeline selector)
    └── Notify Others (Multi-select)
```

### **Alert & Status System**

#### **Status Indicators**
```css
/* Status Dot Styles */
.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}

.status-critical {
  background: var(--alert-critical);
  animation: pulse 2s infinite;
}

.status-high {
  background: var(--alert-high);
  box-shadow: 0 0 8px rgba(245, 158, 11, 0.4);
}

.status-resolved {
  background: var(--color-success);
  position: relative;
}

.status-resolved::after {
  content: "✓";
  position: absolute;
  color: white;
  font-size: 8px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

#### **Toast Notifications**
```
Notification Structure:
├── Icon (Status-specific)
├── Content
│   ├── Title (Bold, concise)
│   ├── Message (Description)
│   └── Timestamp (Small, muted)
├── Actions (Optional)
│   ├── Primary Action (Button)
│   └── Dismiss (X icon)
└── Progress Bar (Auto-dismiss timer)
```

---

## 📱 Responsive Design

### **Breakpoint Strategy**

#### **Mobile First Approach**
```css
/* Base styles: Mobile (320px+) */
.component {
  /* Mobile styles */
}

/* Tablet (768px+) */
@media (min-width: 768px) {
  .component {
    /* Tablet adaptations */
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .component {
    /* Desktop enhancements */
  }
}

/* Large Desktop (1440px+) */
@media (min-width: 1440px) {
  .component {
    /* Large screen optimizations */
  }
}
```

### **Component Responsiveness**

#### **Adaptive Navigation**
- **Mobile**: Bottom tab navigation (60px height)
- **Tablet**: Collapsible sidebar + top bar
- **Desktop**: Persistent sidebar (280px width)

#### **Data Tables → Card Lists**
```
Desktop Table:
├── Column Headers (Sortable)
├── Row Data (Dense information)
├── Inline Actions (Hover reveal)
└── Pagination (Traditional)

Mobile Card List:
├── Card Items (Touch-friendly)
├── Swipe Actions (Left/right gestures)
├── Pull-to-refresh (Standard mobile)
└── Infinite Scroll (Performance optimized)
```

#### **Touch Target Optimization**
```css
/* Minimum touch targets for mobile */
.touch-target {
  min-height: 44px;
  min-width: 44px;
  padding: 12px;
}

/* Enhanced targets for industrial use */
.industrial-touch {
  min-height: 56px;
  min-width: 56px;
  padding: 16px;
}
```

---

## 🎯 User Experience Patterns

### **Role-Based Interface Adaptation**

#### **👨‍🔧 Technician Interface**
```
Design Priorities:
├── Large Touch Targets (56px minimum)
├── High Contrast Colors (Outdoor visibility)
├── Voice-First Interactions (Hands-free operation)
├── Camera Integration (Quick documentation)
├── GPS Context (Location awareness)
├── Simplified Workflows (Single-purpose screens)
└── Offline Capabilities (Unreliable connectivity)
```

#### **👨‍💼 Manager Interface**
```
Design Priorities:
├── Information Density (Multiple data streams)
├── Analytics Focus (Charts and trends)
├── Multi-tasking Support (Split views)
├── Bulk Operations (Team management)
├── Advanced Filtering (Complex queries)
├── Export Capabilities (Reporting)
└── Real-time Monitoring (Live updates)
```

#### **⚙️ Admin Interface**
```
Design Priorities:
├── System Health Monitoring (Status dashboards)
├── Configuration Management (Settings panels)
├── User Administration (Role management)
├── Data Management (Import/export tools)
├── Security Controls (Access monitoring)
├── Performance Metrics (System analytics)
└── Audit Trails (Activity logs)
```

### **Interaction Patterns**

#### **Voice Command Integration**
```
Voice UX Flow:
├── Trigger Activation
│   ├── Button Press (Primary method)
│   ├── Gesture (Shake device)
│   └── Voice Wake Word (Optional)
├── Listening State
│   ├── Visual Feedback (Pulse animation)
│   ├── Audio Feedback (Beep confirmation)
│   └── Timeout Handling (Auto-cancel)
├── Processing State
│   ├── Loading Indicator (Processing)
│   ├── Confidence Display (AI certainty)
│   └── Correction Option (Edit result)
└── Action Confirmation
    ├── Preview Action (Show what will happen)
    ├── Confirm/Cancel (User validation)
    └── Execute Command (Complete action)
```

#### **Camera Integration Workflow**
```
Photo Capture Flow:
├── Access Request (Permission handling)
├── Camera Interface
│   ├── Viewfinder (Full screen)
│   ├── Capture Button (Large, accessible)
│   ├── Flash Toggle (Lighting control)
│   └── Gallery Access (Previous photos)
├── Photo Review
│   ├── Preview Display (Full resolution)
│   ├── Retake Option (Quality control)
│   ├── Add Notes (Text annotation)
│   └── Location Tag (GPS metadata)
└── Attachment Process
    ├── Auto-resize (Optimize for upload)
    ├── Quality Selection (Network-aware)
    ├── Upload Progress (Visual feedback)
    └── Confirmation (Success state)
```

### **Progressive Disclosure**

#### **Anomaly Detail View**
```
Information Hierarchy:
├── Level 1: Critical Info (Always visible)
│   ├── Status & Priority
│   ├── Equipment & Location
│   └── Assigned Technician
├── Level 2: Detailed Info (Expandable)
│   ├── Full Description
│   ├── Environmental Context
│   └── Related Documentation
├── Level 3: Historical Data (On-demand)
│   ├── Previous Similar Anomalies
│   ├── Equipment History
│   └── Resolution Patterns
└── Level 4: System Data (Technical)
    ├── Sensor Readings
    ├── Maintenance Records
    └── Configuration Details
```

---

## ♿ Accessibility

### **WCAG 2.1 Compliance**

#### **Color Contrast Requirements**
```css
/* AA Level Compliance (Minimum) */
--contrast-normal: 4.5:1;     /* Normal text */
--contrast-large: 3:1;        /* Large text (18px+) */

/* AAA Level Compliance (Enhanced) */
--contrast-normal-aaa: 7:1;   /* Normal text */
--contrast-large-aaa: 4.5:1;  /* Large text */
```

#### **Focus Management**
```css
/* Visible focus indicators */
.focus-visible {
  outline: 2px solid var(--taqa-electric-blue);
  outline-offset: 2px;
  border-radius: 4px;
}

/* Skip navigation for keyboard users */
.skip-nav {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--taqa-navy);
  color: white;
  padding: 8px;
  text-decoration: none;
  transition: top 0.3s;
}

.skip-nav:focus {
  top: 6px;
}
```

#### **Screen Reader Support**
```html
<!-- Semantic HTML structure -->
<main role="main" aria-label="Anomaly Management Dashboard">
  <section aria-labelledby="active-anomalies">
    <h2 id="active-anomalies">Active Anomalies</h2>
    <!-- Content -->
  </section>
</main>

<!-- ARIA labels for complex widgets -->
<button 
  aria-label="Mark anomaly as critical priority"
  aria-describedby="priority-help"
>
  Set Critical
</button>
<div id="priority-help" class="sr-only">
  This will notify all managers immediately
</div>
```

### **Multi-language Support**

#### **RTL (Right-to-Left) Layout**
```css
/* RTL layout support for Arabic */
[dir="rtl"] .layout {
  direction: rtl;
}

[dir="rtl"] .sidebar {
  right: 0;
  left: auto;
}

[dir="rtl"] .text-align-start {
  text-align: right;
}

/* Logical properties for better RTL support */
.margin-inline-start {
  margin-inline-start: var(--space-4);
}
```

---

## 🛠️ Implementation Guidelines

### **CSS Architecture**

#### **Design Token Structure**
```css
/* tokens.css - Design system foundation */
:root {
  /* Colors */
  --color-primary: var(--taqa-electric-blue);
  --color-secondary: var(--taqa-navy);
  
  /* Typography */
  --font-family-base: var(--font-primary);
  --font-size-base: var(--text-body);
  
  /* Spacing */
  --spacing-unit: 8px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  
  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;
  
  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;
  --transition-slow: 350ms ease;
}
```

#### **Component CSS Structure**
```css
/* BEM Methodology for components */
.anomaly-card {
  /* Block styles */
}

.anomaly-card__header {
  /* Element styles */
}

.anomaly-card__header--critical {
  /* Modifier styles */
}

/* Utility classes for common patterns */
.text-critical { color: var(--alert-critical); }
.bg-surface { background: var(--gray-50); }
.rounded { border-radius: var(--radius-md); }
.shadow { box-shadow: var(--shadow-md); }
```

### **Component Implementation Patterns**

#### **React Component Structure**
```typescript
// TypeScript interface for design consistency
interface AnomalyCardProps {
  anomaly: Anomaly;
  variant?: 'compact' | 'detailed';
  showActions?: boolean;
  onStatusChange?: (status: Status) => void;
  className?: string;
}

// Styled component with design system
const AnomalyCard: React.FC<AnomalyCardProps> = ({
  anomaly,
  variant = 'detailed',
  showActions = true,
  onStatusChange,
  className
}) => {
  return (
    <div className={cn(
      'anomaly-card',
      `anomaly-card--${variant}`,
      className
    )}>
      {/* Component implementation */}
    </div>
  );
};
```

### **Performance Optimization**

#### **Critical CSS Strategy**
```css
/* Critical above-the-fold styles */
.critical-css {
  /* Layout fundamentals */
  /* Typography basics */
  /* Color system */
  /* Component shells */
}

/* Non-critical styles loaded asynchronously */
.enhanced-styles {
  /* Animations */
  /* Advanced interactions */
  /* Non-essential decorations */
}
```

#### **Image Optimization**
```html
<!-- Responsive images with modern formats -->
<picture>
  <source 
    srcset="equipment-photo.webp" 
    type="image/webp"
  />
  <img 
    src="equipment-photo.jpg" 
    alt="Turbine bearing anomaly location"
    loading="lazy"
    width="300"
    height="200"
  />
</picture>
```

### **Dark Mode Implementation**

#### **CSS Custom Properties Strategy**
```css
/* Light mode (default) */
:root {
  --bg-primary: var(--gray-50);
  --bg-secondary: var(--gray-100);
  --text-primary: var(--gray-900);
  --text-secondary: var(--gray-600);
}

/* Dark mode */
[data-theme="dark"] {
  --bg-primary: var(--dark-background);
  --bg-secondary: var(--dark-surface);
  --text-primary: var(--dark-text-primary);
  --text-secondary: var(--dark-text-secondary);
}

/* Component usage */
.component {
  background: var(--bg-primary);
  color: var(--text-primary);
}
```

---

## 🎯 Design Principles Summary

### **Visual Hierarchy**
1. **Critical information first** - Safety and urgency prioritized
2. **Progressive disclosure** - Information revealed as needed
3. **Consistent patterns** - Reduce cognitive load through familiarity
4. **Context-aware design** - Interface adapts to user role and device

### **Interaction Design**
1. **Fault-tolerant** - Prevent and recover from errors gracefully
2. **Feedback-rich** - Clear indication of system state and user actions
3. **Efficiency-focused** - Minimize steps for common tasks
4. **Accessibility-first** - Inclusive design for all users

### **Visual Design**
1. **Industrial aesthetic** - Professional, technical, trustworthy
2. **High contrast** - Visible in various lighting conditions
3. **Brand consistent** - Reinforces TAQA identity throughout
4. **Device optimized** - Native feel on each platform

This design system creates a cohesive, professional, and highly functional interface that serves the critical operational needs of TAQA Morocco while providing an excellent user experience across all devices and user roles.