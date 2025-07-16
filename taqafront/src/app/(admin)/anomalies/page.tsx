"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import Link from "next/link";
import DashboardHeader from "@/components/layout/dashboard-header";
import { AnomalyService } from "@/lib/services/anomaly-service";
import { AuthService } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { EquipmentAutocomplete } from "@/components/ui/equipment-autocomplete";
import { Equipment } from "@/types/database-types";
import { useGlobalLoader } from "@/context/GlobalLoaderContext";

// Types
interface StatCard {
  title: string;
  value: string;
  change: string;
  changeType: "increase" | "decrease";
  color: string;
  icon: React.ReactNode;
}

// Create statistics data structure from backend stats
const createStatsFromBackend = (backendStats: any): StatCard[] => {
  const statusDistribution = backendStats?.statusDistribution || {};
  const priorityDistribution = backendStats?.priorityDistribution || {};
  const totalAnomalies = backendStats?.totalAnomalies || 0;

  // Map backend priority values (P1, P2, P3) to frontend labels
  console.log('Priority distribution from backend:', priorityDistribution);

  return [
    // Severity Level Cards (mapped from backend priority values) - Now 3 levels
  {
    title: "Critique",
      value: (priorityDistribution.P1 || 0).toString(), // P1 = Critical (Criticité > 9)
      change: "+5%", // Static for now, could be calculated from historical data
    changeType: "increase" as const,
    color: "red",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    title: "Normale",
      value: (priorityDistribution.P2 || 0).toString(), // P2 = Medium/Normal
    change: "+2%",
    changeType: "increase" as const,
    color: "yellow",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    title: "Faible",
      value: (priorityDistribution.P3 || 0).toString(), // P3 = Low
    change: "-3%",
    changeType: "decrease" as const,
    color: "green",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
  },
  // Status/Workflow Cards
  {
    title: "Nouvelles",
      value: (statusDistribution.open || 0).toString(),
    change: "+3%",
    changeType: "increase" as const,
    color: "blue",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    title: "En cours",
      value: (statusDistribution.in_progress || 0).toString(),
    change: "-8%",
    changeType: "decrease" as const,
    color: "purple",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    title: "Résolues",
      value: ((statusDistribution.resolved || 0) + (statusDistribution.closed || 0)).toString(),
    change: "+15%",
    changeType: "increase" as const,
    color: "green",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    title: "Total",
      value: totalAnomalies.toString(),
    change: "+12%",
    changeType: "increase" as const,
    color: "brand",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
      </svg>
    ),
  },
];
};

export default function AnomaliesPage() {
  // Global loader
  const { setLoading: setGlobalLoading } = useGlobalLoader();
  
  // Backend data states
  const [anomaliesData, setAnomaliesData] = useState<any[]>([]);
  const [statsData, setStatsData] = useState<StatCard[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // UI states
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isFormSidebarOpen, setIsFormSidebarOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingAnomaly, setEditingAnomaly] = useState<any>(null);
  const [csvUploadFile, setCsvUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    systeme: '',
    description: '',
    dateDetection: '',
    descriptionEquipement: '',
    sectionProprietaire: '',
    estimatedTimeToResolve: '',
    severity: 'medium',
    priority: 'medium',
    // Add availability factors
    disponibilite: '',
    fiabilite: '',
    processSafety: ''
  });
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [aiPredictionLoading, setAiPredictionLoading] = useState(false);

  const router = useRouter();

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, severityFilter, debouncedSearchTerm]);

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('=== Starting to fetch anomalies data ===');
        console.log('Current filters:', { 
          currentPage, 
          itemsPerPage, 
          statusFilter, 
          severityFilter, 
          debouncedSearchTerm 
        });
        
        setGlobalLoading(true, 'Chargement des anomalies...');
        setError(null);

        // Fetch anomalies and stats in parallel
        const [anomalies, stats] = await Promise.all([
          AnomalyService.getAllAnomalies(),
          AnomalyService.getAnomalyStats()
        ]);

        // Set the data
        setAnomaliesData(anomalies);
        setStatsData(createStatsFromBackend(stats));
        setGlobalLoading(false);
      } catch (err) {
        console.error('=== ERROR FETCHING ANOMALIES DATA ===');
        console.error('Error message:', err instanceof Error ? err.message : String(err));
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        setGlobalLoading(false);
      }
    };

    // Check if user is authenticated before fetching data
    if (AuthService.isAuthenticated()) {
      fetchData();
    } else {
      router.push('/auth/login');
    }
  }, [currentPage, itemsPerPage, statusFilter, severityFilter, debouncedSearchTerm, router]);

  // Reset form
  const resetForm = () => {
    setFormData({
      systeme: '',
      description: '',
      dateDetection: '',
      descriptionEquipement: '',
      sectionProprietaire: '',
      estimatedTimeToResolve: '',
      severity: 'medium',
      priority: 'medium',
      // Add availability factors
      disponibilite: '',
      fiabilite: '',
      processSafety: ''
    });
    setSelectedEquipment(null);
    setEditMode(false);
    setEditingAnomaly(null);
  };

  // Close sidebar
  const closeSidebar = () => {
    setIsFormSidebarOpen(false);
    resetForm();
  };

  // Handle click outside
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (openDropdown && event.target instanceof Element && !event.target.closest('.relative')) {
      setOpenDropdown(null);
    }
  }, [openDropdown]);

  // Add click outside listener
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  // Handle form submission
  const handleFormSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setGlobalLoading(true, editMode ? 'Mise à jour de l\'anomalie...' : 'Création de l\'anomalie...');
      setError(null);

      // Get current user to include reportedById
      const currentUser = AuthService.getUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      if (editMode && editingAnomaly) {
        // Update existing anomaly
        const updatedAnomaly = await AnomalyService.updateAnomaly(editingAnomaly.id, {
          title: formData.description, // Use description as title for now
          description: formData.description,
          severity: formData.severity as 'critical' | 'medium' | 'low', // Use severity instead of priority for manual updates
          category: formData.systeme,
          equipmentId: selectedEquipment?.id || formData.descriptionEquipement,
          reportedAt: formData.dateDetection ? new Date(formData.dateDetection).toISOString() : undefined,
          // Add availability factors
          disponibilite: formData.disponibilite ? parseInt(formData.disponibilite) : undefined,
          fiabilite: formData.fiabilite ? parseInt(formData.fiabilite) : undefined,
          processSafety: formData.processSafety ? parseInt(formData.processSafety) : undefined
        });

        // Update the list with the updated anomaly
        setAnomaliesData(prev => prev.map(anomaly => 
          anomaly.id === editingAnomaly.id ? updatedAnomaly : anomaly
        ));
        
        toast.success('Anomalie mise à jour avec succès');
      } else {
        // Create new anomaly
        let anomalyData: any = {
          title: formData.description,
          description: formData.description,
          category: formData.systeme,
          equipmentId: selectedEquipment?.id || formData.descriptionEquipement,
          reportedById: currentUser.id,
          reportedAt: formData.dateDetection ? new Date(formData.dateDetection).toISOString() : new Date().toISOString(),
          sectionProprietaire: formData.sectionProprietaire,
          estimatedTimeToResolve: formData.estimatedTimeToResolve
        };

        // Check if availability factors are provided
        const hasAvailabilityFactors = formData.disponibilite && formData.fiabilite && formData.processSafety;
        
        if (hasAvailabilityFactors) {
          // Use provided availability factors for direct calculation
          anomalyData.disponibilite = parseInt(formData.disponibilite);
          anomalyData.fiabilite = parseInt(formData.fiabilite);
          anomalyData.processSafety = parseInt(formData.processSafety);
          
          console.log('Creating anomaly with provided availability factors:', {
            disponibilite: anomalyData.disponibilite,
            fiabilite: anomalyData.fiabilite,
            processSafety: anomalyData.processSafety
          });
        } else {
          // Get AI prediction for missing availability factors
          try {
            console.log('Getting AI prediction for anomaly creation...');
            const aiPrediction = await AnomalyService.getAIPrediction({
              description: formData.description,
              equipmentId: selectedEquipment?.id || formData.descriptionEquipement
            });
            
            // Use AI predicted values
            anomalyData.disponibilite = aiPrediction.disponibilite;
            anomalyData.fiabilite = aiPrediction.fiabilite;
            anomalyData.processSafety = aiPrediction.processSafety;
            
            console.log('Using AI predicted availability factors:', {
              disponibilite: anomalyData.disponibilite,
              fiabilite: anomalyData.fiabilite,
              processSafety: anomalyData.processSafety,
              aiConfidence: aiPrediction.aiConfidence
            });
          } catch (aiError) {
            console.warn('AI prediction failed, using default values:', aiError);
            // Fallback to default values if AI prediction fails
            anomalyData.disponibilite = 2;
            anomalyData.fiabilite = 2;
            anomalyData.processSafety = 2;
          }
        }

        // Create the anomaly
        const newAnomaly = await AnomalyService.createAnomaly(anomalyData);

        // Update the list with the new anomaly
        setAnomaliesData(prev => [...prev, newAnomaly]);
        
        toast.success('Anomalie créée avec succès');
      }
      
      // Reset form and close sidebar
      resetForm();
      closeSidebar();
      setGlobalLoading(false);
    } catch (err) {
      console.error('Error submitting anomaly:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit anomaly');
      setGlobalLoading(false);
    }
  }, [formData, editMode, editingAnomaly, selectedEquipment, resetForm, closeSidebar]);
  // Handle file upload (CSV and Excel)
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) return;
    
    const file = event.target.files[0];
    
    // Validate file type
    const allowedTypes = ['.csv', '.xlsx', '.xls'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!allowedTypes.includes(fileExtension)) {
      setError('Type de fichier non supporté. Veuillez sélectionner un fichier CSV ou Excel (.csv, .xlsx, .xls).');
      return;
    }
    
    setCsvUploadFile(file);
    setIsUploading(true);

    try {
      // Upload the file using the existing CSV upload endpoint (now supports Excel)
      await AnomalyService.uploadCsvFile(file);
      
      // Refresh the data
      const anomalies = await AnomalyService.getAllAnomalies();
      setAnomaliesData(anomalies);
      
      setCsvUploadFile(null);
      setIsUploading(false);
      
      // Show success message
      setError(null);
    } catch (err) {
      console.error('Error uploading file:', err);
      setError(err instanceof Error ? err.message : 'Échec du téléchargement du fichier');
      setIsUploading(false);
    }
  };

  // Handle row selection
  const handleRowSelect = (id: string) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(currentData.map(anomaly => anomaly.id)));
    }
    setSelectAll(!selectAll);
  };

  // Handle dropdown toggle
  const toggleDropdown = (id: string) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  // Handle edit anomaly
  const handleEditAnomaly = (anomaly: any) => {
    setEditingAnomaly(anomaly);
    setFormData({
      systeme: anomaly.category || '',
      description: anomaly.description || '',
      dateDetection: anomaly.reportedAt ? new Date(anomaly.reportedAt).toISOString().slice(0, 16) : '',
      descriptionEquipement: anomaly.equipment?.name || anomaly.equipmentId || '',
      sectionProprietaire: anomaly.sectionProprietaire || '',
      estimatedTimeToResolve: anomaly.estimatedTimeToResolve || '',
      severity: anomaly.severity || 'medium',
      priority: anomaly.priority || 'medium',
      // Add availability factors
      disponibilite: anomaly.disponibilite?.toString() || '',
      fiabilite: anomaly.fiabilite?.toString() || '',
      processSafety: anomaly.processSafety?.toString() || ''
    });
    setSelectedEquipment(anomaly.equipment || null);
    setEditMode(true);
    setIsFormSidebarOpen(true);
  };

  // Handle form change
  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Get AI prediction for availability factors
  const getAIPrediction = async () => {
    if (!formData.description || !selectedEquipment?.id) {
      toast.error('Veuillez remplir la description et sélectionner un équipement d\'abord');
      return;
    }

    try {
      setAiPredictionLoading(true);
      const aiPrediction = await AnomalyService.getAIPrediction({
        description: formData.description,
        equipmentId: selectedEquipment.id
      });

      // Update form with AI predicted values
      setFormData(prev => ({
        ...prev,
        disponibilite: aiPrediction.disponibilite.toString(),
        fiabilite: aiPrediction.fiabilite.toString(),
        processSafety: aiPrediction.processSafety.toString(),
        severity: aiPrediction.severity
      }));

      toast.success(`Prédiction IA obtenue avec ${Math.round(aiPrediction.aiConfidence * 100)}% de confiance`);
    } catch (error) {
      console.error('Error getting AI prediction:', error);
      toast.error('Erreur lors de la prédiction IA');
    } finally {
      setAiPredictionLoading(false);
    }
  };

  // Handle create REX
  const handleCreateRex = (anomaly: any) => {
    router.push(`/rex/new?anomalyId=${anomaly.id}`);
  };

  // Handle delete anomaly
  const handleDeleteAnomaly = async (anomaly: any) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette anomalie ?')) {
      try {
        await AnomalyService.deleteAnomaly(anomaly.id);
        // Refresh the data
        const anomalies = await AnomalyService.getAllAnomalies();
        setAnomaliesData(anomalies);
        toast.success('Anomalie supprimée avec succès');
      } catch (error) {
        console.error('Error deleting anomaly:', error);
        toast.error('Erreur lors de la suppression de l\'anomalie');
      }
    }
  };

  // Apply client-side filtering and pagination
  const filteredData = useMemo(() => {
    let filtered = anomaliesData;

    // Apply search filter
    if (debouncedSearchTerm) {
      filtered = filtered.filter(anomaly => 
        anomaly.title?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        anomaly.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        anomaly.id?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        anomaly.equipment?.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }

    // Apply severity filter
    if (severityFilter !== 'all') {
      if (severityFilter === 'P1') {
        filtered = filtered.filter(anomaly => anomaly.severity === 'critical');
      } else if (severityFilter === 'P2') {
        filtered = filtered.filter(anomaly => anomaly.severity === 'medium');
      } else if (severityFilter === 'P3') {
        filtered = filtered.filter(anomaly => anomaly.severity === 'low');
      }
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(anomaly => anomaly.status === statusFilter);
    }

    return filtered;
  }, [anomaliesData, debouncedSearchTerm, severityFilter, statusFilter]);

  // Apply pagination
  const currentData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, itemsPerPage]);

  // Calculate pagination info
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Reset to first page when itemsPerPage changes
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  // Update selectAll state based on current page data
  useEffect(() => {
    if (currentData.length === 0) {
      setSelectAll(false);
    } else {
      const allCurrentPageSelected = currentData.every(anomaly => selectedRows.has(anomaly.id));
      setSelectAll(allCurrentPageSelected);
    }
  }, [currentData, selectedRows]);

  // Helper functions
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-100 text-red-800 border border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700/50";
      case "medium": return "bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800/30";
      case "low": return "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30";
      default: return "bg-gray-50 text-gray-700 border border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800/30";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30";
      case "assigned": return "bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800/30";
      case "in_progress": return "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30";
      case "under_review": return "bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800/30";
      case "resolved": return "bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30";
      default: return "bg-gray-50 text-gray-700 border border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800/30";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "open": return "Ouverte";
      case "assigned": return "Assignée";
      case "in_progress": return "En cours";
      case "under_review": return "En révision";
      case "resolved": return "Résolue";
      default: return status;
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case "critical": return "Critique";
      case "medium": return "Normale";
      case "low": return "Faible";
      default: return severity;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const truncateText = (text: string, maxLength: number = 60) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  // Convert frontend severity filter to backend priority format
  const mapSeverityToPriority = (severity: string): string => {
    switch (severity) {
      case 'critical': return 'P1';
      case 'medium': return 'P2';
      case 'low': return 'P3';
      default: return severity; // 'all' or other values stay the same
    }
  };

  // Show error state (loading is handled by global loader)
  if (error) {
    return (
      <div className="overflow-hidden">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Gestion des Anomalies
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Suivi et gestion centralisée des anomalies industrielles
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Erreur de chargement</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="bg-brand-500 hover:bg-brand-600 text-white">
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Gestion des Anomalies
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Suivi et gestion centralisée des anomalies industrielles
            </p>
          </div>
          <div className="flex items-center gap-3">            <div className="relative">
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                disabled={isUploading}
              />
              <Button 
                variant="outline"
                className="text-gray-700 border-gray-300 hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-800"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500 mr-2"></div>
                    Import en cours...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Importer Fichier
                  </>
                )}
              </Button>
            </div>
            <Button 
              className="bg-brand-500 hover:bg-brand-600 text-white"
              onClick={() => {
                setEditMode(false);
                setEditingAnomaly(null);
                setFormData({
                  systeme: '',
                  description: '',
                  dateDetection: '',
                  descriptionEquipement: '',
                  sectionProprietaire: '',
                  estimatedTimeToResolve: '',
                  severity: 'medium',
                  priority: 'medium',
                  // Add availability factors
                  disponibilite: '',
                  fiabilite: '',
                  processSafety: ''
                });
                setIsFormSidebarOpen(true);
              }}
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Nouvelle Anomalie
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards - 7 cards with balanced layout */}
      <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {statsData.map((stat, index) => {
          const getColorClasses = (color: string) => {
            switch (color) {
              case "red":
                return "bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400";
              case "orange":
                return "bg-orange-50 text-orange-500 dark:bg-orange-500/10 dark:text-orange-400";
              case "yellow":
                return "bg-yellow-50 text-yellow-500 dark:bg-yellow-500/10 dark:text-yellow-400";
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

          // Make Total card span 2 columns on larger screens
          const isTotal = stat.title === "Total";
          const cardClasses = isTotal 
            ? "xl:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]" 
            : "rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]";

          return (
            <div
              key={index}
              className={cardClasses}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className={`font-semibold text-gray-900 dark:text-white ${isTotal ? 'text-3xl lg:text-4xl' : 'text-2xl'}`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`flex items-center justify-center rounded-full ${getColorClasses(stat.color)} ${isTotal ? 'w-14 h-14 lg:w-16 lg:h-16' : 'w-12 h-12'}`}>
                  {isTotal ? (
                    <svg className={`${isTotal ? 'w-7 h-7 lg:w-8 lg:h-8' : 'w-6 h-6'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                  ) : (
                    stat.icon
                  )}
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

      {/* Main Content - Data Table 3 Style */}
      <div className="overflow-hidden rounded-xl bg-white dark:bg-white/[0.03]">
        {/* Header Controls */}
        <div className="flex flex-col gap-4 px-4 py-4 border border-b-0 border-gray-100 dark:border-white/[0.05] rounded-t-xl lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500 dark:text-gray-400 whitespace-nowrap">Afficher</span>
              <div className="relative">
              <select
                  className="min-w-[70px] py-2 pl-3 pr-8 text-sm text-gray-800 bg-transparent border border-gray-300 rounded-lg appearance-none dark:bg-dark-900 h-9 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
              >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
              </select>
                <span className="absolute text-gray-500 -translate-y-1/2 right-2 top-1/2 dark:text-gray-400 pointer-events-none">
                <svg className="stroke-current" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3.8335 5.9165L8.00016 10.0832L12.1668 5.9165" stroke="" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
              <span className="text-gray-500 dark:text-gray-400 whitespace-nowrap">entrées</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="min-w-[140px] py-2 pl-3 pr-8 text-sm text-gray-800 bg-transparent border border-gray-300 rounded-lg appearance-none dark:bg-dark-900 h-9 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
              >
                <option value="all">Toutes criticalités</option>
                <option value="P1">Critique</option>
                <option value="P2">Normale</option>
                <option value="P3">Faible</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="min-w-[140px] py-2 pl-3 pr-8 text-sm text-gray-800 bg-transparent border border-gray-300 rounded-lg appearance-none dark:bg-dark-900 h-9 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
              >
                <option value="all">Tous les statuts</option>
                <option value="open">Ouverte</option>
                <option value="in_progress">En cours</option>
                <option value="resolved">Résolue</option>
                <option value="closed">Fermée</option>
              </select>
            </div>
            <div className="relative w-full sm:w-auto">
              <button className="absolute text-gray-500 -translate-y-1/2 left-3 top-1/2 dark:text-gray-400 pointer-events-none z-10">
                <svg className="fill-current" width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M3.04199 9.37363C3.04199 5.87693 5.87735 3.04199 9.37533 3.04199C12.8733 3.04199 15.7087 5.87693 15.7087 9.37363C15.7087 12.8703 12.8733 15.7053 9.37533 15.7053C5.87735 15.7053 3.04199 12.8703 3.04199 9.37363ZM9.37533 1.54199C5.04926 1.54199 1.54199 5.04817 1.54199 9.37363C1.54199 13.6991 5.04926 17.2053 9.37533 17.2053C11.2676 17.2053 13.0032 16.5344 14.3572 15.4176L17.1773 18.238C17.4702 18.5309 17.945 18.5309 18.2379 18.238C18.5308 17.9451 18.5309 17.4703 18.238 17.1773L15.4182 14.3573C16.5367 13.0033 17.2087 11.2669 17.2087 9.37363C17.2087 5.04817 13.7014 1.54199 9.37533 1.54199Z" fill="" />
                </svg>
              </button>
              <input
                type="text"
                placeholder="Rechercher anomalies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 w-full min-w-[200px] rounded-lg border border-gray-300 bg-transparent py-2 pl-9 pr-3 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 sm:min-w-[250px]"
              />
            </div>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedRows.size > 0 && (
          <div className="px-4 py-3 bg-brand-50 border-x border-brand-100 dark:bg-brand-900/10 dark:border-brand-800/50">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <span className="text-sm font-medium text-brand-700 dark:text-brand-300 whitespace-nowrap">
                  {selectedRows.size} anomalie{selectedRows.size > 1 ? 's' : ''} sélectionnée{selectedRows.size > 1 ? 's' : ''}
                </span>
                <div className="flex items-center gap-2 flex-wrap overflow-x-auto">
                  <Button variant="outline" size="sm" className="text-brand-600 border-brand-200 hover:bg-brand-100 dark:text-brand-400 dark:border-brand-800 dark:hover:bg-brand-900/20">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Marquer résolues
                  </Button>
                  <Button variant="outline" size="sm" className="text-purple-600 border-purple-200 hover:bg-purple-100 dark:text-purple-400 dark:border-purple-800 dark:hover:bg-purple-900/20">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                    </svg>
                    Créer un REX
                  </Button>
                  <Button variant="outline" size="sm" className="text-orange-600 border-orange-200 hover:bg-orange-100 dark:text-orange-400 dark:border-orange-800 dark:hover:bg-orange-900/20">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Archiver
                  </Button>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => { setSelectedRows(new Set()); setSelectAll(false); }} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="w-full">
          <div data-slot="table-container" className="relative w-full overflow-x-auto overflow-y-visible bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-white/[0.05]">
            <Table data-slot="table" className="caption-bottom text-sm w-full table-fixed">
              <TableHeader data-slot="table-header" className="[&_tr]:border-b">
                <TableRow data-slot="table-row" className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors border-none">
                  <TableHead data-slot="table-head" className="text-foreground h-10 align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] px-3 lg:px-4 py-3 text-left border-b border-gray-100 dark:border-white/[0.05] w-[18%] lg:w-[15%]">
                    <div className="flex items-center gap-2 lg:gap-3">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-brand-600 bg-gray-100 border-gray-300 rounded focus:ring-brand-500 dark:focus:ring-brand-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 flex-shrink-0"
                      />
                      <span className="font-medium text-gray-700 text-xs lg:text-sm dark:text-gray-400 truncate">
                        ID Anomalie
                      </span>
                    </div>
                  </TableHead>
                  <TableHead data-slot="table-head" className="text-foreground h-10 align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] px-3 lg:px-4 py-3 text-left border-b border-gray-100 dark:border-white/[0.05] w-[45%] lg:w-[40%]">
                    <p className="font-medium text-gray-700 text-xs lg:text-sm dark:text-gray-400 truncate">
                      Description
                    </p>
                  </TableHead>
                  <TableHead data-slot="table-head" className="text-foreground h-10 align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] hidden xl:table-cell px-3 lg:px-4 py-3 text-left border-b border-gray-100 dark:border-white/[0.05] w-[15%]">
                    <p className="font-medium text-gray-700 text-xs lg:text-sm dark:text-gray-400 truncate">
                      Catégorie
                    </p>
                  </TableHead>
                  <TableHead data-slot="table-head" className="text-foreground h-10 align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] px-3 lg:px-4 py-3 text-left border-b border-gray-100 dark:border-white/[0.05] w-[22%] lg:w-[15%]">
                    <p className="font-medium text-gray-700 text-xs lg:text-sm dark:text-gray-400 truncate">
                      Criticalité
                    </p>
                  </TableHead>
                  <TableHead data-slot="table-head" className="text-foreground h-10 align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] hidden lg:table-cell px-3 lg:px-4 py-3 text-left border-b border-gray-100 dark:border-white/[0.05] w-[15%]">
                    <p className="font-medium text-gray-700 text-xs lg:text-sm dark:text-gray-400 truncate">
                      Statut
                    </p>
                  </TableHead>
                  <TableHead data-slot="table-head" className="text-foreground h-10 align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] px-3 lg:px-4 py-3 text-center border-b border-gray-100 dark:border-white/[0.05] w-[15%]">
                    <p className="font-medium text-gray-700 text-xs lg:text-sm dark:text-gray-400 truncate text-center">
                      Actions
                    </p>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody data-slot="table-body" className="[&_tr:last-child]:border-0">
                {currentData.map((anomaly, index) => (
                  <TableRow key={anomaly.id} data-slot="table-row" className="data-[state=selected]:bg-muted border-b transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 border-none">
                    <TableCell data-slot="table-cell" className="p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] px-3 lg:px-4 py-3 lg:py-4 border-b border-gray-100 dark:border-white/[0.05] dark:text-white/90">
                      <div className="flex items-center gap-2 lg:gap-3">
                        <input
                          type="checkbox"
                          checked={selectedRows.has(anomaly.id)}
                          onChange={() => handleRowSelect(anomaly.id)}
                          className="w-4 h-4 text-brand-600 bg-gray-100 border-gray-300 rounded focus:ring-brand-500 dark:focus:ring-brand-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-800 text-xs lg:text-sm dark:text-white/90 truncate">
                            {anomaly.id}
                          </p>
                          <span className="text-xs font-normal text-gray-500 dark:text-gray-400 xl:hidden truncate">
                            {anomaly.category}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell data-slot="table-cell" className="p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] px-3 lg:px-4 py-3 lg:py-4 border-b border-gray-100 dark:border-white/[0.05] dark:text-white/90">
                      <div className="relative group">
                        <div className="flex items-start gap-2 lg:gap-3">
                          <div className={`flex items-center justify-center w-6 h-6 lg:w-7 lg:h-7 rounded-lg flex-shrink-0 ${
                            anomaly.severity === 'critical' 
                              ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                              : anomaly.severity === 'medium'
                              ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400'
                              : 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                          }`}>
                            {anomaly.severity === 'critical' ? (
                              <svg className="w-3 h-3 lg:w-4 lg:h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            ) : anomaly.severity === 'medium' ? (
                              <svg className="w-3 h-3 lg:w-4 lg:h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="w-3 h-3 lg:w-4 lg:h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 dark:text-white text-xs lg:text-sm leading-relaxed cursor-help truncate" title={anomaly.description}>
                              {truncateText(anomaly.description, 60)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate lg:hidden">
                              {anomaly.equipment?.name || 'N/A'}
                            </p>
                          </div>
                        </div>
                        {/* Hover tooltip for full description */}
                        <div className="absolute left-0 top-full mt-2 w-80 max-w-sm p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-in-out z-[9999] pointer-events-none transform translate-y-1 group-hover:translate-y-0 
                          right-auto
                          sm:right-0 sm:left-auto sm:w-96 sm:max-w-md
                          lg:left-0 lg:right-auto lg:w-80 lg:max-w-sm
                          xl:w-96 xl:max-w-md">
                          <div className="font-semibold text-gray-900 dark:text-white mb-2 break-words">{anomaly.title}</div>
                          <div className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3 break-words whitespace-pre-wrap">{anomaly.description}</div>
                          <div className="flex flex-col gap-2 text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700">
                            <div className="flex items-start gap-1">
                              <svg className="w-3 h-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8z" clipRule="evenodd" />
                              </svg>
                              <span className="break-words flex-1">Équipement: {anomaly.equipment?.name || 'N/A'}</span>
                            </div>
                            <div className="flex items-start gap-1">
                              <svg className="w-3 h-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                              </svg>
                              <span className="break-words flex-1">Catégorie: {anomaly.category}</span>
                            </div>
                          </div>
                          {/* Arrow */}
                          <div className="absolute -top-1.5 left-4 w-3 h-3 bg-white dark:bg-gray-800 border-l border-t border-gray-200 dark:border-gray-700 transform rotate-45 sm:left-auto sm:right-4 lg:left-4 lg:right-auto"></div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell data-slot="table-cell" className="p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] hidden xl:table-cell px-3 lg:px-4 py-3 lg:py-4 border-b border-gray-100 dark:border-white/[0.05] dark:text-white/90">
                      <div className="flex items-center gap-2">
                        <svg className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium text-xs lg:text-sm text-gray-800 dark:text-white/90 truncate">{anomaly.category}</span>
                      </div>
                    </TableCell>
                    <TableCell data-slot="table-cell" className="p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] px-3 lg:px-4 py-3 lg:py-4 border-b border-gray-100 dark:border-white/[0.05] dark:text-white/90">
                      <div className={`inline-flex items-center gap-1 lg:gap-2 px-2 lg:px-3 py-1 lg:py-1.5 rounded-full text-xs font-semibold ${getSeverityColor(anomaly.severity)}`}>
                        {anomaly.severity === 'critical' && (
                          <>
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span className="leading-none font-bold">
                              {getSeverityLabel(anomaly.severity)}
                            </span>
                          </>
                        )}

                        {anomaly.severity === 'medium' && (
                          <>
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <span className="leading-none">
                              {getSeverityLabel(anomaly.severity)}
                            </span>
                          </>
                        )}
                        {anomaly.severity === 'low' && (
                          <>
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className="leading-none">
                              {getSeverityLabel(anomaly.severity)}
                            </span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell data-slot="table-cell" className="p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] hidden lg:table-cell px-3 lg:px-4 py-3 lg:py-4 border-b border-gray-100 dark:border-white/[0.05] dark:text-white/90">
                      <div className={`inline-flex items-center gap-1 lg:gap-2 px-2 lg:px-3 py-1 lg:py-1.5 rounded-full text-xs font-semibold ${getStatusColor(anomaly.status)}`}>
                        {anomaly.status === 'open' && (
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                        {anomaly.status === 'assigned' && (
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        )}
                        {anomaly.status === 'in_progress' && (
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                        )}
                        {anomaly.status === 'under_review' && (
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        {anomaly.status === 'resolved' && (
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        <span className="leading-none">
                          {getStatusLabel(anomaly.status)}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell data-slot="table-cell" className="p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] px-3 lg:px-4 py-3 lg:py-4 border-b border-gray-100 dark:border-white/[0.05] dark:text-white/90">
                      <div className="flex items-center justify-center gap-1.5 lg:gap-2">
                        <Link href={`/anomalies/${anomaly.id}`}>
                          <button 
                            className="flex items-center justify-center w-6 h-6 lg:w-8 lg:h-8 text-brand-500 bg-brand-50 rounded-lg hover:bg-brand-100 hover:text-brand-600 dark:bg-brand-900/20 dark:text-brand-400 dark:hover:bg-brand-800/30 dark:hover:text-brand-300 transition-colors"
                            title="Voir les détails"
                          >
                            <svg className="w-3 h-3 lg:w-4 lg:h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </Link>
                        <button 
                          onClick={() => handleEditAnomaly(anomaly)}
                          className="flex items-center justify-center w-6 h-6 lg:w-8 lg:h-8 text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                          title="Modifier l'anomalie"
                        >
                          <svg className="w-3 h-3 lg:w-4 lg:h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <div className="relative">
                          <button 
                            onClick={() => toggleDropdown(anomaly.id)}
                            className="flex items-center justify-center w-6 h-6 lg:w-8 lg:h-8 text-gray-500 bg-gray-50 rounded-lg hover:bg-gray-100 hover:text-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300 transition-colors"
                            title="Plus d'actions"
                          >
                            <svg className="w-3 h-3 lg:w-4 lg:h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>
                          {openDropdown === anomaly.id && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20">
                              <div className="py-1">
                                <button 
                                  onClick={() => handleCreateRex(anomaly)}
                                  className="flex items-center w-full px-3 py-2 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors"
                                >
                                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                                </svg>
                                Créer un REX
                              </button>
                              <button 
                                onClick={() => handleDeleteAnomaly(anomaly)}
                                className="flex items-center w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                              >
                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Supprimer
                              </button>
                            </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination */}
        <div className="bg-white dark:bg-gray-900 border border-t-0 rounded-b-lg border-gray-100 px-4 py-4 dark:border-white/[0.05]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="order-2 lg:order-1">
              <p className="text-sm font-medium text-center text-gray-500 dark:text-gray-400 lg:text-left">
                Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, totalItems)} sur {totalItems} entrées
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 order-1 lg:order-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex items-center justify-center h-9 px-3 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 shadow-theme-xs hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] transition-colors"
              >
                <span className="hidden sm:inline">Précédent</span>
                <span className="sm:hidden">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let page = i + Math.max(currentPage - 2, 1);
                  if (page > totalPages) return null;
                  return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                      className={`flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === page
                          ? "bg-brand-500 text-white shadow-sm"
                          : "text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                  >
                    {page}
                  </button>
                  );
                })}
              </div>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center justify-center h-9 px-3 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 shadow-theme-xs hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] transition-colors"
              >
                <span className="hidden sm:inline">Suivant</span>
                <span className="sm:hidden">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar Form */}
      {isFormSidebarOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-md z-[60] transition-opacity duration-300"
            onClick={closeSidebar}
          />
          
          {/* Sidebar */}
          <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white dark:bg-gray-900 shadow-xl z-[70] transform transition-transform duration-300 ease-in-out overflow-hidden">
            <div className="flex flex-col h-full overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {editMode ? 'Modifier l\'Anomalie' : 'Nouvelle Anomalie'}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {editMode ? `Modifier l'anomalie ${editingAnomaly?.id}` : 'Signaler une nouvelle anomalie industrielle'}
                  </p>
                </div>
                <button
                  onClick={closeSidebar}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              {/* Form Content */}
              <div className="flex-1 overflow-y-auto scrollbar-hide p-4">
                <form 
                  onSubmit={handleFormSubmit} 
                  className="space-y-4"
                  id="anomalyForm"
                >
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Catégorie *
                    </label>
                    <select
                      value={formData.systeme}
                      onChange={(e) => handleFormChange('systeme', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:focus:ring-brand-400 dark:focus:border-brand-400"
                    >
                      <option value="">Sélectionner une catégorie</option>
                      <option value="mechanical">Mécanique</option>
                      <option value="electrical">Électrique</option>
                      <option value="hydraulic">Hydraulique</option>
                      <option value="instrumentation">Instrumentation</option>
                      <option value="control">Contrôle</option>
                      <option value="safety">Sécurité</option>
                      <option value="environmental">Environnement</option>
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description * (minimum 10 caractères)
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleFormChange('description', e.target.value)}
                      placeholder="Décrivez l'anomalie en détail, les circonstances, les symptômes observés..."
                      rows={4}
                      required
                      minLength={10}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:focus:ring-brand-400 dark:focus:border-brand-400 resize-none"
                    />
                    <div className="mt-1 flex justify-between items-center">
                      <p className={`text-xs ${formData.description.length >= 10 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {formData.description.length >= 10 ? '✓' : '✗'} {formData.description.length}/10 caractères minimum
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formData.description.length}/500 caractères
                      </p>
                    </div>
                  </div>

                  {/* Date de detection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date de détection de l'anomalie *
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400 group-focus-within:text-brand-500 transition-colors duration-200" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <input
                        type="datetime-local"
                        value={formData.dateDetection}
                        onChange={(e) => handleFormChange('dateDetection', e.target.value)}
                        required
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:focus:ring-brand-400/20 dark:focus:border-brand-400 text-sm transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
                        placeholder="Sélectionner la date et l'heure"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <div className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 group-focus-within:text-brand-500 transition-colors duration-200" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex items-start gap-2">
                      <svg className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                        Indiquez la date et l'heure exactes de détection de l'anomalie
                      </p>
                    </div>
                  </div>

                  {/* Equipment Selection with Autocomplete */}
                  <EquipmentAutocomplete
                    value={formData.descriptionEquipement}
                    onChange={(value, equipment) => {
                      handleFormChange('descriptionEquipement', value);
                      if (equipment) {
                        setSelectedEquipment(equipment);
                      }
                    }}
                    onEquipmentSelect={(equipment) => {
                      setSelectedEquipment(equipment);
                      handleFormChange('descriptionEquipement', equipment.name);
                    }}
                    label="Équipement"
                    placeholder="Rechercher un équipement..."
                    required
                  />

                  {/* Section proprietaire */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Section propriétaire *
                    </label>
                    <select
                      value={formData.sectionProprietaire}
                      onChange={(e) => handleFormChange('sectionProprietaire', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:focus:ring-brand-400 dark:focus:border-brand-400"
                    >
                      <option value="">Sélectionner une section</option>
                      <option value="34EL">34EL</option>
                      <option value="34MD">34MD</option>
                      <option value="Production">Production</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Électrique">Électrique</option>
                      <option value="Hydraulique">Hydraulique</option>
                      <option value="Instrumentation">Instrumentation</option>
                      <option value="Sécurité">Sécurité</option>
                      <option value="Environnement">Environnement</option>
                    </select>
                  </div>

                  {/* Temps estimé de résolution */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Temps estimé de résolution *
                    </label>
                    <input
                      type="text"
                      value={formData.estimatedTimeToResolve}
                      onChange={(e) => handleFormChange('estimatedTimeToResolve', e.target.value)}
                      placeholder="Ex: 2 heures, 3 jours, 1 semaine"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:focus:ring-brand-400 dark:focus:border-brand-400"
                    />
                  </div>

                  {/* Availability Factors */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Facteurs de disponibilité (optionnel)
                      </h3>
                      <button
                        type="button"
                        onClick={getAIPrediction}
                        disabled={aiPredictionLoading || !formData.description || !selectedEquipment}
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-brand-600 bg-brand-50 border border-brand-200 rounded-lg hover:bg-brand-100 focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-brand-900/20 dark:text-brand-400 dark:border-brand-800 dark:hover:bg-brand-800/30"
                      >
                        {aiPredictionLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-brand-500 mr-1.5"></div>
                            Prédiction IA...
                          </>
                        ) : (
                          <>
                            <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Prédiction IA
                          </>
                        )}
                      </button>
                    </div>
                    
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/20 dark:border-blue-800">
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        <strong>Note:</strong> Si vous ne remplissez pas ces champs, l'IA calculera automatiquement les facteurs de disponibilité lors de la création de l'anomalie.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Disponibilité (1-5)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="3"
                          value={formData.disponibilite}
                          onChange={(e) => handleFormChange('disponibilite', e.target.value)}
                          placeholder="1-3"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:focus:ring-brand-400 dark:focus:border-brand-400"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Fiabilité Intégrité (1-5)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="3"
                          value={formData.fiabilite}
                          onChange={(e) => handleFormChange('fiabilite', e.target.value)}
                          placeholder="1-3"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:focus:ring-brand-400 dark:focus:border-brand-400"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Process Safety (1-5)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="3"
                          value={formData.processSafety}
                          onChange={(e) => handleFormChange('processSafety', e.target.value)}
                          placeholder="1-3"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:focus:ring-brand-400 dark:focus:border-brand-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Severity - Manual or Auto-calculated */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Criticalité {editMode ? '' : '(calculée automatiquement)'}
                    </label>
                    {editMode ? (
                      <select
                        value={formData.severity}
                        onChange={(e) => handleFormChange('severity', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:focus:ring-brand-400 dark:focus:border-brand-400"
                      >
                        <option value="critical">🔴 Critique</option>
                        <option value="medium">🟡 Normale</option>
                        <option value="low">🟢 Faible</option>
                      </select>
                    ) : (
                      <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400">
                        {formData.severity === 'critical' && (
                          <span className="text-red-600 dark:text-red-400 font-medium">🔴 Critique</span>
                        )}
                        {formData.severity === 'medium' && (
                          <span className="text-yellow-600 dark:text-yellow-400 font-medium">🟡 Normale</span>
                        )}
                        {formData.severity === 'low' && (
                          <span className="text-green-600 dark:text-green-400 font-medium">🟢 Faible</span>
                        )}
                        {!formData.severity && (
                          <span className="text-gray-500 dark:text-gray-400">Sera calculée automatiquement</span>
                        )}
                      </div>
                    )}
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {editMode 
                        ? 'Vous pouvez modifier manuellement la criticalité de cette anomalie'
                        : 'La criticalité est calculée automatiquement basée sur les facteurs de disponibilité ou la prédiction IA'
                      }
                    </p>
                  </div>
                </form>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={closeSidebar}
                  className="text-gray-700 dark:text-gray-300"
                >
                  Annuler
                </Button>
                <button
                  type="submit"
                  form="anomalyForm"
                  className="inline-flex items-center justify-center px-4 py-2 font-medium rounded-lg bg-brand-500 hover:bg-brand-600 text-white transition-colors duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {editMode ? 'Mettre à jour' : 'Créer l\'anomalie'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 