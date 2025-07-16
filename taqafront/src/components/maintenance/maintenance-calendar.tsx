"use client";

import React, { useState, useEffect } from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  AlertTriangle, 
  Calendar,
  CalendarDays,
  CalendarPlus,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit,
  Loader2,
  MapPin,
  RefreshCw,
  Shield,
  Trash2,
  Wrench,
  Zap,
  X
} from "lucide-react";
import { MaintenanceService } from "@/lib/services/maintenance-service";
import { SlotService, Slot } from "@/lib/services/slot-service";
import { MaintenancePeriod } from "@/types/maintenance-actions";
import { Anomaly as DatabaseAnomaly } from "@/types/database-types";
import { AnomalyService } from "@/lib/services/anomaly-service";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import SuccessAlertModal from "@/components/ui/SuccessAlertModal";
import { useRouter } from 'next/navigation';
import { AuthService } from '@/lib/auth';

// Types
interface MaintenanceEvent {
  id?: string;  // Optional for new events
  title: string;
  type: "maintenance" | "anomaly";
  priority: string;  // Match backend type
  equipment: string;
  technician: string;
  location: string;
  description: string;
  estimatedDuration: number;
  status: string;  // Match backend type
  date: string;
  time: string;
  anomalyId?: string;
  maintenancePeriodId?: string;  // Optional
}

interface LocalAnomaly {
  id: string;
  title: string;
  priority: "critical" | "medium" | "low";
  equipment: string;
  location: string;
  description: string;
  estimatedRepairTime: number;
  reportedAt: Date;
  requiredSkills: string[];
  status: "open" | "assigned" | "in_progress" | "resolved";
}

interface Anomaly {
  id: string;
  title: string;
  description: string;
  equipment: string;
  priority: "critical" | "medium" | "low";
  status: "open" | "assigned" | "in_progress" | "resolved";
  estimatedRepairTime: number;
  reportedAt: Date;
  requiredSkills: string[];
}

interface MaintenanceSelectionProps {
  selectedDates: Date[];
  selectedAnomaly: Anomaly | null;
  onClearSelection: () => void;
  onScheduleMaintenance: () => void;
}

interface CalendarDay {
  date: number;
  dateStr: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  isPastDate: boolean;
  events: MaintenanceEvent[];
  availability: {
    isAvailable: boolean;
    occupiedHours: number;
    remainingHours: number;
    hasHighPriority: boolean;
    isInMaintenancePeriod: boolean;
  };
}

type WindowType = 'planned' | 'emergency' | 'opportunistic';

// Define priority colors type
type PriorityColors = {
  [key: string]: { bg: string; text: string; border: string };
};

const priorityColors: PriorityColors = {
  critical: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  medium: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  low: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' }
};

const MaintenanceCalendar: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<MaintenanceEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnomalyModalOpen, setIsAnomalyModalOpen] = useState(false);
  const [events, setEvents] = useState<MaintenanceEvent[]>([]);
  const [anomalies, setAnomalies] = useState<LocalAnomaly[]>([]);
  const [isLoadingAnomalies, setIsLoadingAnomalies] = useState(false);
  const [selectedAnomaly, setSelectedAnomaly] = useState<LocalAnomaly | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  // Backend integration state
  const [maintenancePeriods, setMaintenancePeriods] = useState<MaintenancePeriod[]>([]);
  const [isLoadingPeriods, setIsLoadingPeriods] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Multi-date selection state
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [isMultiDateMode, setIsMultiDateMode] = useState(false);
  const [currentPeriodIndex, setCurrentPeriodIndex] = useState(0);
  const [filteredPeriods, setFilteredPeriods] = useState<MaintenancePeriod[]>([]);

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    type: "maintenance" as "maintenance" | "anomaly",
    priority: "medium" as "critical" | "medium" | "low",
    equipment: "",
    technician: "",
    location: "",
    description: "",
    estimatedDuration: 2,
    date: "",
    time: "09:00"
  });

  const typeColors = {
    maintenance: { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-500" },
    anomaly: { bg: "bg-red-100", text: "text-red-800", border: "border-red-500" }
  };

  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: "", message: "" });

  const router = useRouter();

  // Load maintenance periods from backend
  const loadMaintenancePeriods = async () => {
    setIsLoadingPeriods(true);
    setError(null);
    
    try {
      console.log('Loading maintenance periods...');
      const response = await MaintenanceService.getMaintenancePeriods();
      console.log('Loaded maintenance periods:', response);
      
      if (response && response.data) {
        setMaintenancePeriods(response.data);
        setFilteredPeriods(response.data.filter(p => p.status === 'available'));
        
        // Update events state to reflect new maintenance periods
        const updatedEvents: MaintenanceEvent[] = response.data.map(period => ({
          id: period.id,
          title: period.title,
          type: "maintenance",
          priority: "medium",
          equipment: period.location || "Équipement non spécifié",
          technician: "",
          location: period.location || "",
          description: period.description || "",
          estimatedDuration: 2,
          status: "planned",
          date: new Date(period.startDate).toISOString().split('T')[0],
          time: new Date(period.startDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          maintenancePeriodId: period.id
        }));
        
        setEvents(updatedEvents);
      }
    } catch (error) {
      console.error('Failed to load maintenance periods:', error);
      setError('Erreur lors du chargement des périodes de maintenance');
    } finally {
      setIsLoadingPeriods(false);
    }
  };

  // Filter periods based on anomaly requirements
  const filterPeriodsForAnomaly = (anomaly: LocalAnomaly) => {
    const availablePeriods = maintenancePeriods.filter(period => {
      if (period.status !== 'available') return false;
      return true; // Accept all available periods, no duration check needed
    });
    
    // Sort periods by urgency based on anomaly priority
    const sortedPeriods = availablePeriods.sort((a, b) => {
      const dateA = new Date(a.startDate);
      const dateB = new Date(b.startDate);
      
      if (anomaly.priority === 'critical') {
        // Critical anomalies: prioritize earliest dates
        return dateA.getTime() - dateB.getTime();
      } else {
        // Non-critical: can be more flexible
        return dateA.getTime() - dateB.getTime();
      }
    });
    
    setFilteredPeriods(sortedPeriods);
    setCurrentPeriodIndex(0);
  };

  // Navigate between available periods
  const navigatePeriod = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentPeriodIndex > 0) {
      setCurrentPeriodIndex(currentPeriodIndex - 1);
    } else if (direction === 'next' && currentPeriodIndex < filteredPeriods.length - 1) {
      setCurrentPeriodIndex(currentPeriodIndex + 1);
    }
  };

  // Get current period being viewed
  const getCurrentPeriod = () => {
    return filteredPeriods[currentPeriodIndex] || null;
  };

  // Load critical anomalies from API
  const loadCriticalAnomalies = async () => {
    setIsLoadingAnomalies(true);
    try {
      const response = await AnomalyService.getCriticalAnomalies();
      console.log('Loaded critical anomalies:', response);
      
      // Transform API anomalies to local format
      const transformedAnomalies: LocalAnomaly[] = response.data.map(anomaly => {
        // Get equipment and zone info safely
        const equipmentName = anomaly.equipment?.name || 'Équipement non spécifié';
        const zoneName = anomaly.equipment?.zone?.name || 'Zone non spécifiée';
        
        return {
          id: anomaly.id,
          title: anomaly.title,
          priority: anomaly.severity as "critical" | "high" | "medium" | "low",
          equipment: equipmentName,
          location: zoneName,
          description: anomaly.description,
          estimatedRepairTime: anomaly.downtimeHours || 2, // Default to 2 hours if not specified
          reportedAt: new Date(anomaly.reportedAt),
          requiredSkills: [], // We don't have this in the API yet
          status: anomaly.status === 'new' ? 'open' : 
                  anomaly.status === 'in_progress' ? 'in_progress' : 
                  anomaly.status === 'resolved' || anomaly.status === 'closed' ? 'resolved' : 
                  'open'
        };
      });
      
      setAnomalies(transformedAnomalies);
    } catch (error) {
      console.error('Failed to load critical anomalies:', error);
      setError('Erreur lors du chargement des anomalies critiques');
    } finally {
      setIsLoadingAnomalies(false);
    }
  };

  // Update loadSlots function
  const loadSlots = async () => {
    setIsLoading(true);
    try {
      console.log('Loading slots...');
      const response = await SlotService.getSlots();
      console.log('Loaded slots:', response);
      
      if (!response.success || !response.data) {
        throw new Error('Failed to load slots');
      }
      
      // Transform slots to MaintenanceEvent format
      const transformedEvents = response.data
        .filter(slot => {
          if (!slot.scheduledAt) {
            console.warn('Slot missing scheduledAt:', slot);
            return false;
          }
          return true;
        })
        .map(slot => {
          const scheduledDate = new Date(slot.scheduledAt);
          const event: MaintenanceEvent = {
            id: slot.id,
            title: slot.title,
            type: slot.windowType === 'emergency' ? 'anomaly' : 'maintenance',
            priority: slot.priority,
            equipment: slot.anomaly?.equipment?.name || '',
            technician: slot.assignedTo?.name || '',
            location: '',  // No location in backend
            description: slot.description || '',
            estimatedDuration: slot.estimatedDuration || 0,
            status: slot.status,
            date: scheduledDate.toISOString().split('T')[0],
            time: scheduledDate.toISOString().split('T')[1].substring(0, 5),
            anomalyId: slot.anomalyId,
            maintenancePeriodId: slot.maintenancePeriodId
          };
          return event;
        });

      setEvents(transformedEvents);
    } catch (error) {
      console.error('Error loading slots:', error);
      toast({
        title: "Error",
        description: "Failed to load maintenance events",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add authentication check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuthenticated = AuthService.isAuthenticated();
        if (!isAuthenticated) {
          console.log('User not authenticated, redirecting to login');
          router.push('/auth/login');
          return;
        }

        // Verify token is still valid
        const user = await AuthService.verifyToken();
        if (!user) {
          console.log('Token verification failed, redirecting to login');
          router.push('/auth/login');
          return;
        }

        // Load data only if authenticated
        await Promise.all([
          loadMaintenancePeriods(),
          loadCriticalAnomalies(),
          loadSlots()
        ]);
      } catch (error) {
        console.error('Auth check failed:', error);
        setError('Erreur d\'authentification');
        router.push('/auth/login');
      }
    };

    checkAuth();
  }, [router]);

  const handleDateClick = (date: string) => {
    if (isMultiDateMode) {
      // Multi-date selection mode
      const isAlreadySelected = selectedDates.some(d => d.toISOString() === date);
      if (isAlreadySelected) {
        setSelectedDates(selectedDates.filter(d => d.toISOString() !== date));
      } else {
        setSelectedDates([...selectedDates, new Date(date)]);
      }
    } else {
      // Single date selection mode
    setSelectedDate(date);
    resetForm();
    setFormData(prev => ({ ...prev, date, time: "09:00" }));
      setIsModalOpen(true);
    }
  };

  // Handle multi-date scheduling
  const handleMultiDateScheduling = () => {
    if (selectedDates.length === 0) {
      alert('Veuillez sélectionner au moins une date');
      return;
    }
    
    setFormData(prev => ({ 
      ...prev, 
      date: selectedDates[0].toISOString().split('T')[0], // Use first selected date as primary
      time: "09:00" 
    }));
    setIsModalOpen(true);
  };

  // Update handleSaveEvent function to handle undefined maintenancePeriodId
  const handleSaveEvent = async (formData: MaintenanceEvent) => {
    try {
      setIsLoading(true);
      
      if (!selectedAnomaly?.id) {
        throw new Error('An anomaly must be selected to create a slot');
      }

      // Parse the date string to a Date object
      const startDate = new Date(`${formData.date}T${formData.time}`);
      if (isNaN(startDate.getTime())) {
        throw new Error('Invalid date format');
      }

      const windowType = selectedAnomaly.priority === 'critical' ? 'emergency' as const : 'planned' as const;
      const currentPeriod = getCurrentPeriod();
      
      const slotData = {
        title: formData.title,
        description: formData.description || undefined,
        anomalyId: selectedAnomaly.id,
        estimatedDuration: formData.estimatedDuration,
        priority: selectedAnomaly.priority as string,  // Type assertion
        windowType,
        maintenancePeriodId: currentPeriod?.id,
        scheduledAt: startDate.toISOString(),
        downtime: false,
        safetyPrecautions: [] as string[],
        resourcesNeeded: [] as string[],
        productionImpact: false
      };

      console.log('Creating slot with data:', slotData);
      const response = await SlotService.createSlot(slotData);
      console.log('Slot created:', response);

      if (!response.success) {
        throw new Error('Failed to create slot');
      }

      const slot = response.data;
      const scheduledDate = slot.scheduledAt ? new Date(slot.scheduledAt) : startDate;

      // Transform the created slot back to a MaintenanceEvent
      const newEvent: MaintenanceEvent = {
        id: slot.id,
        title: slot.title,
        type: slot.windowType === 'emergency' ? 'anomaly' : 'maintenance',
        priority: slot.priority,
        equipment: slot.anomaly?.equipment?.name || '',
        technician: slot.assignedTo?.name || '',
        location: '',  // No location in backend
        description: slot.description || '',
        estimatedDuration: slot.estimatedDuration || 0,
        status: slot.status,
        date: scheduledDate.toISOString().split('T')[0],
        time: scheduledDate.toISOString().split('T')[1].substring(0, 5),
        anomalyId: slot.anomalyId,
        maintenancePeriodId: slot.maintenancePeriodId
      };

      setEvents(prev => [...prev, newEvent]);
      toast({
        title: "Success",
        description: "Maintenance event created successfully",
        variant: "default"
      });
    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save maintenance event",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsModalOpen(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (selectedEvent) {
      setIsLoading(true);
      try {
        await SlotService.deleteSlot(selectedEvent.id);
        await loadSlots(); // Refresh data
        setIsModalOpen(false);
        resetForm();
        
        toast({
          title: "Succès",
          description: "L'intervention a été supprimée avec succès.",
          variant: "default"
        });
      } catch (error) {
        console.error('Error deleting slot:', error);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la suppression de l'intervention.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      type: "maintenance",
      priority: selectedAnomaly?.priority || "medium", // Preserve priority if from anomaly
      equipment: "",
      technician: "",
      location: "",
      description: "",
      estimatedDuration: 2,
      date: "",
      time: "09:00"
    });
    // Don't reset selectedAnomaly here if we want to preserve it
    setSelectedEvent(null);
    setSelectedDates([]);
    setIsMultiDateMode(false);
    setCurrentPeriodIndex(0);
  };

  // Find the earliest available time slot for critical anomalies
  const findEarliestAvailableSlot = (estimatedDuration: number) => {
    const now = new Date();
    
    // For critical anomalies, try to find immediate slot today first
    const today = now.toISOString().split('T')[0];
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    
    // If it's before 6:00 AM, start from 6:00, otherwise start from current hour
    let startHour = currentHour < 6 ? 6 : currentHour;
    
    // If we're past 30 minutes in the hour, start from next hour
    if (currentMinutes > 30) {
      startHour += 1;
    }
    
    // Check from current time for the next 7 days
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const checkDate = new Date(now);
      checkDate.setDate(now.getDate() + dayOffset);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      const dayEvents = events.filter(event => event.date === dateStr);
      
      // For today, start from current/next hour, for other days start from 6:00
      const hourStart = dayOffset === 0 ? startHour : 6;
      const hourEnd = Math.min(23, 24 - estimatedDuration);
      
      // Check each hour of the day for availability
      for (let hour = hourStart; hour <= hourEnd; hour++) {
        const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
        
        // Check if this time slot conflicts with existing events
        let hasConflict = false;
        let conflictingEvents = [];
        
        for (const event of dayEvents) {
          const eventStart = parseInt(event.time.split(':')[0]);
          const eventEnd = eventStart + event.estimatedDuration;
          const slotEnd = hour + estimatedDuration;
          
          // Check for overlap
          if ((hour >= eventStart && hour < eventEnd) || 
              (slotEnd > eventStart && slotEnd <= eventEnd) ||
              (hour <= eventStart && slotEnd >= eventEnd)) {
            hasConflict = true;
            conflictingEvents.push(event);
          }
        }
        
        if (!hasConflict) {
          return {
            date: dateStr,
            time: timeSlot,
            isImmediate: dayOffset === 0 && hour <= currentHour + 1
          };
        }
        
        // For critical anomalies, if we find conflicts with non-critical events, 
        // we could potentially override them (just document this for now)
        if (hasConflict && dayOffset === 0) {
          const canOverride = conflictingEvents.every(event => 
            event.priority !== "critical" && event.type !== "anomaly"
          );
          
          if (canOverride && hour <= currentHour + 2) {
            return {
              date: dateStr,
              time: timeSlot,
              isImmediate: true,
              overridesExisting: true,
              conflictingEvents
            };
          }
        }
      }
    }
    
    // If no slot found in next 7 days, return null
    return null;
  };

  // Get suggested available dates for repair based on priority
  const getSuggestedRepairDates = (priority: string, estimatedDuration: number) => {
    const today = new Date();
    const suggestions = [];
    
    // Check next 30 days for availability
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() + i);
      const dateStr = checkDate.toISOString().split('T')[0];
      const availability = checkDateAvailability(dateStr);
      
      // Only suggest dates that have enough capacity
      if (availability.remainingHours >= estimatedDuration) {
        const urgencyScore = priority === "critical" ? i * 10 : 
                           priority === "high" ? i * 5 : 
                           priority === "medium" ? i * 2 : i;
        
        suggestions.push({
          date: dateStr,
          dayName: checkDate.toLocaleDateString('fr-FR', { weekday: 'long' }),
          dateDisplay: checkDate.toLocaleDateString('fr-FR'),
          availability,
          urgencyScore,
          isToday: i === 0,
          isTomorrow: i === 1
        });
      }
    }
    
    // Sort by urgency score (lower is better) and availability
    return suggestions
      .sort((a, b) => a.urgencyScore - b.urgencyScore || b.availability.remainingHours - a.availability.remainingHours)
      .slice(0, 6); // Show top 6 suggestions
  };

  const [criticalSlotInfo, setCriticalSlotInfo] = useState<any>(null);

  const handleScheduleAnomaly = (anomaly: LocalAnomaly) => {
    // Filter available periods for this anomaly
    filterPeriodsForAnomaly(anomaly);
    
    // Enable multi-date mode for complex repairs
    const isComplexRepair = anomaly.estimatedRepairTime >= 8 || anomaly.priority === 'critical';
    setIsMultiDateMode(isComplexRepair);
    
    let selectedDate = "";
    let selectedTime = "09:00";
    let slotInfo = null;
    
    // For critical anomalies, automatically find the earliest available slot
    if (anomaly.priority === "critical") {
      const earliestSlot = findEarliestAvailableSlot(anomaly.estimatedRepairTime);
      if (earliestSlot) {
        selectedDate = earliestSlot.date;
        selectedTime = earliestSlot.time;
        slotInfo = earliestSlot;
      }
    }
    
    setFormData({
      title: `Réparation - ${anomaly.title}`,
      type: "anomaly",
      priority: anomaly.priority, // Ensure we use the anomaly's priority
      equipment: anomaly.equipment,
      technician: "",
      location: anomaly.location,
      description: anomaly.description,
      estimatedDuration: anomaly.estimatedRepairTime,
      date: selectedDate,
      time: selectedTime
    });
    
    setSelectedAnomaly(anomaly);
    setCriticalSlotInfo(slotInfo);
    setIsAnomalyModalOpen(false);
    
    // If multi-date mode, don't open the form immediately - let user select dates first
    if (!isComplexRepair) {
      setIsModalOpen(true);
    }
  };

  const handleEditEvent = (event: MaintenanceEvent) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      type: event.type,
      priority: event.priority,
      equipment: event.equipment,
      technician: event.technician,
      location: event.location,
      description: event.description,
      estimatedDuration: event.estimatedDuration,
      date: event.date,
      time: event.time
    });
    setIsModalOpen(true);
  };

  // Check if a date is available for scheduling based on maintenance periods
  const checkDateAvailability = (dateStr: string) => {
    // Check if date falls within any maintenance period
    const isInMaintenancePeriod = maintenancePeriods.some(period => {
      const startDate = new Date(period.startDate).toISOString().split('T')[0];
      const endDate = new Date(period.endDate).toISOString().split('T')[0];
      return dateStr >= startDate && dateStr <= endDate && period.status === 'available';
    });
    
    // Get events for this date
    const dayEvents = events.filter(event => event.date === dateStr);
    const criticalEvents = dayEvents.filter(event => event.priority === "critical");
    
    return {
      isAvailable: isInMaintenancePeriod, // Only check if it's in a maintenance period
      occupiedHours: 0, // We don't limit hours anymore
      remainingHours: 24, // Always show as having full hours available
      hasHighPriority: criticalEvents.length > 0,
      isInMaintenancePeriod
    };
  };

  // Calendar generation - adjusted for multi-date mode
  const generateCalendar = () => {
    const days: CalendarDay[] = [];
    const currentDateStr = new Date().toISOString().split('T')[0];

    if (isMultiDateMode && getCurrentPeriod()) {
      // Generate calendar for the current maintenance period
      const period = getCurrentPeriod()!;
      const startDate = new Date(period.startDate);
      const endDate = new Date(period.endDate);
      
      // Find the first day of the month containing the period start
      const firstMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      const calendarStart = new Date(firstMonth);
      calendarStart.setDate(calendarStart.getDate() - firstMonth.getDay());
      
      // Generate enough days to cover the entire period
      const daysDiff = Math.ceil((endDate.getTime() - calendarStart.getTime()) / (1000 * 60 * 60 * 24));
      const totalDays = Math.max(42, Math.ceil(daysDiff / 7) * 7); // At least 6 weeks
      
      for (let i = 0; i < totalDays; i++) {
        const date = new Date(calendarStart);
        date.setDate(calendarStart.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        const isInPeriod = dateStr >= period.startDate.split('T')[0] && dateStr <= period.endDate.split('T')[0];
        const isToday = dateStr === currentDateStr;
        const isPastDate = date < new Date(currentDateStr);
        const dayEvents = events.filter(event => event.date === dateStr);
        const availability = checkDateAvailability(dateStr);
        
        days.push({
          date: date.getDate(),
          dateStr,
          isCurrentMonth: isInPeriod,
          isToday,
          isPastDate,
          events: dayEvents,
          availability
        });
      }
    } else {
      // Normal monthly calendar
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const startDate = new Date(firstDay);
      startDate.setDate(startDate.getDate() - firstDay.getDay());
      
      for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        const isCurrentMonth = date.getMonth() === month;
        const isToday = dateStr === currentDateStr;
        const isPastDate = date < new Date(currentDateStr);
        const dayEvents = events.filter(event => event.date === dateStr);
        const availability = checkDateAvailability(dateStr);
        
        days.push({
          date: date.getDate(),
          dateStr,
          isCurrentMonth,
          isToday,
          isPastDate,
          events: dayEvents,
          availability
        });
      }
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  // Add this function to check if maintenance can be scheduled
  const canScheduleMaintenance = selectedDates.length > 0 && selectedDates.every(date => {
    const dateStr = date.toISOString().split('T')[0];
    const availability = checkDateAvailability(dateStr);
    return availability.isInMaintenancePeriod;
  });

  // Add these handler functions
  const clearSelection = () => {
    setSelectedDates([]);
    setSelectedAnomaly(null);
    setIsMultiDateMode(false);
  };

  const handleScheduleMaintenance = async () => {
    setIsLoading(true);
    try {
      console.log('Starting maintenance scheduling for dates:', selectedDates);

      // Create slots for each selected date
      for (const date of selectedDates) {
        const dateStr = date.toISOString().split('T')[0];
        const availability = checkDateAvailability(dateStr);
        
        if (!availability.isInMaintenancePeriod) {
          toast({
            title: "Date invalide",
            description: `La date ${new Date(dateStr).toLocaleDateString('fr-FR')} n'est pas dans une période de maintenance.`,
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }

        const startDate = `${dateStr}T09:00:00.000Z`; // 9 AM start
        const endDate = new Date(startDate);
        endDate.setHours(endDate.getHours() + (selectedAnomaly ? Math.round(selectedAnomaly.estimatedRepairTime) : 2));

        const windowType: WindowType = selectedAnomaly?.priority === "critical" ? "emergency" : "planned";
        const slotData = {
          title: selectedAnomaly?.title || "Maintenance planifiée",
          description: selectedAnomaly?.description,
          anomalyId: selectedAnomaly?.id,
          estimatedDuration: selectedAnomaly ? Math.round(selectedAnomaly.estimatedRepairTime) : 2,
          priority: selectedAnomaly?.priority || "medium",
          windowType,
          maintenancePeriodId: getCurrentPeriod()?.id || '',
          scheduledAt: startDate.toISOString(),
          completedAt: endDate.toISOString(),
          location: selectedAnomaly?.location || '',
          equipment: selectedAnomaly?.equipment || ''
        };

        console.log('Creating slot with data:', slotData);
        await SlotService.createSlot(slotData);
      }

      console.log('Successfully created slots');
      
      // Close any open modals
      setIsAnomalyModalOpen(false);

      // Clear selection first
      clearSelection();

      // Show success message
      const formattedDates = selectedDates.map(d => d.toLocaleDateString('fr-FR')).join('\n');
      setSuccessMessage({
        title: "Planification réussie",
        message: `${selectedDates.length} interventions planifiées avec succès!
        Dates programmées:
        ${formattedDates}`
      });
      setShowSuccessModal(true);

      // Refresh data
      console.log('Refreshing calendar data...');
      await loadMaintenancePeriods();
      await loadCriticalAnomalies();
      await loadSlots();

      // Force a re-render of the calendar
      setCurrentDate(new Date(currentDate));

    } catch (error) {
      console.error('Error scheduling maintenance:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la planification de l'intervention.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Calendar day rendering
  const renderCalendarDay = (day: CalendarDay) => {
    const isSelected = selectedDates.some(
      date => date.toISOString().split('T')[0] === day.dateStr
    );
    
    const isInMaintenancePeriod = day.availability.isInMaintenancePeriod;
    const isAvailableForScheduling = day.availability.isAvailable && !day.isPastDate;

    // Get formatted date for tooltip
    const formattedDate = new Date(day.dateStr).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
    
    // Determine tooltip text
    const getTooltipText = () => {
      if (isSelected) return `${formattedDate} - Date sélectionnée`;
      if (day.isPastDate) return `${formattedDate} - Date passée`;
      if (!isInMaintenancePeriod) return `${formattedDate} - Hors période de maintenance`;
      if (!isAvailableForScheduling) return `${formattedDate} - Date non disponible`;
      return `${formattedDate} - Disponible pour maintenance`;
    };
    
    return (
      <div
        key={day.dateStr}
        className={cn(
          "relative h-32 p-2 border border-gray-200 transition-colors group",
          day.isCurrentMonth ? "bg-white" : "bg-gray-50/50",
          isSelected && "ring-2 ring-blue-500",
          !day.isCurrentMonth && "text-gray-400",
          day.isPastDate && "bg-gray-50 cursor-not-allowed",
          isInMaintenancePeriod && !day.isPastDate && "bg-sky-50/50 hover:bg-sky-100/50",
          !isInMaintenancePeriod && "cursor-not-allowed",
          isAvailableForScheduling && "cursor-pointer hover:bg-sky-100/50"
        )}
        onClick={() => {
          if (isAvailableForScheduling) {
            handleDateClick(day.dateStr);
          }
        }}
        title={getTooltipText()}
      >
        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute top-1 left-1">
            <div className={`w-3 h-3 ${
              selectedAnomaly?.priority === 'critical'
                ? 'bg-red-500'
                : 'bg-blue-600'
            } rounded-full border-2 border-white shadow-md flex items-center justify-center`}>
              <div className="w-1 h-1 bg-white rounded-full" />
            </div>
          </div>
        )}
        
        {/* Availability indicator with tooltip */}
        {!isSelected && day.isCurrentMonth && !day.isPastDate && (
          <div className="absolute top-1 right-1 flex items-center">
            <div 
              className={cn(
                "w-2 h-2 rounded-full transition-transform group-hover:scale-125",
                isInMaintenancePeriod
                  ? isAvailableForScheduling
                    ? selectedAnomaly?.priority === 'critical'
                      ? 'bg-red-400'
                      : 'bg-sky-500'
                    : 'bg-gray-300'
                  : 'bg-gray-300',
                "after:content-[attr(data-tooltip)] after:absolute after:hidden group-hover:after:block",
                "after:right-0 after:top-6 after:w-max after:max-w-xs",
                "after:bg-gray-900 after:text-white after:text-xs after:p-2 after:rounded"
              )}
              data-tooltip={
                isInMaintenancePeriod
                  ? isAvailableForScheduling
                    ? "✅ Période de maintenance disponible"
                    : "⚠️ Date non disponible"
                  : "❌ Hors période de maintenance"
              }
            />
          </div>
        )}
        
        {/* Date number with period indicator */}
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium">{day.date}</span>
          {isInMaintenancePeriod && !day.isPastDate && (
            <span className={cn(
              "text-xs px-1 rounded",
              isAvailableForScheduling
                ? "text-emerald-700 bg-emerald-100"
                : "text-gray-600 bg-gray-100"
            )}>
              {isAvailableForScheduling ? '✓' : '×'}
            </span>
          )}
        </div>
        
        {/* Events */}
        <div className="space-y-1">
          {day.events.map((event: MaintenanceEvent) => (
            <div
              key={event.id}
              className={`text-xs p-1 rounded cursor-pointer hover:shadow-sm ${
                priorityColors[event.priority].bg
              } ${priorityColors[event.priority].text}`}
              onClick={(e) => {
                e.stopPropagation();
                handleEditEvent(event);
              }}
            >
              <div className="font-medium truncate">{event.title}</div>
              <div className="text-xs opacity-75">{event.time}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with anomalies alert */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
        {/* Header Title */}
        <div className="xl:col-span-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">Planification Maintenance</h1>
              <p className="text-gray-500 text-theme-sm dark:text-gray-400 mt-1">Gestion des interventions et anomalies</p>
        </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="xl:col-span-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-end gap-4">
          <Button
                onClick={loadMaintenancePeriods}
            variant="outline"
            className="flex items-center gap-2"
                disabled={isLoadingPeriods}
              >
                {isLoadingPeriods ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Actualiser
          </Button>
          <Button
                onClick={() => setIsAnomalyModalOpen(true)}
                variant="outline"
            className="flex items-center gap-2"
          >
                <AlertTriangle className="h-4 w-4" />
                Anomalies en attente ({anomalies.filter(a => a.status === "open").length})
          </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Priority Anomalies Alert */}
      {anomalies.filter(a => a.priority === "critical" && a.status === "open").length > 0 && (
        <div className="grid grid-cols-1 gap-4 mt-4">
          <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <span className="after:bottom-0-0 group absolute -left-px mt-3 flex -translate-x-[55px] items-center gap-1 bg-red-600 px-4 py-1.5 text-sm font-medium text-white transition-transform duration-500 ease-in-out before:absolute before:-right-4 before:top-0 before:border-[16px] before:border-transparent before:border-l-red-600 before:border-t-red-600 before:content-[''] after:absolute after:-right-4 after:border-[16px] after:border-transparent after:border-b-red-600 after:border-l-red-600 after:content-[''] group-hover:translate-x-0">
              <span className="transition-opacity duration-300 ease-linear opacity-0 group-hover:opacity-100">
                URGENT
              </span>
              <AlertTriangle className="h-4 w-4" />
            </span>
            <div className="p-5 pt-16">
            <div className="flex items-center gap-3">
              <div>
                  <h3 className="text-xl font-bold text-red-800">Anomalies Critiques Détectées</h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {anomalies.filter(a => a.priority === "critical" && a.status === "open").length} anomalie(s) critique(s) nécessitent une intervention immédiate
                </p>
              </div>
              <Button
                onClick={() => setIsAnomalyModalOpen(true)}
                size="sm"
                  className="ml-auto bg-red-600 hover:bg-red-700 text-white"
              >
                Planifier maintenant
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <div className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-800">Erreur</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <Button
                onClick={loadMaintenancePeriods}
                size="sm"
                variant="outline"
                className="ml-auto"
              >
                Réessayer
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Maintenance Periods Status */}
      {!isLoadingPeriods && maintenancePeriods.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Périodes de maintenance disponibles
                </div>
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {maintenancePeriods.filter(p => p.status === 'available').length} période(s) de maintenance disponible(s)
              </p>
            </div>
          </div>

          <div className="grid rounded-2xl border border-gray-200 bg-white sm:grid-cols-2 xl:grid-cols-3 dark:border-gray-800 dark:bg-gray-900">
            {maintenancePeriods
              .filter(p => p.status === 'available')
              .slice(0, 3)
              .map((period, index) => (
                <div
                  key={period.id}
                  className={`px-6 py-5 ${
                    index < 2 ? 'border-b sm:border-r xl:border-b-0 dark:border-gray-800' : ''
                  }`}
                >
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Période {index + 1}
                  </span>
                  <div className="mt-2">
                    <div className="text-theme-sm font-medium text-gray-800 dark:text-white/90">
                      {new Date(period.startDate).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short'
                      })}
                      {' - '}
                      {new Date(period.endDate).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short'
                      })}
                    </div>
                    <div className="mt-1">
                      <span className="bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500 inline-flex items-center gap-1 rounded-full py-0.5 px-2 text-xs font-medium">
                        {period.durationHours}h disponibles
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            {maintenancePeriods.length > 3 && (
              <div className="px-6 py-5 sm:border-t sm:border-l xl:border-t-0 dark:border-gray-800">
                <div className="flex items-center justify-center h-full">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    +{maintenancePeriods.length - 3} autres périodes...
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoadingPeriods && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 text-gray-600 animate-spin" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Chargement</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Chargement des périodes de maintenance...</p>
            </div>
          </div>
        </div>
      )}

      {/* Multi-date selection mode info */}
      {isMultiDateMode && selectedAnomaly && (
        <Card className="border-2 border-sky-100 bg-gradient-to-r from-sky-50 to-sky-50/30 shadow-sm">
          <div className="p-6">
            <div className="flex-1">
              <h3 className="font-medium text-sky-900 text-xl tracking-tight mb-2">Mode sélection multiple activé</h3>
              <div className="mb-4 p-4 bg-white rounded-lg border border-sky-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-sky-800 tracking-tight">Anomalie:</span>
                  <span className="text-sky-700 font-normal">{selectedAnomaly.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sky-800 tracking-tight">Durée estimée:</span>
                  <span className="text-sky-700 font-normal">{Math.round(selectedAnomaly.estimatedRepairTime)}h</span>
                </div>
              </div>
              <p className="text-sm text-sky-700 mb-5 leading-relaxed font-normal">
                Sélectionnez plusieurs dates pour planifier cette intervention complexe. 
                Utilisez les flèches pour naviguer entre les périodes de maintenance disponibles.
              </p>
              {selectedDates.length > 0 && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-2 text-sky-800">
                    <Clock className="h-4 w-4" />
                    <p className="text-sm font-medium tracking-tight">Dates sélectionnées</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedDates.map(date => (
                      <span 
                        key={date.toISOString()} 
                        className="px-3 py-1.5 bg-white border border-sky-100 text-sky-700 rounded-full text-xs font-medium tracking-wide shadow-sm flex items-center gap-1.5 hover:border-sky-200 transition-colors"
                      >
                        <div className="w-1.5 h-1.5 bg-sky-400 rounded-full"></div>
                        {date.toLocaleDateString('fr-FR')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-5 flex items-start gap-3 p-4 bg-sky-50 border border-sky-100 rounded-lg">
                <div className="mt-0.5">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-b from-sky-400 to-sky-500 flex items-center justify-center">
                    <span className="text-white text-xs font-medium">ℹ</span>
                  </div>
                </div>
                <div className="text-sm text-sky-700 leading-relaxed font-normal">
                  <span className="font-medium tracking-tight">Info:</span> Un événement séparé sera créé pour chaque date sélectionnée avec la même heure de début.
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Calendar */}
      <Card>
        <div className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              {isMultiDateMode && getCurrentPeriod() ? (
                <>
                  Période {currentPeriodIndex + 1}/{filteredPeriods.length}: {getCurrentPeriod()?.title}
                  <div className="text-sm font-normal text-gray-600">
                    {new Date(getCurrentPeriod()!.startDate).toLocaleDateString('fr-FR')} - {new Date(getCurrentPeriod()!.endDate).toLocaleDateString('fr-FR')}
                  </div>
                </>
              ) : (
                `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              {isMultiDateMode ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigatePeriod('prev')}
                    disabled={currentPeriodIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Période précédente
                  </Button>
                  <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                    {selectedDates.length} date(s) sélectionnée(s)
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigatePeriod('next')}
                    disabled={currentPeriodIndex === filteredPeriods.length - 1}
                  >
                    Période suivante
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={handleMultiDateScheduling}
                    size="sm"
                    disabled={selectedDates.length === 0}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Planifier ({selectedDates.length})
                  </Button>
                  <Button
                    onClick={resetForm}
                    variant="outline"
                    size="sm"
                  >
                    Annuler
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth('prev')}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentDate(new Date())}
                  >
                    Aujourd'hui
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth('next')}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
          
          {/* Availability Legend */}
          <div className="flex items-center gap-6 text-sm text-gray-600 mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>Période de maintenance disponible</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-gray-300 rounded-full" />
              <span>Hors période de maintenance</span>
            </div>
            {isMultiDateMode && (
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow-md flex items-center justify-center">
                  <div className="w-1 h-1 bg-white rounded-full" />
                </div>
                <span>Date sélectionnée</span>
              </div>
            )}
          </div>
        </div>
        <div className="p-6 pt-0">
          <div className="grid grid-cols-7 gap-1">
            {/* Days of week header */}
            {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
              <div key={day} className="p-2 text-center font-medium text-gray-500 text-sm">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {generateCalendar().map((day, index) => renderCalendarDay(day))}
          </div>
        </div>
      </Card>

      {/* Events List */}
      <Card>
        <div className="p-4">
          <CardTitle className="text-lg font-semibold">Interventions Planifiées</CardTitle>
        </div>
        <div className="p-4">
          {events.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucune intervention planifiée</p>
          ) : (
            <div className="space-y-4">
              {events.map(event => (
                <div
                  key={event.id}
                  className={`p-4 rounded-lg border-l-4 ${priorityColors[event.priority].border} bg-gray-50`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{event.title}</h3>
                        <Badge variant="light" color={event.priority === "critical" ? "error" : event.priority === "high" ? "warning" : event.priority === "medium" ? "info" : "success"}>
                          {event.priority.toUpperCase()}
                        </Badge>
                        <Badge variant="light" color={event.type === "maintenance" ? "info" : "error"}>
                          {event.type === "maintenance" ? "Maintenance" : "Anomalie"}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(event.date).toLocaleDateString('fr-FR')} à {event.time}
                        </div>
                        <div className="flex items-center gap-1">
                          <Wrench className="h-4 w-4" />
                          {event.equipment}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {event.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {event.estimatedDuration}h
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mt-2">{event.description}</p>
                    </div>
                    <Button
                      onClick={() => handleEditEvent(event)}
                      size="sm"
                      variant="outline"
                      className="ml-4"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Maintenance Event Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedEvent ? "Modifier l'intervention" : "Nouvelle intervention"}
            </DialogTitle>
            <p className="text-sm text-gray-600">
              Planifiez une intervention de maintenance ou la résolution d'une anomalie
            </p>
          </DialogHeader>
          <div className="space-y-6">
            
            {/* Multi-date scheduling info */}
            {isMultiDateMode && selectedDates.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Planification multi-dates
                </h3>
                <div className="text-sm text-blue-700 mb-3">
                  <p className="mb-2">Cette intervention sera programmée sur <strong>{selectedDates.length} dates</strong>:</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {selectedDates.map((date, index) => (
                      <div key={date.toISOString()} className="bg-blue-100 px-2 py-1 rounded text-xs">
                        <span className="font-medium">Jour {index + 1}:</span><br/>
                        {date.toLocaleDateString('fr-FR', { 
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short'
                        })}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-xs text-blue-600 bg-blue-100 p-2 rounded">
                  💡 <strong>Info:</strong> Un événement séparé sera créé pour chaque date sélectionnée avec la même heure de début.
                </div>
              </div>
            )}
            
            {/* Automatic Scheduling for Critical / Suggested Dates for Others */}
            {selectedAnomaly && (
              <div className="rounded-lg p-4 bg-sky-50 border border-sky-200">
                <h3 className="font-medium text-sky-800 mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Dates suggérées
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {getSuggestedRepairDates(selectedAnomaly.priority, selectedAnomaly.estimatedRepairTime).map((suggestion, index) => (
                    <button
                      key={suggestion.date}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, date: suggestion.date }))}
                      className={`p-3 text-left rounded-lg border transition-all ${
                        formData.date === suggestion.date
                          ? 'border-blue-500 bg-blue-50 text-blue-900'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">
                          {suggestion.dayName}
                        </span>
                        <div className={`w-2 h-2 rounded-full ${
                          suggestion.availability.remainingHours >= 20 ? 'bg-green-500' :
                          suggestion.availability.remainingHours >= 12 ? 'bg-orange-500' : 'bg-red-500'
                        }`} />
                      </div>
                      <div className="text-xs text-gray-600">{suggestion.dateDisplay}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {suggestion.availability.remainingHours}h disponibles
                      </div>
                      {index === 0 && (
                        <div className="text-xs text-blue-600 font-medium mt-1">
                          📍 Recommandé
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Titre de l'intervention"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  min={new Date().toISOString().split('T')[0]} // Prevent past dates
                  onChange={(e) => {
                    const selectedDate = e.target.value;
                    const availability = checkDateAvailability(selectedDate);
                    setFormData(prev => ({ ...prev, date: selectedDate }));
                    
                    // Show warning for busy dates
                    if (!availability.isAvailable) {
                      console.warn(`Date ${selectedDate} has limited availability: ${availability.remainingHours}h remaining`);
                    }
                  }}
                />
                {formData.date && (
                  <div className="text-xs">
                    {(() => {
                      const availability = checkDateAvailability(formData.date);
                      return (
                        <div className={`flex items-center gap-1 ${
                          availability.isAvailable ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${
                            availability.isAvailable ? 'bg-green-500' : 'bg-orange-500'
                          }`} />
                          {availability.isAvailable 
                            ? `Disponible (${availability.remainingHours}h libres)`
                            : `Charge élevée (${availability.remainingHours}h libres)`
                          }
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Heure</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedDuration">Durée estimée (heures)</Label>
                <Input
                  id="estimatedDuration"
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={formData.estimatedDuration}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedDuration: parseFloat(e.target.value) }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description détaillée de l'intervention"
                rows={3}
              />
            </div>

            <DialogFooter>
              <div className="flex gap-2">
                {selectedEvent && (
                  <Button
                    onClick={handleDeleteEvent}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Supprimer
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setIsModalOpen(false)}
                  variant="outline"
                >
                  Annuler
                </Button>
                <Button onClick={() => handleSaveEvent(formData)}>
                  {selectedEvent ? "Modifier" : isMultiDateMode && selectedDates.length > 0 ? `Planifier ${selectedDates.length} interventions` : "Planifier"}
                </Button>
              </div>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Anomalies Dialog */}
      <Dialog open={isAnomalyModalOpen} onOpenChange={setIsAnomalyModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Anomalies en attente
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Sélectionnez une anomalie pour la planifier automatiquement
            </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-700 rounded-full dark:bg-red-500/10 dark:text-red-500 min-w-[120px] justify-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full" />
                  <span className="text-sm font-medium">
                    {anomalies.filter(a => a.priority === "critical" && a.status === "open").length} Critiques
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full dark:bg-yellow-500/10 dark:text-yellow-500 min-w-[120px] justify-center">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                  <span className="text-sm font-medium">
                    {anomalies.filter(a => a.priority === "medium" && a.status === "open").length} Normales
                  </span>
                </div>
              </div>
            </div>
          </div>

            <div className="space-y-4">
            {isLoadingAnomalies ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-3" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Chargement des anomalies...</p>
              </div>
            ) : anomalies.filter(a => a.status === "open").length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="rounded-full bg-green-50 p-3 mb-4">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  Aucune anomalie en attente
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Toutes les anomalies ont été traitées ou planifiées
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:divide-gray-700">
                {anomalies
                  .filter(a => a.status === "open")
                  .sort((a, b) => {
                    const priorityOrder = { critical: 0, medium: 1, low: 2 };
                    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
                    return priorityDiff !== 0 ? priorityDiff : b.reportedAt.getTime() - a.reportedAt.getTime();
                  })
                  .map((anomaly) => (
                    <div
                      key={anomaly.id}
                      className="group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="p-4 flex items-start gap-4">
                        <div className={`mt-2 w-2 h-2 rounded-full flex-shrink-0 ${
                          anomaly.priority === "critical" ? "bg-red-500" :
                          anomaly.priority === "medium" ? "bg-yellow-500" :
                          "bg-green-500"
                        }`} />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                                  {anomaly.title}
                                </h3>
                                <div className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  anomaly.priority === "critical" ? "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-500" :
                                  anomaly.priority === "medium" ? "bg-yellow-50 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-500" :
                                  "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-500"
                                }`}>
                            {anomaly.priority.toUpperCase()}
                        </div>
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-2">
                                <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                            <Wrench className="h-4 w-4" />
                                  <span className="truncate">{anomaly.equipment}</span>
                          </div>
                                <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                                  <Clock className="h-4 w-4" />
                                  <span>{Math.round(anomaly.estimatedRepairTime)}h</span>
                                </div>
                              </div>
                              
                              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                                {anomaly.description}
                              </p>
                              
                              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                                  <Calendar className="h-3.5 w-3.5" />
                                  <span>
                                    Signalée le {anomaly.reportedAt.toLocaleDateString('fr-FR', {
                                      day: 'numeric',
                                      month: 'short',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                          </div>
                                {anomaly.requiredSkills.length > 0 && (
                          <div className="flex items-center gap-1">
                                    <Shield className="h-3.5 w-3.5" />
                                    <span>{anomaly.requiredSkills.join(', ')}</span>
                          </div>
                                )}
                        </div>
                      </div>
                            
                      <Button
                        onClick={() => handleScheduleAnomaly(anomaly)}
                        size="sm"
                              className={`flex-shrink-0 ${
                          anomaly.priority === "critical" 
                                  ? "bg-red-600 hover:bg-red-700 group-hover:animate-pulse"
                            : "bg-blue-600 hover:bg-blue-700"
                        }`}
                      >
                              {anomaly.priority === "critical" ? (
                                <div className="flex items-center gap-1.5">
                                  <Zap className="h-4 w-4" />
                                  <span>Urgence</span>
                                </div>
                              ) : (
                                "Planifier"
                              )}
                      </Button>
                    </div>
                  </div>
            </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {anomalies.filter(a => a.status === "open").length} anomalie(s) en attente
            </p>
            <Button
              onClick={loadCriticalAnomalies}
              variant="outline"
              className="flex items-center gap-2"
              disabled={isLoadingAnomalies}
            >
              <RefreshCw className="h-4 w-4" />
              Actualiser
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <SuccessAlertModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={successMessage.title}
        message={successMessage.message}
      />

    </div>
  );
};

export default MaintenanceCalendar; 