# Maintenance Periods Management - User Guide

## Overview

The **Maintenance Periods Management** page is a comprehensive tool for planning and managing maintenance schedules with real-time energy impact calculation. This system helps operators visualize, create, and manage maintenance periods while understanding their energy production costs.

## 🎯 Key Features

### 1. **Interactive Calendar Planning**
- Visual calendar interface for selecting maintenance dates
- Year and month view modes for different planning horizons
- Real-time date selection with visual feedback
- Automatic prevention of past date selection

### 2. **Energy Impact Calculation**
- Real-time calculation of energy loss (315 MW per hour)
- Display in both MW and GWh units
- Visual warnings for high-impact periods
- Integrated cost awareness in decision making

### 3. **Professional Period Management**
- Clean card-based period display
- Edit and delete functionality
- Professional TailAdmin UI components
- Responsive design for all devices

## 📊 Dashboard Statistics

The page displays four key metrics at the top:

### **Total Périodes**
- Shows the total number of planned maintenance periods
- Includes percentage change from previous month

### **Disponibilité**
- Calculates operational availability as: `100% - (total maintenance days / 365 * 100)`
- Shows the percentage of time the system is operational
- Displays availability loss as negative percentage

### **Réservées**
- Count of periods that are confirmed/booked
- Helps track committed vs. planned maintenance

### **Total Jours**
- Sum of all maintenance days across all periods
- Shows total operational impact in days

## 📅 Calendar Interface

### **View Modes**
- **Year View**: Overview of entire year with monthly grids
- **Month View**: Detailed daily view for precise planning

### **Date Selection Process**
1. **Click start date** - Begins period selection
2. **Click end date** - Completes range selection
3. **Same date twice** - Creates single-day period
4. **Form opens automatically** - Configure period details

### **Visual Indicators**
- **Blue dates**: Selected period ranges
- **Animated dots**: Existing maintenance periods
- **Gray dates**: Past dates (non-selectable)
- **Bold dates**: Period start/end points
- **Connected styling**: Visual range connections

### **Legend**
- 🔵 **Période planifiée**: Scheduled maintenance periods
- ⚪ **Indicateur de période**: Animated period indicators
- ⚫ **Aujourd'hui**: Current date marker

## ✏️ Period Creation & Editing

### **Creation Process**
1. Select dates on calendar
2. Form modal opens automatically
3. Enter period title
4. Review energy impact
5. Save to create period

### **Form Fields**
- **Titre de la période**: Descriptive name for the maintenance period
  - Auto-generated default based on dates
  - Customizable for better identification

### **Energy Impact Display**
The form shows comprehensive energy impact information:

#### **Period Information**
- **Période**: Start and end dates with arrow indicator
- **Durée**: Duration in days and hours

#### **Energy Loss Calculation**
- **Perte énergétique**: Total MW lost (days × 24 × 315 MW)
- **Équivalent**: Converted to GWh for better readability
- **Calculation basis**: 315 MW/hour production capacity

#### **Visual Design**
- Warning-style card with gradient background
- Red color scheme to emphasize impact
- Professional badges for energy values
- Responsive grid layout

### **Form Actions**
- **Annuler**: Cancel and close form
- **Créer la période**: Save new period
- **Modifier**: Update existing period

## 📋 Periods Management

### **Period Display**
Each period is shown in a professional card format containing:

#### **Header Information**
- **Period title** with "Période" badge
- **Edit** and **Delete** action buttons

#### **Period Details**
- **📅 Date range**: Start to end dates in French format
- **⏱️ Duration**: Days and hours with proper pluralization
- **⚡ Energy loss**: MW impact with red highlighting
- **🔋 Equivalent**: GWh conversion for scale understanding

#### **Card Features**
- Hover effects with shadow transitions
- Professional TailAdmin styling
- Responsive grid layout for period details
- Clean typography hierarchy

### **Available Actions**

#### **✏️ Modifier (Edit)**
- Opens the same form used for creation
- Pre-fills with existing period data
- Updates period when saved
- Shows "Modifier" button text

#### **🗑️ Supprimer (Delete)**
- Immediately removes period from system
- No confirmation dialog (direct action)
- Updates statistics automatically
- Red styling to indicate destructive action

### **Bulk Operations**
- **Tout Disponible**: Mark all periods as available
- **Tout Supprimer**: Remove all periods
- **Exporter**: Download periods as JSON file
- **Importer**: Upload periods from JSON file

## 🔄 User Interaction Flow

### **Typical Workflow**
1. **Review statistics** to understand current maintenance load
2. **Switch calendar view** (year/month) based on planning horizon
3. **Select dates** for new maintenance period
4. **Review energy impact** in the form
5. **Customize period title** if needed
6. **Save period** to add to schedule
7. **Manage existing periods** using edit/delete actions

### **Selection Feedback**
- **Real-time visual feedback** during date selection
- **Selection summary bar** showing start/end dates and duration
- **Cancel option** with ✕ button in summary bar
- **Helpful instruction text** guiding user actions

### **Success Notifications**
- **Green notification banner** appears after period creation/editing
- **Auto-dismiss** after 3 seconds
- **Detailed message** with period name and duration

## 🎨 Design Features

### **TailAdmin Integration**
- Professional form components with proper validation styling
- Consistent button variants (primary/outline)
- Professional modal with backdrop blur
- Responsive grid layouts
- Dark mode support throughout

### **Visual Hierarchy**
- Clear section separation with proper spacing
- Consistent typography scale
- Professional color scheme
- Proper contrast ratios for accessibility

### **Responsive Design**
- Mobile-first approach
- Adaptive layouts for all screen sizes
- Touch-friendly button sizes
- Optimized spacing for different devices

## ⚡ Energy Calculation Details

### **Formula**
```
Energy Loss (MW) = Duration (hours) × 315 MW/hour
Energy Loss (GWh) = Energy Loss (MW) ÷ 1000
```

### **Examples**
- **1 day**: 24h × 315 MW = 7,560 MW (7.56 GWh)
- **1 week**: 168h × 315 MW = 52,920 MW (52.92 GWh)
- **1 month**: 720h × 315 MW = 226,800 MW (226.8 GWh)

### **Impact on Availability**
```
Availability = 100% - (Total Maintenance Days ÷ 365 × 100%)
```

## 🔧 Technical Features

### **State Management**
- Real-time updates across all components
- Automatic statistics recalculation
- Persistent selection state during interaction
- Clean state reset after operations

### **Data Handling**
- JSON export/import functionality
- Automatic ID generation for periods
- Date validation and formatting
- Error handling for invalid operations

### **Performance Optimizations**
- Efficient calendar rendering
- Optimized re-renders with React hooks
- Smooth animations and transitions
- Responsive user feedback

## 📱 Accessibility Features

- **Keyboard navigation** support
- **Screen reader** compatible
- **High contrast** color schemes
- **Touch-friendly** interactive elements
- **Clear visual indicators** for all states

## 🚀 Future Enhancements

The system is designed to integrate with backend APIs for:
- **Real-time data synchronization**
- **Multi-user collaboration**
- **Historical period tracking**
- **Advanced reporting features**
- **Integration with maintenance systems**

---

*This maintenance periods management system provides a comprehensive solution for planning maintenance schedules while maintaining full awareness of energy production impacts.* 