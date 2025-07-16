"use client";

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import Badge from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Trash2, Edit3, Calendar, Plus, Scissors, RotateCcw, Copy, Merge, Upload } from 'lucide-react';

interface DateRange {
  id: string;
  startDate: Date;
  endDate: Date;
  duration: number; // in days
  durationHours: number; // in hours
  title: string;
  type: 'maintenance' | 'repair' | 'inspection' | 'emergency';
  status: 'available' | 'booked' | 'pending';
}

interface DateRangeBookingProps {
  onDateRangesChange?: (ranges: DateRange[]) => void;
  initialRanges?: DateRange[];
}

const DateRangeBooking: React.FC<DateRangeBookingProps> = ({
  onDateRangesChange,
  initialRanges = []
}) => {
  // Sample data for demonstration
  const sampleRanges: DateRange[] = [
    {
      id: 'sample-1',
      startDate: new Date(2025, 0, 8), // January 8, 2025
      endDate: new Date(2025, 0, 14), // January 14, 2025
      duration: 7,
      durationHours: 168,
      title: 'Maintenance Turbine A',
      type: 'maintenance',
      status: 'booked'
    },
    {
      id: 'sample-2',
      startDate: new Date(2025, 1, 1), // February 1, 2025
      endDate: new Date(2025, 1, 28), // February 28, 2025
      duration: 28,
      durationHours: 672,
      title: 'Arrêt Maintenance Générale',
      type: 'maintenance',
      status: 'available'
    },
    {
      id: 'sample-3',
      startDate: new Date(2025, 2, 15), // March 15, 2025
      endDate: new Date(2025, 2, 20), // March 20, 2025
      duration: 6,
      durationHours: 144,
      title: 'Inspection Réglementaire',
      type: 'inspection',
      status: 'pending'
    }
  ];
  
  const [selectedRanges, setSelectedRanges] = useState<DateRange[]>(
    initialRanges.length > 0 ? initialRanges : sampleRanges
  );
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const typeColors = {
    maintenance: 'bg-blue-100 border-blue-300 text-blue-800',
    repair: 'bg-red-100 border-red-300 text-red-800',
    inspection: 'bg-green-100 border-green-300 text-green-800',
    emergency: 'bg-orange-100 border-orange-300 text-orange-800'
  };

  const statusColors = {
    available: 'bg-green-50 border-green-200',
    booked: 'bg-gray-50 border-gray-200',
    pending: 'bg-yellow-50 border-yellow-200'
  };

  // Generate calendar days for year view
  const generateYearCalendar = useCallback(() => {
    const months = [];
    for (let month = 0; month < 12; month++) {
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

  // Handle date click
  const handleDateClick = useCallback((date: Date) => {
    if (date < new Date()) return; // Don't allow past dates
    
    if (!currentSelection.start) {
      setCurrentSelection({ start: date, end: null });
    } else if (!currentSelection.end) {
      const start = currentSelection.start;
      const end = date;
      setCurrentSelection({ 
        start: start < end ? start : end, 
        end: start < end ? end : start 
      });
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

  // Calculate duration
  const calculateDuration = useCallback((start: Date, end: Date) => {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return {
      days: diffDays,
      hours: diffDays * 24
    };
  }, []);

  // Save date range
  const saveDateRange = useCallback((formData: {
    title: string;
    type: DateRange['type'];
    status: DateRange['status'];
  }) => {
    if (!currentSelection.start || !currentSelection.end) return;
    
    const duration = calculateDuration(currentSelection.start, currentSelection.end);
    const newRange: DateRange = {
      id: editingRange?.id || Date.now().toString(),
      startDate: currentSelection.start,
      endDate: currentSelection.end,
      duration: duration.days,
      durationHours: duration.hours,
      title: formData.title,
      type: formData.type,
      status: formData.status
    };

    if (editingRange) {
      setSelectedRanges(prev => prev.map(range => 
        range.id === editingRange.id ? newRange : range
      ));
    } else {
      setSelectedRanges(prev => [...prev, newRange]);
    }

    setCurrentSelection({ start: null, end: null });
    setEditingRange(null);
    setIsDialogOpen(false);
    setHoveredDate(null);
    
    onDateRangesChange?.(editingRange 
      ? selectedRanges.map(range => range.id === editingRange.id ? newRange : range)
      : [...selectedRanges, newRange]
    );
  }, [currentSelection, editingRange, selectedRanges, calculateDuration, onDateRangesChange]);

  // Delete date range
  const deleteRange = useCallback((id: string) => {
    const newRanges = selectedRanges.filter(range => range.id !== id);
    setSelectedRanges(newRanges);
    onDateRangesChange?.(newRanges);
  }, [selectedRanges, onDateRangesChange]);

  // Edit date range
  const editRange = useCallback((range: DateRange) => {
    setEditingRange(range);
    setCurrentSelection({ start: range.startDate, end: range.endDate });
    setIsDialogOpen(true);
  }, []);

  // Cut date range (split into two)
  const cutRange = useCallback((range: DateRange, cutDate: Date) => {
    if (cutDate <= range.startDate || cutDate >= range.endDate) return;
    
    const duration1 = calculateDuration(range.startDate, cutDate);
    const duration2 = calculateDuration(new Date(cutDate.getTime() + 24 * 60 * 60 * 1000), range.endDate);
    
    const range1: DateRange = {
      ...range,
      id: range.id + '_1',
      endDate: cutDate,
      duration: duration1.days,
      durationHours: duration1.hours,
      title: range.title + ' (Partie 1)'
    };
    
    const range2: DateRange = {
      ...range,
      id: range.id + '_2',
      startDate: new Date(cutDate.getTime() + 24 * 60 * 60 * 1000),
      duration: duration2.days,
      durationHours: duration2.hours,
      title: range.title + ' (Partie 2)'
    };
    
    const newRanges = selectedRanges.filter(r => r.id !== range.id).concat([range1, range2]);
    setSelectedRanges(newRanges);
    onDateRangesChange?.(newRanges);
  }, [selectedRanges, calculateDuration, onDateRangesChange]);

  // Merge adjacent ranges
  const mergeRanges = useCallback((range1: DateRange, range2: DateRange) => {
    if (range1.type !== range2.type || range1.status !== range2.status) return;
    
    const startDate = range1.startDate < range2.startDate ? range1.startDate : range2.startDate;
    const endDate = range1.endDate > range2.endDate ? range1.endDate : range2.endDate;
    const duration = calculateDuration(startDate, endDate);
    
    const mergedRange: DateRange = {
      id: Date.now().toString(),
      startDate,
      endDate,
      duration: duration.days,
      durationHours: duration.hours,
      title: `${range1.title} + ${range2.title}`,
      type: range1.type,
      status: range1.status
    };
    
    const newRanges = selectedRanges
      .filter(r => r.id !== range1.id && r.id !== range2.id)
      .concat([mergedRange]);
    setSelectedRanges(newRanges);
    onDateRangesChange?.(newRanges);
  }, [selectedRanges, calculateDuration, onDateRangesChange]);

  // Duplicate range
  const duplicateRange = useCallback((range: DateRange) => {
    const newRange: DateRange = {
      ...range,
      id: Date.now().toString(),
      title: range.title + ' (Copie)',
      status: 'available'
    };
    
    const newRanges = [...selectedRanges, newRange];
    setSelectedRanges(newRanges);
    onDateRangesChange?.(newRanges);
  }, [selectedRanges, onDateRangesChange]);

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
          onDateRangesChange?.(validRanges);
        }
      } catch (error) {
        console.error('Erreur lors de l\'import:', error);
        alert('Erreur lors de l\'import du fichier');
      }
    };
    reader.readAsText(file);
  }, [onDateRangesChange]);

  // Render calendar day
  const renderDay = useCallback((date: Date, isCurrentMonth: boolean = true) => {
    const isToday = date.toDateString() === new Date().toDateString();
    const isPast = date < new Date();
    const rangeInfo = isDateInRange(date);
    const isInCurrentSelection = isDateInCurrentSelection(date);
    
    let className = 'w-8 h-8 flex items-center justify-center text-sm cursor-pointer rounded transition-colors ';
    
    if (isPast) {
      className += 'text-gray-300 cursor-not-allowed ';
    } else if (rangeInfo) {
      className += `${typeColors[rangeInfo.type]} border `;
    } else if (isInCurrentSelection) {
      className += 'bg-blue-200 text-blue-800 ';
    } else if (isToday) {
      className += 'bg-blue-500 text-white font-bold ';
    } else if (isCurrentMonth) {
      className += 'text-gray-700 hover:bg-gray-100 ';
    } else {
      className += 'text-gray-400 ';
    }
    
    return (
      <div
        key={date.toISOString()}
        className={className}
        onClick={() => !isPast && handleDateClick(date)}
        onMouseEnter={() => !isPast && handleDateHover(date)}
        title={rangeInfo ? `${rangeInfo.title} (${rangeInfo.duration} jours)` : ''}
      >
        {date.getDate()}
      </div>
    );
  }, [isDateInRange, isDateInCurrentSelection, handleDateClick, handleDateHover, typeColors]);

  // Calculate statistics
  const totalPeriods = selectedRanges.length;
  const totalDays = selectedRanges.reduce((sum, range) => sum + range.duration, 0);
  const totalHours = selectedRanges.reduce((sum, range) => sum + range.durationHours, 0);
  const availablePeriods = selectedRanges.filter(range => range.status === 'available').length;
  const bookedPeriods = selectedRanges.filter(range => range.status === 'booked').length;
  const pendingPeriods = selectedRanges.filter(range => range.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Périodes</p>
              <p className="text-2xl font-bold text-blue-600">{totalPeriods}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Jours</p>
              <p className="text-2xl font-bold text-green-600">{totalDays}</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold text-sm">{totalDays}</span>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Disponible</p>
              <p className="text-2xl font-bold text-green-600">{availablePeriods}</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold text-sm">✓</span>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Réservé</p>
              <p className="text-2xl font-bold text-red-600">{bookedPeriods}</p>
            </div>
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 font-bold text-sm">●</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Planification des Périodes de Réparation
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'year' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('year')}
              >
                Année
              </Button>
              <Button
                variant={viewMode === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('month')}
              >
                Mois
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (viewMode === 'year') {
                    setCurrentYear(prev => prev - 1);
                  } else {
                    if (currentMonth === 0) {
                      setCurrentMonth(11);
                      setCurrentYear(prev => prev - 1);
                    } else {
                      setCurrentMonth(prev => prev - 1);
                    }
                  }
                }}
              >
                ←
              </Button>
              <h3 className="text-lg font-semibold">
                {viewMode === 'year' ? currentYear : monthCalendar.name}
              </h3>
              <Button
                variant="outline"
                size="sm"
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
              >
                →
              </Button>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
                <span>Maintenance</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
                <span>Réparation</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                <span>Inspection</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-orange-100 border border-orange-300 rounded"></div>
                <span>Urgence</span>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          {viewMode === 'year' ? (
            <div className="grid grid-cols-3 gap-6">
              {yearCalendar.map((month) => (
                <div key={month.month} className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2 text-center">{month.name}</h4>
                  <div className="grid grid-cols-7 gap-1 text-xs">
                    {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map(day => (
                      <div key={day} className="text-center font-medium text-gray-500 py-1">
                        {day}
                      </div>
                    ))}
                    {month.days.map(date => renderDay(date, date.getMonth() === month.month))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border rounded-lg p-4">
              <div className="grid grid-cols-7 gap-2 text-sm">
                {['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'].map(day => (
                  <div key={day} className="text-center font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
                {monthCalendar.days.map(date => renderDay(date, date.getMonth() === currentMonth))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Ranges */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Périodes Sélectionnées</CardTitle>
            {selectedRanges.length > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newRanges = selectedRanges.map(range => ({ ...range, status: 'available' as const }));
                    setSelectedRanges(newRanges);
                    onDateRangesChange?.(newRanges);
                  }}
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Tout Disponible
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedRanges([]);
                    onDateRangesChange?.([]);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Tout Supprimer
                </Button>
                                 <Button
                   variant="outline"
                   size="sm"
                   onClick={() => {
                     const dataStr = JSON.stringify(selectedRanges, null, 2);
                     const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                     const exportFileDefaultName = `periodes-reparation-${new Date().toISOString().split('T')[0]}.json`;
                     const linkElement = document.createElement('a');
                     linkElement.setAttribute('href', dataUri);
                     linkElement.setAttribute('download', exportFileDefaultName);
                     linkElement.click();
                   }}
                 >
                   <Plus className="w-4 h-4 mr-1" />
                   Exporter
                 </Button>
                 <Button
                   variant="outline"
                   size="sm"
                   onClick={() => fileInputRef.current?.click()}
                 >
                   <Upload className="w-4 h-4 mr-1" />
                   Importer
                 </Button>
                 <input
                   ref={fileInputRef}
                   type="file"
                   accept=".json"
                   onChange={handleFileImport}
                   style={{ display: 'none' }}
                 />
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {selectedRanges.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Aucune période sélectionnée. Cliquez sur le calendrier pour commencer.
            </p>
          ) : (
            <div className="space-y-3">
              {selectedRanges.map((range) => (
                <div
                  key={range.id}
                  className={`p-4 rounded-lg border ${statusColors[range.status]}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{range.title}</h4>
                        <Badge className={typeColors[range.type]}>
                          {range.type}
                        </Badge>
                        <Badge variant="outline">
                          {range.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        Du {range.startDate.toLocaleDateString('fr-FR')} au {range.endDate.toLocaleDateString('fr-FR')}
                      </p>
                      <p className="text-sm text-gray-500">
                        Durée: {range.duration} jours ({range.durationHours}h)
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => editRange(range)}
                        title="Modifier"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => duplicateRange(range)}
                        title="Dupliquer"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const cutDate = new Date(range.startDate.getTime() + (range.endDate.getTime() - range.startDate.getTime()) / 2);
                          cutRange(range, cutDate);
                        }}
                        title="Couper en deux"
                      >
                        <Scissors className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteRange(range.id)}
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Date Range Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingRange ? 'Modifier la période' : 'Nouvelle période de réparation'}
            </DialogTitle>
          </DialogHeader>
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
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Date Range Form Component
interface DateRangeFormProps {
  initialData?: DateRange | null;
  startDate: Date | null;
  endDate: Date | null;
  onSave: (data: { title: string; type: DateRange['type']; status: DateRange['status'] }) => void;
  onCancel: () => void;
}

const DateRangeForm: React.FC<DateRangeFormProps> = ({
  initialData,
  startDate,
  endDate,
  onSave,
  onCancel
}) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [type, setType] = useState<DateRange['type']>(initialData?.type || 'maintenance');
  const [status, setStatus] = useState<DateRange['status']>(initialData?.status || 'available');

  const duration = startDate && endDate 
    ? Math.ceil(Math.abs(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ title, type, status });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Titre de la période</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Maintenance préventive turbine A"
          required
        />
      </div>

      <div>
        <Label htmlFor="type">Type d'intervention</Label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value as DateRange['type'])}
          className="w-full p-2 border rounded-md"
        >
          <option value="maintenance">Maintenance</option>
          <option value="repair">Réparation</option>
          <option value="inspection">Inspection</option>
          <option value="emergency">Urgence</option>
        </select>
      </div>

      <div>
        <Label htmlFor="status">Statut</Label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as DateRange['status'])}
          className="w-full p-2 border rounded-md"
        >
          <option value="available">Disponible</option>
          <option value="booked">Réservé</option>
          <option value="pending">En attente</option>
        </select>
      </div>

      {startDate && endDate && (
        <div className="p-3 bg-gray-50 rounded-md">
          <p className="text-sm">
            <strong>Période:</strong> {startDate.toLocaleDateString('fr-FR')} - {endDate.toLocaleDateString('fr-FR')}
          </p>
          <p className="text-sm">
            <strong>Durée:</strong> {duration} jours ({duration * 24}h)
          </p>
        </div>
      )}

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">
          {initialData ? 'Modifier' : 'Ajouter'}
        </Button>
      </div>
    </form>
  );
};

export default DateRangeBooking; 