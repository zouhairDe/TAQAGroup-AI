"use client";

import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import InputField from "@/components/form/InputField";
import { Modal } from "@/components/ui/Modal";
import Label from "@/components/form/Label";
import { Calendar, Clock, CheckCircle, AlertCircle, Plus, Edit3, Trash2, Upload } from 'lucide-react';
import { maintenancePeriodsService, MaintenancePeriod, ImportResponse, MaintenancePeriodsResponse } from "@/lib/services/maintenance-periods-service";
import { ApiResponse } from "@/lib/api";

// Add XLSX utility import at the top
import * as XLSX from 'xlsx';

// Updated Types to match backend
interface DateRange {
  id: string;
  startDate: Date;
  endDate: Date;
  duration: number; // Maps to durationDays from backend
  durationHours: number;
  title: string;
  type: MaintenancePeriod["type"];
  status: MaintenancePeriod["status"];
  assignedTo?: string | null;
  location?: string | null;
  createdAt: Date;
}

interface StatCard {
  title: string;
  value: string;
  change: string;
  changeType: "increase" | "decrease";
  color: string;
  icon: React.ReactNode;
}

// Helper function to transform backend data to frontend format
const transformBackendData = (backendData: MaintenancePeriod[]): DateRange[] => {
  if (!backendData || !Array.isArray(backendData)) {
    return [];
  }
  
  return backendData.map(period => ({
    id: period.id,
    startDate: new Date(period.startDate),
    endDate: new Date(period.endDate),
    duration: period.durationDays,
    durationHours: period.durationHours,
    title: period.title,
    type: period.type,
    status: period.status,
    assignedTo: period.assignedTo,
    location: period.location,
    createdAt: new Date(period.createdAt)
  }));
};

// Type guard functions
const isValidType = (value: string): value is MaintenancePeriod['type'] => {
  return ['maintenance', 'repair', 'inspection', 'emergency'].includes(value);
};

const isValidStatus = (value: string): value is MaintenancePeriod['status'] => {
  return ['available', 'booked', 'pending'].includes(value);
};

// Helper function to convert Excel serial date to JavaScript Date
const excelSerialDateToJSDate = (serial: any): Date | null => {
  if (!serial) return null;
  
  // If it's already a Date object, return it
  if (serial instanceof Date && !isNaN(serial.getTime())) {
    return serial;
  }
  
  // If it's a string that looks like a date, try to parse it
  if (typeof serial === 'string') {
    // Try different date formats
    const formats = [
      serial, // Original string
      serial.replace(/\//g, '-'), // Replace / with -
      serial.replace(/\./g, '-'), // Replace . with -
    ];
    
    for (const format of formats) {
      const parsed = new Date(format);
      if (!isNaN(parsed.getTime()) && parsed.getFullYear() > 1900) {
        return parsed;
      }
    }
  }
  
  // If it's a number (Excel serial date)
  if (typeof serial === 'number' && serial > 0) {
    try {
      // Excel serial date starts from January 1, 1900
      // But Excel incorrectly treats 1900 as a leap year
      // So we need to subtract 1 day for dates after February 28, 1900
      const excelEpoch = new Date(1899, 11, 30); // December 30, 1899
      let adjustedSerial = serial;
      
      // Adjust for Excel's leap year bug
      if (serial > 60) { // After February 28, 1900
        adjustedSerial = serial - 1;
      }
      
      const jsDate = new Date(excelEpoch.getTime() + (adjustedSerial * 24 * 60 * 60 * 1000));
      
      // Validate the result
      if (!isNaN(jsDate.getTime()) && jsDate.getFullYear() > 1900 && jsDate.getFullYear() < 2100) {
        return jsDate;
      }
    } catch (error) {
      console.warn('Error converting Excel serial date:', serial, error);
    }
  }
  
  console.warn('Unable to convert date value:', serial, typeof serial);
  return null;
};

// Helper function to validate and transform Excel data
const transformExcelData = (jsonData: any[]): Partial<MaintenancePeriod>[] => {
  return jsonData.map((row, index) => {
    const rawType = row["Type"]?.toLowerCase() || "maintenance";
    const rawStatus = row["Statut"]?.toLowerCase() || "available";

    // Validate type and status using type guards
    const type: MaintenancePeriod['type'] = isValidType(rawType) ? rawType : 'maintenance';
    const status: MaintenancePeriod['status'] = isValidStatus(rawStatus) ? rawStatus : 'available';

    // Convert Excel dates to JavaScript dates
    const startDate = excelSerialDateToJSDate(row["Date début d'Arrét (Window)"]);
    const endDate = excelSerialDateToJSDate(row["Date fin d'Arrét (Window)"]);

    // Log date conversion issues for debugging
    if (!startDate) {
      console.warn(`Row ${index + 1}: Unable to parse start date:`, row["Date début d'Arrét (Window)"]);
    }
    if (!endDate) {
      console.warn(`Row ${index + 1}: Unable to parse end date:`, row["Date fin d'Arrét (Window)"]);
    }

    // Calculate duration if not provided
    let durationDays = row["Durée en Jr"];
    let durationHours = row["Durée en H"];

    if (!durationDays && startDate && endDate) {
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      durationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }

    if (!durationHours && durationDays) {
      durationHours = durationDays * 24;
    }

    const transformedData: Partial<MaintenancePeriod> = {
      title: row["Titre"] || `Période de maintenance ${index + 1}`,
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
      durationDays: typeof durationDays === 'string' ? parseInt(durationDays, 10) : (durationDays || 1),
      durationHours: typeof durationHours === 'string' ? parseInt(durationHours, 10) : (durationHours || 24),
      type: type as MaintenancePeriod['type'],
      status: status as MaintenancePeriod['status']
    };

    return transformedData;
  });
};

export default function MaintenancePeriodsPage() {
  const [selectedRanges, setSelectedRanges] = useState<DateRange[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSelection, setCurrentSelection] = useState<{
    start: Date | null;
    end: Date | null;
  }>({ start: null, end: null });
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [editingRange, setEditingRange] = useState<DateRange | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'year' | 'month'>('year');
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch data from backend
  useEffect(() => {
    const fetchMaintenancePeriods = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await maintenancePeriodsService.getMaintenancePeriods();
        if (response.success) {
          const transformedData = transformBackendData(response.data);
          setSelectedRanges(transformedData);
        } else {
          console.error('Invalid response format:', response);
          throw new Error('Invalid response format from server');
        }
      } catch (err) {
        console.error('Error fetching maintenance periods:', err);
        setError('Failed to load maintenance periods. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchMaintenancePeriods();
  }, []);

  const statusColors = {
    available: 'bg-success-50 border-success-200 dark:bg-success-500/15 dark:border-success-500/30',
    booked: 'bg-brand-50 border-brand-200 dark:bg-brand-500/15 dark:border-brand-500/30',
    pending: 'bg-warning-50 border-warning-200 dark:bg-warning-500/15 dark:border-warning-500/30'
  };

  // Statistics data
  const statsData: StatCard[] = [
    {
      title: "Total Périodes",
      value: selectedRanges.length.toString(),
      change: "+12%",
      changeType: "increase",
      color: "brand",
      icon: <Calendar className="w-5 h-5" />
    },
    {
      title: "Disponibilité",
      value: selectedRanges.length > 0 ? (100 - (selectedRanges.reduce((sum, r) => sum + r.duration, 0) / 365 * 100)).toFixed(1) + "%" : "100%",
      change: selectedRanges.length > 0 ? "-" + (selectedRanges.reduce((sum, r) => sum + r.duration, 0) / 365 * 100).toFixed(1) + "%" : "0%",
      changeType: "decrease",
      color: "green",
      icon: <CheckCircle className="w-5 h-5" />
    },
    {
      title: "Réservées",
      value: selectedRanges.filter(r => r.status === 'booked').length.toString(),
      change: "+5%",
      changeType: "increase",
      color: "blue",
      icon: <Clock className="w-5 h-5" />
    },
    {
      title: "Total Jours",
      value: selectedRanges.reduce((sum, r) => sum + r.duration, 0).toString(),
      change: "+15%",
      changeType: "increase",
      color: "purple",
      icon: <AlertCircle className="w-5 h-5" />
    }
  ];

  // Generate calendar days for year view
  const generateYearCalendar = useCallback(() => {
    const months = [];
    const today = new Date();
    const currentMonthIndex = today.getMonth();
    const currentYearValue = today.getFullYear();
    
    for (let month = 0; month < 12; month++) {
      // Skip past months if we're viewing the current year
      if (currentYear === currentYearValue && month < currentMonthIndex) {
        continue;
      }
      
      const firstDay = new Date(currentYear, month, 1);
      const lastDay = new Date(currentYear, month + 1, 0);
      const startDate = new Date(firstDay);
      startDate.setDate(startDate.getDate() - firstDay.getDay());
      
      const days = [];
      for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        days.push(date);
      }
      
      months.push({
        month,
        name: firstDay.toLocaleDateString('fr-FR', { month: 'long' }),
        days,
        firstDay: firstDay.getDate(),
        lastDay: lastDay.getDate()
      });
    }
    return months;
  }, [currentYear]);

  // Generate calendar days for month view
  const generateMonthCalendar = useCallback(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }
    
    return {
      month: currentMonth,
      year: currentYear,
      name: firstDay.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
      days,
      firstDay: firstDay.getDate(),
      lastDay: lastDay.getDate()
    };
  }, [currentYear, currentMonth]);

  const yearCalendar = useMemo(() => generateYearCalendar(), [generateYearCalendar]);
  const monthCalendar = useMemo(() => generateMonthCalendar(), [generateMonthCalendar]);

  // Check if date is in any selected range
  const isDateInRange = useCallback((date: Date) => {
    return selectedRanges.find(range => 
      date >= range.startDate && date <= range.endDate
    );
  }, [selectedRanges]);

  // Check if date is in current selection
  const isDateInCurrentSelection = useCallback((date: Date) => {
    if (!currentSelection.start) return false;
    
    const end = hoveredDate || currentSelection.end;
    if (!end) return date.getTime() === currentSelection.start.getTime();
    
    const start = currentSelection.start;
    return date >= (start < end ? start : end) && date <= (start < end ? end : start);
  }, [currentSelection, hoveredDate]);

  // Calculate duration
  const calculateDuration = useCallback((start: Date, end: Date) => {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return {
      days: diffDays,
      hours: diffDays * 24
    };
  }, []);

  // Handle date click
  const handleDateClick = useCallback((date: Date) => {
    if (date < new Date()) return; // Don't allow past dates
    
    if (!currentSelection.start) {
      setCurrentSelection({ start: date, end: null });
    } else if (!currentSelection.end) {
      // Check if clicking the same start date to create a one-day period
      if (currentSelection.start && date.getTime() === currentSelection.start.getTime()) {
        // Set end date same as start for one-day period and open form
        setCurrentSelection({ start: currentSelection.start, end: date });
        setEditingRange(null);
        setIsDialogOpen(true);
        return;
      }
      
      const start = currentSelection.start;
      const end = date;
      const finalStart = start < end ? start : end;
      const finalEnd = start < end ? end : start;
      
      // Set the selection and open the form
      setCurrentSelection({ start: finalStart, end: finalEnd });
      setEditingRange(null);
      setIsDialogOpen(true);
    } else {
      setCurrentSelection({ start: date, end: null });
    }
  }, [currentSelection]);

  // Handle date hover
  const handleDateHover = useCallback((date: Date) => {
    if (currentSelection.start && !currentSelection.end) {
      setHoveredDate(date);
    }
  }, [currentSelection]);

  // Save date range (used for both creating new periods and editing existing ones)
  const saveDateRange = useCallback(async (formData: {
    title: string;
  }) => {
    if (!currentSelection.start || !currentSelection.end) return;
    
    try {
      setLoading(true);
      
      if (editingRange) {
        // Editing existing period
        const updateData = {
          title: formData.title,
          startDate: currentSelection.start.toISOString(),
          endDate: currentSelection.end.toISOString(),
        };

        const response = await maintenancePeriodsService.updateMaintenancePeriod(editingRange.id, updateData);
        
        if (response.success) {
          const transformedData = transformBackendData([response.data]);
          setSelectedRanges(prev => prev.map(range => 
            range.id === editingRange.id ? transformedData[0] : range
          ));
          
          setSuccessMessage(`✅ Période modifiée: ${response.data.title}`);
        }
      } else {
        // Creating new period
        const createData: Partial<MaintenancePeriod> = {
          title: formData.title,
          startDate: currentSelection.start.toISOString(),
          endDate: currentSelection.end.toISOString(),
          type: 'maintenance' as const,
          status: 'available' as const,
        };

        const response = await maintenancePeriodsService.createMaintenancePeriod(createData);
        
        if (response.success) {
          const transformedData = transformBackendData([response.data]);
          setSelectedRanges(prev => [...prev, transformedData[0]]);
          
          setSuccessMessage(`✅ Nouvelle période créée: ${response.data.title} (${response.data.durationDays} jour${response.data.durationDays > 1 ? 's' : ''})`);
        }
      }
    } catch (error) {
      console.error('Error saving maintenance period:', error);
      setError('Erreur lors de la sauvegarde. Veuillez réessayer.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }

    // Clean up and close dialog
    setCurrentSelection({ start: null, end: null });
    setEditingRange(null);
    setIsDialogOpen(false);
    setHoveredDate(null);
    setTimeout(() => setSuccessMessage(null), 3000);
  }, [currentSelection, editingRange]);

  // Delete date range
  const deleteRange = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const response = await maintenancePeriodsService.deleteMaintenancePeriod(id);
      
      if (response.success) {
        setSelectedRanges(prev => prev.filter(range => range.id !== id));
        setSuccessMessage(response.message || '✅ Période supprimée avec succès');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (error) {
      console.error('Error deleting maintenance period:', error);
      setError('Erreur lors de la suppression. Veuillez réessayer.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  }, []);

  // Edit date range
  const editRange = useCallback((range: DateRange) => {
    setEditingRange(range);
    setCurrentSelection({ start: range.startDate, end: range.endDate });
    setIsDialogOpen(true);
  }, []);



  // Handle file import
  const handleFileImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        if (Array.isArray(importedData)) {
          const validRanges = importedData.map(range => ({
            ...range,
            startDate: new Date(range.startDate),
            endDate: new Date(range.endDate)
          }));
          setSelectedRanges(validRanges);
        }
      } catch (error) {
        console.error('Erreur lors de l\'import:', error);
        alert('Erreur lors de l\'import du fichier');
      }
    };
    reader.readAsText(file);
  }, []);

  // Check if date is start of current selection
  const isSelectionStart = useCallback((date: Date) => {
    return currentSelection.start && date.getTime() === currentSelection.start.getTime();
  }, [currentSelection.start]);

  // Check if date is end of current selection
  const isSelectionEnd = useCallback((date: Date) => {
    const end = hoveredDate || currentSelection.end;
    return end && date.getTime() === end.getTime();
  }, [currentSelection.end, hoveredDate]);

  // Render calendar day
  const renderDay = useCallback((date: Date, isCurrentMonth: boolean = true) => {
    const isToday = date.toDateString() === new Date().toDateString();
    const isPast = date < new Date();
    const rangeInfo = isDateInRange(date);
    const isInCurrentSelection = isDateInCurrentSelection(date);
    const isStart = isSelectionStart(date);
    const isEnd = isSelectionEnd(date);
    
    let className = 'w-9 h-9 flex items-center justify-center text-sm cursor-pointer transition-all duration-200 font-medium relative ';
    let borderRadius = 'rounded-lg ';
    let tooltipText = '';
    
    // Handle selection styling with professional start/end indicators
    if (isInCurrentSelection && currentSelection.start) {
      if (isStart && isEnd) {
        // Single day selection
        className += 'bg-gradient-to-br from-brand-500 to-brand-600 text-white font-bold border-2 border-brand-700 shadow-lg transform scale-105 ';
        borderRadius = 'rounded-xl ';
        tooltipText = 'Jour sélectionné';
      } else if (isStart) {
        // Start of range - rounded left, square right
        className += 'bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold border-2 border-brand-700 shadow-lg transform scale-105 ';
        borderRadius = 'rounded-l-xl ';
        tooltipText = 'Début de période';
      } else if (isEnd) {
        // End of range - rounded right, square left
        className += 'bg-gradient-to-l from-brand-500 to-brand-600 text-white font-bold border-2 border-brand-700 shadow-lg transform scale-105 ';
        borderRadius = 'rounded-r-xl ';
        tooltipText = 'Fin de période';
      } else {
        // Middle of range - subtle background with connecting lines
        className += 'bg-gradient-to-r from-brand-50 via-brand-100 to-brand-50 text-brand-800 border-t-2 border-b-2 border-brand-300 dark:bg-brand-500/15 dark:text-brand-300 dark:border-brand-500/40 ';
        borderRadius = 'rounded-none ';
        tooltipText = 'Dans la période sélectionnée';
      }
    } else if (isPast) {
      className += 'text-gray-300 cursor-not-allowed dark:text-gray-600 ';
      tooltipText = 'Date passée';
    } else if (rangeInfo) {
      // Style existing periods with the same styling as selection
      const isRangeStart = rangeInfo.startDate.toDateString() === date.toDateString();
      const isRangeEnd = rangeInfo.endDate.toDateString() === date.toDateString();
      
      if (isRangeStart && isRangeEnd) {
        // Single day period
        className += 'bg-gradient-to-br from-brand-500 to-brand-600 text-white font-bold border-2 border-brand-700 shadow-lg transform scale-105 hover:scale-110 transition-transform ';
        borderRadius = 'rounded-xl ';
      } else if (isRangeStart) {
        // Start of period - rounded left, square right
        className += 'bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold border-2 border-brand-700 shadow-lg transform scale-105 hover:scale-110 transition-transform ';
        borderRadius = 'rounded-l-xl ';
      } else if (isRangeEnd) {
        // End of period - rounded right, square left
        className += 'bg-gradient-to-l from-brand-500 to-brand-600 text-white font-bold border-2 border-brand-700 shadow-lg transform scale-105 hover:scale-110 transition-transform ';
        borderRadius = 'rounded-r-xl ';
      } else {
        // Middle of period - subtle background with connecting lines
        className += 'bg-gradient-to-r from-brand-50 via-brand-100 to-brand-50 text-brand-800 border-t-2 border-b-2 border-brand-300 dark:bg-brand-500/15 dark:text-brand-300 dark:border-brand-500/40 hover:bg-brand-100 transition-colors ';
        borderRadius = 'rounded-none ';
      }
      tooltipText = `📅 ${rangeInfo.title}\n⏱️ ${rangeInfo.duration} jour${rangeInfo.duration > 1 ? 's' : ''} (${rangeInfo.durationHours}h)\n${rangeInfo.assignedTo ? `👤 ${rangeInfo.assignedTo}` : ''}\n${rangeInfo.location ? `📍 ${rangeInfo.location}` : ''}`;
    } else if (isToday) {
      className += 'bg-gray-800 text-white font-bold ring-2 ring-gray-600 ring-offset-1 dark:bg-gray-600 dark:ring-gray-400 ';
      tooltipText = "Aujourd'hui";
    } else if (isCurrentMonth) {
      className += 'text-gray-700 hover:bg-brand-50 hover:text-brand-700 hover:border hover:border-brand-200 dark:text-gray-300 dark:hover:bg-brand-500/10 dark:hover:text-brand-300 ';
      tooltipText = 'Cliquez pour sélectionner';
    } else {
      className += 'text-gray-400 dark:text-gray-600 ';
      tooltipText = '';
    }
    
    return (
      <div
        key={date.toISOString()}
        className={className + borderRadius}
        onClick={() => !isPast && handleDateClick(date)}
        onMouseEnter={() => !isPast && handleDateHover(date)}
        title={tooltipText}
      >
        <span className="relative z-10">{date.getDate()}</span>
        
        {/* Existing period indicator - enhanced visibility */}
        {rangeInfo && (
          <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-white border-2 border-current shadow-lg animate-pulse"></div>
        )}
        

        
        {/* Connection lines for ranges */}
        {(isInCurrentSelection && !isStart && !isEnd) || (rangeInfo && rangeInfo.startDate.toDateString() !== date.toDateString() && rangeInfo.endDate.toDateString() !== date.toDateString()) ? (
          <div className="absolute inset-y-0 left-0 w-full bg-brand-200 dark:bg-brand-500/20 -z-10"></div>
        ) : null}
        
        {/* Left connections */}
        {(isInCurrentSelection && !isStart) || (rangeInfo && rangeInfo.startDate.toDateString() !== date.toDateString()) ? (
          <div className="absolute inset-y-0 -left-1 w-1 bg-brand-200 dark:bg-brand-500/20 -z-10"></div>
        ) : null}
        
        {/* Right connections */}
        {(isInCurrentSelection && !isEnd && currentSelection.start && (hoveredDate || currentSelection.end)) || (rangeInfo && rangeInfo.endDate.toDateString() !== date.toDateString()) ? (
          <div className="absolute inset-y-0 -right-1 w-1 bg-brand-200 dark:bg-brand-500/20 -z-10"></div>
        ) : null}
      </div>
    );
  }, [isDateInRange, isDateInCurrentSelection, isSelectionStart, isSelectionEnd, handleDateClick, handleDateHover, currentSelection, hoveredDate]);

  return (
    <div className="overflow-hidden">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Périodes Disponibles
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Planifiez et gérez les créneaux disponibles pour les interventions de maintenance
            </p>
          </div>
        </div>
        
        {/* Success Message */}
        {successMessage && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-500/10 dark:border-green-500/30">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-800 dark:text-green-300 font-medium">
                {successMessage}
              </span>
            </div>
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-500/10 dark:border-red-500/30">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-800 dark:text-red-300 font-medium">
                {error}
              </span>
            </div>
          </div>
        )}
        
        {/* Loading State */}
        {loading && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-500/10 dark:border-blue-500/30">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-blue-800 dark:text-blue-300 font-medium">
                Chargement en cours...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat, index) => {
          const getColorClasses = (color: string) => {
            switch (color) {
              case "green":
                return "bg-green-50 text-green-500 dark:bg-green-500/10 dark:text-green-400";
              case "blue":
                return "bg-blue-50 text-blue-500 dark:bg-blue-500/10 dark:text-blue-400";
              case "purple":
                return "bg-purple-50 text-purple-500 dark:bg-purple-500/10 dark:text-purple-400";
              case "brand":
              default:
                return "bg-brand-50 text-brand-500 dark:bg-brand-500/10 dark:text-brand-400";
            }
          };

          return (
            <div
              key={index}
              className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
                <div className={`flex items-center justify-center w-12 h-12 rounded-full ${getColorClasses(stat.color)}`}>
                  {stat.icon}
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className={`text-sm font-medium ${
                  stat.changeType === 'increase' 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {stat.change}
                </span>
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                  vs mois dernier
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Calendar Header */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Planification des Périodes
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Sélectionnez les dates pour créer des créneaux disponibles
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode('year')}
              className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium shadow-theme-xs transition ${
                viewMode === 'year'
                  ? 'bg-brand-500 text-white border-brand-500'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200'
              }`}
            >
              Année
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium shadow-theme-xs transition ${
                viewMode === 'month'
                  ? 'bg-brand-500 text-white border-brand-500'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200'
              }`}
            >
              Mois
            </button>
          </div>
        </div>
        <div className="flex justify-between items-center mb-4 mt-6">
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (viewMode === 'year') {
                  const today = new Date();
                  const minYear = today.getFullYear();
                  if (currentYear > minYear) {
                    setCurrentYear(prev => prev - 1);
                  }
                } else {
                  const today = new Date();
                  const currentMonthIndex = today.getMonth();
                  const currentYearValue = today.getFullYear();
                  
                  if (currentMonth === 0) {
                    if (currentYear > currentYearValue) {
                      setCurrentMonth(11);
                      setCurrentYear(prev => prev - 1);
                    }
                  } else {
                    // Don't go to past months in current year
                    if (!(currentYear === currentYearValue && currentMonth - 1 < currentMonthIndex)) {
                      setCurrentMonth(prev => prev - 1);
                    }
                  }
                }
              }}
              disabled={(() => {
                const today = new Date();
                const currentMonthIndex = today.getMonth();
                const currentYearValue = today.getFullYear();
                
                if (viewMode === 'year') {
                  return currentYear <= currentYearValue;
                } else {
                  return currentYear === currentYearValue && currentMonth <= currentMonthIndex;
                }
              })()}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
            >
              ←
            </button>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 capitalize px-4 py-2.5">
              {viewMode === 'year' ? currentYear : monthCalendar.name}
            </h3>
            <button
              onClick={() => {
                if (viewMode === 'year') {
                  setCurrentYear(prev => prev + 1);
                } else {
                  if (currentMonth === 11) {
                    setCurrentMonth(0);
                    setCurrentYear(prev => prev + 1);
                  } else {
                    setCurrentMonth(prev => prev + 1);
                  }
                }
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
            >
              →
            </button>
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-brand-500 rounded-full"></div>
              <span className="text-gray-700 dark:text-gray-300">Période planifiée</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-white border-2 border-brand-500 rounded-full animate-pulse"></div>
              <span className="text-gray-700 dark:text-gray-300">Indicateur de période</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-800 rounded-full dark:bg-gray-600"></div>
              <span className="text-gray-700 dark:text-gray-300">Aujourd'hui</span>
            </div>
          </div>
        </div>

        {/* Selection Summary */}
        {(currentSelection.start || (currentSelection.start && hoveredDate)) && (
          <div className="mt-4 p-4 bg-gradient-to-r from-brand-50 to-brand-100 border border-brand-200 rounded-lg dark:from-brand-500/10 dark:to-brand-500/20 dark:border-brand-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-medium text-gray-800 dark:text-white/90">
                    {currentSelection.start ? `Début: ${currentSelection.start.toLocaleDateString('fr-FR')}` : 'Sélectionnez une date de début'}
                  </span>
                </div>
                {(hoveredDate || currentSelection.end) && (
                  <>
                    <div className="w-8 h-0.5 bg-brand-300"></div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="font-medium text-gray-800 dark:text-white/90">
                        Fin: {(hoveredDate || currentSelection.end)?.toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center gap-3">
                {(hoveredDate || currentSelection.end) && currentSelection.start && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">
                      {(() => {
                        const end = hoveredDate || currentSelection.end;
                        if (end && currentSelection.start) {
                          const diffTime = Math.abs(end.getTime() - currentSelection.start.getTime());
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                          return `${diffDays} jour${diffDays > 1 ? 's' : ''} (${diffDays * 24}h)`;
                        }
                        return '';
                      })()}
                    </span>
                  </div>
                )}
                <button
                  onClick={() => {
                    setCurrentSelection({ start: null, end: null });
                    setHoveredDate(null);
                  }}
                  className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                  title="Annuler la sélection"
                >
                  <svg className="w-3 h-3 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {!currentSelection.end && !hoveredDate ? 
                'Cliquez sur une date de fin pour terminer la sélection ou cliquez sur la date de début pour créer une période d\'un jour' : 
                'Cliquez sur une date pour ouvrir le formulaire de création'
              }
            </div>
          </div>
        )}

        {/* Calendar Grid */}
        {viewMode === 'year' ? (
          yearCalendar.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Aucun mois disponible</p>
              <p className="text-sm">Tous les mois de cette année sont dans le passé.</p>
              <button 
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600"
                onClick={() => setCurrentYear(new Date().getFullYear())}
              >
                Aller à l'année actuelle
              </button>
            </div>
          ) : (
            <div className={`grid gap-4 ${yearCalendar.length <= 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : yearCalendar.length <= 6 ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-3 xl:grid-cols-4'}`}>
              {yearCalendar.map((month) => (
                <div key={month.month} className="border border-gray-200 rounded-lg p-4 dark:border-gray-800 dark:bg-gray-800/50">
                  <h4 className="font-medium mb-3 text-center text-gray-800 dark:text-white/90 capitalize">{month.name}</h4>
                  <div className="grid grid-cols-7 gap-1">
                    {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, index) => (
                      <div key={index} className="text-center font-medium text-gray-500 dark:text-gray-400 py-1 text-xs">
                        {day}
                      </div>
                    ))}
                    {month.days.map(date => renderDay(date, date.getMonth() === month.month))}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="border border-gray-200 rounded-lg p-4 dark:border-gray-800 dark:bg-gray-800/50">
            <div className="grid grid-cols-7 gap-2">
              {['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'].map(day => (
                <div key={day} className="text-center font-medium text-gray-500 dark:text-gray-400 py-2 text-sm">
                  {day}
                </div>
              ))}
              {monthCalendar.days.map(date => renderDay(date, date.getMonth() === currentMonth))}
            </div>
          </div>
        )}
      </div>

      {/* Selected Ranges */}
      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
        <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Périodes Sélectionnées
            </h3>
          </div>
          {selectedRanges.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                onClick={async () => {
                  try {
                    setLoading(true);
                    // Call backend to delete all periods
                    const promises = selectedRanges.map(range => 
                      maintenancePeriodsService.deleteMaintenancePeriod(range.id)
                    );
                    await Promise.all(promises);
                    setSelectedRanges([]);
                    setSuccessMessage('✅ Toutes les périodes ont été supprimées');
                    setTimeout(() => setSuccessMessage(null), 3000);
                  } catch (error) {
                    console.error('Error deleting all periods:', error);
                    setError('Erreur lors de la suppression des périodes');
                    setTimeout(() => setError(null), 5000);
                  } finally {
                    setLoading(false);
                  }
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
              >
                <Trash2 className="w-4 h-4" />
                Tout Supprimer
              </button>
              <button
                onClick={() => {
                  // Create workbook
                  const wb = XLSX.utils.book_new();
                  
                  // Prepare data for export
                  const data = selectedRanges.map(range => ({
                    "Date début d'Arrét (Window)": range.startDate,
                    "Date fin d'Arrét (Window)": range.endDate,
                    "Durée en Jr": range.duration,
                    "Durée en H": range.durationHours,
                    "Titre": range.title,
                    "Type": range.type,
                    "Statut": range.status
                  }));
                  
                  // Create worksheet
                  const ws = XLSX.utils.json_to_sheet(data);
                  
                  // Add worksheet to workbook
                  XLSX.utils.book_append_sheet(wb, ws, "Maintenance Windows");
                  
                  // Generate and download file
                  XLSX.writeFile(wb, `periodes-maintenance-${new Date().toISOString().split('T')[0]}.xlsx`);
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
              >
                <Plus className="w-4 h-4" />
                Exporter
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
              >
                <Upload className="w-4 h-4" />
                Importer
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={async (event) => {
                  try {
                    const file = event.target.files?.[0];
                    if (!file) return;

                                            // Read the Excel file
                        const reader = new FileReader();
                        reader.onload = async (e) => {
                          try {
                            const data = new Uint8Array(e.target?.result as ArrayBuffer);
                            const workbook = XLSX.read(data, { type: 'array', cellDates: true });
                            
                            // Get first sheet
                            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                            
                            // Convert to JSON with date parsing enabled
                            const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
                              raw: false, 
                              dateNF: 'yyyy-mm-dd'
                            });
                            console.log('Raw Excel data:', jsonData);
                        
                        const transformedData = transformExcelData(jsonData);
                        console.log('Transformed data:', transformedData);
                        
                        // Validate transformed data
                        const validData = transformedData.filter(item => {
                          const hasValidDates = item.startDate && item.endDate;
                          if (!hasValidDates) {
                            console.warn('Skipping item with invalid dates:', item);
                          }
                          return hasValidDates;
                        });
                        
                        if (validData.length === 0) {
                          throw new Error('Aucune donnée valide trouvée dans le fichier Excel');
                        }
                        
                        console.log('Valid data to import:', validData);
                        
                        // Send to backend
                        const response = await maintenancePeriodsService.importMaintenancePeriods({
                          periods: validData
                        });

                        if (response.success) {
                          // Refresh the periods list
                          const periodsResponse = await maintenancePeriodsService.getMaintenancePeriods();
                          if (periodsResponse.success) {
                            const transformedData = transformBackendData(periodsResponse.data);
                            setSelectedRanges(transformedData);
                            
                            const successCount = response.data.successful || 0;
                            const failedCount = response.data.failed || 0;
                            
                            if (failedCount > 0) {
                              setSuccessMessage(`✅ Import partiellement réussi: ${successCount} périodes créées, ${failedCount} échecs`);
                            } else {
                              setSuccessMessage(`✅ Import réussi: ${successCount} périodes créées`);
                            }
                          }
                        } else {
                          throw new Error(response.message || 'Import failed');
                        }
                      } catch (error) {
                        console.error('Error processing file:', error);
                        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
                        setError(`Erreur lors du traitement du fichier: ${errorMessage}. Vérifiez que les colonnes "Date début d'Arrét (Window)" et "Date fin d'Arrét (Window)" contiennent des dates valides.`);
                      }
                    };
                    reader.readAsArrayBuffer(file);
                  } catch (error) {
                    console.error('Error importing file:', error);
                    setError('Erreur lors de l\'import du fichier');
                  } finally {
                    // Clear the input
                    event.target.value = '';
                    setTimeout(() => setError(null), 5000);
                    setTimeout(() => setSuccessMessage(null), 3000);
                  }
                }}
                style={{ display: 'none' }}
              />
            </div>
          )}
        </div>
        {selectedRanges.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Aucune période planifiée</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Sélectionnez des dates sur le calendrier pour créer des créneaux disponibles</p>
          </div>
        ) : (
          <div className="space-y-4">
            {selectedRanges.map((range) => {
              const energyLossMW = range.durationHours * 315;
              const energyLossGWh = energyLossMW / 1000;
              
              return (
                <Card key={range.id} className="hover:shadow-lg transition-shadow duration-200">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <CardTitle className="mb-0">{range.title}</CardTitle>
                        <Badge 
                          color="primary"
                          size="sm"
                          variant="light"
                        >
                          Période
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        <div>
                          <CardDescription className="mb-1">
                            📅 Du {range.startDate.toLocaleDateString('fr-FR')} au {range.endDate.toLocaleDateString('fr-FR')}
                          </CardDescription>
                          <CardDescription>
                            ⏱️ Durée: {range.duration} jour{range.duration > 1 ? 's' : ''} ({range.durationHours.toLocaleString()}h)
                          </CardDescription>
                        </div>
                        <div>
                          <CardDescription className="mb-1">
                            ⚡ Perte: <span className="font-semibold text-red-600 dark:text-red-400">{energyLossMW.toLocaleString()} MW</span>
                          </CardDescription>
                          <CardDescription>
                            🔋 Équivalent: <span className="font-semibold text-red-600 dark:text-red-400">{energyLossGWh.toLocaleString()} GWh</span>
                          </CardDescription>
                        </div>
                      </div>
                      

                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => editRange(range)}
                        startIcon={<Edit3 className="w-4 h-4" />}
                      >
                        Modifier
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteRange(range.id)}
                        startIcon={<Trash2 className="w-4 h-4" />}
                        className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-500/10"
                      >
                        Supprimer
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Date Range Modal */}
      <Modal
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setCurrentSelection({ start: null, end: null });
          setEditingRange(null);
          setHoveredDate(null);
        }}
        className="max-w-[584px] p-5 lg:p-10"
      >
        <DateRangeForm
          initialData={editingRange}
          startDate={currentSelection.start}
          endDate={currentSelection.end}
          onSave={saveDateRange}
          onCancel={() => {
            setIsDialogOpen(false);
            setCurrentSelection({ start: null, end: null });
            setEditingRange(null);
            setHoveredDate(null);
          }}
        />
      </Modal>
    </div>
  );
}

// Date Range Form Component
interface DateRangeFormProps {
  initialData?: DateRange | null;
  startDate: Date | null;
  endDate: Date | null;
  onSave: (data: { title: string }) => void;
  onCancel: () => void;
}

const DateRangeForm: React.FC<DateRangeFormProps> = ({
  initialData,
  startDate,
  endDate,
  onSave,
  onCancel
}) => {
  // Generate default title for new periods
  const getDefaultTitle = () => {
    if (initialData?.title) return initialData.title;
    if (startDate && endDate) {
      const start = startDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
      const end = endDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
      return startDate.getTime() === endDate.getTime() ? `Période ${start}` : `Période ${start} - ${end}`;
    }
    return '';
  };

  const [title, setTitle] = useState(getDefaultTitle());

  const duration = startDate && endDate 
    ? Math.ceil(Math.abs(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
    : 0;

  const durationHours = duration * 24;
  const energyLossMW = durationHours * 315; // 315 MW per hour
  const energyLossGWh = energyLossMW / 1000; // Convert to GWh for better readability

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ title });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
        {initialData ? 'Modifier la période' : 'Créer une nouvelle période'}
      </h4>

      <div className="space-y-5">
        <div>
          <Label htmlFor="title">Titre de la période</Label>
          <InputField
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Maintenance préventive turbine A"
            required
          />
        </div>

        {startDate && endDate && (
          <div className="rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-orange-50 p-5 dark:border-red-500/30 dark:from-red-500/10 dark:to-orange-500/10">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h5 className="text-sm font-medium text-red-800 dark:text-red-300">
                Impact Énergétique
              </h5>
            </div>
            
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Période:</span>
                  <span className="text-xs font-medium text-gray-900 dark:text-white">
                    {startDate.toLocaleDateString('fr-FR')} → {endDate.toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Durée:</span>
                  <span className="text-xs font-medium text-gray-900 dark:text-white">
                    {duration} jour{duration > 1 ? 's' : ''} ({durationHours.toLocaleString()}h)
                  </span>
                </div>
              </div>
              
              <div className="space-y-2 border-l border-red-200 dark:border-red-500/30 pl-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Perte énergétique:</span>
                  <Badge variant="solid" color="error" size="sm">
                    {energyLossMW.toLocaleString()} MW
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Équivalent:</span>
                  <Badge variant="solid" color="error" size="sm">
                    {energyLossGWh.toLocaleString()} GWh
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="text-xs text-red-600 dark:text-red-400 italic border-t border-red-200 dark:border-red-500/30 pt-3 mt-3">
              * Basé sur 315 MW/heure de capacité de production
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end w-full gap-3 mt-6">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={onCancel}
          type="button"
        >
          Annuler
        </Button>
        <Button 
          size="sm" 
          type="submit"
        >
          {initialData ? 'Modifier' : 'Créer la période'}
        </Button>
      </div>
    </form>
  );
}; 