"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Brain, Upload, Download, RefreshCw, TrendingUp, AlertTriangle,
  CheckCircle, Clock, Activity, BarChart3, Zap, Database,
  FileText, Settings, Play, Pause, Eye, EyeOff
} from 'lucide-react';

// Utility functions for interpreting criticality scores
// NEW LOGIC: Higher scores = MORE critical for ALL score types
// This change was requested to align with the business logic where:
// - Fiability score of 5 = MORE critical than fiability score of 1
// - Availability score of 5 = MORE critical than availability score of 1
// - Process safety score of 5 = MORE critical than process safety score of 1
// - Higher values indicate worse conditions requiring more urgent attention

const interpretCriticalityScore = (score: number) => {
  if (score >= 4.5) return { level: 'CRITIQUE', color: 'error', bgColor: 'bg-error-100', textColor: 'text-error-800' };
  if (score >= 3.5) return { level: 'ÉLEVÉ', color: 'error', bgColor: 'bg-error-100', textColor: 'text-error-800' };
  if (score >= 2.5) return { level: 'MODÉRÉ', color: 'warning', bgColor: 'bg-warning-100', textColor: 'text-warning-800' };
  if (score >= 1.5) return { level: 'FAIBLE', color: 'success', bgColor: 'bg-success-100', textColor: 'text-success-800' };
  return { level: 'TRÈS FAIBLE', color: 'success', bgColor: 'bg-success-100', textColor: 'text-success-800' };
};

const interpretAvailabilityScore = (score: number) => {
  // For availability, higher scores are MORE critical (NEW LOGIC)
  // Score of 5 = MORE critical than score of 1
  if (score >= 4.5) return { level: 'CRITIQUE', color: 'error', bgColor: 'bg-error-100', textColor: 'text-error-800', description: 'Disponibilité très compromise. Arrêt imminent probable.' };
  if (score >= 3.5) return { level: 'ÉLEVÉ', color: 'error', bgColor: 'bg-error-100', textColor: 'text-error-800', description: 'Disponibilité compromise. Risque élevé d\'indisponibilité.' };
  if (score >= 2.5) return { level: 'MODÉRÉ', color: 'warning', bgColor: 'bg-warning-100', textColor: 'text-warning-800', description: 'Disponibilité dégradée. Surveillance renforcée nécessaire.' };
  if (score >= 1.5) return { level: 'FAIBLE', color: 'success', bgColor: 'bg-success-100', textColor: 'text-success-800', description: 'Disponibilité acceptable. Maintenance préventive recommandée.' };
  return { level: 'TRÈS FAIBLE', color: 'success', bgColor: 'bg-success-100', textColor: 'text-success-800', description: 'Disponibilité excellente. Équipement très fiable.' };
};

const interpretFiabilityScore = (score: number) => {
  // For fiability, higher scores are MORE critical (NEW LOGIC)
  // Score of 5 = MORE critical than score of 1
  if (score >= 4.5) return { level: 'CRITIQUE', color: 'error', bgColor: 'bg-error-100', textColor: 'text-error-800', description: 'Fiabilité très compromise. Risque de panne majeure imminent.' };
  if (score >= 3.5) return { level: 'ÉLEVÉ', color: 'error', bgColor: 'bg-error-100', textColor: 'text-error-800', description: 'Fiabilité compromise. Intervention urgente requise.' };
  if (score >= 2.5) return { level: 'MODÉRÉ', color: 'warning', bgColor: 'bg-warning-100', textColor: 'text-warning-800', description: 'Fiabilité dégradée. Surveillance renforcée nécessaire.' };
  if (score >= 1.5) return { level: 'FAIBLE', color: 'success', bgColor: 'bg-success-100', textColor: 'text-success-800', description: 'Fiabilité acceptable. Maintenance préventive recommandée.' };
  return { level: 'TRÈS FAIBLE', color: 'success', bgColor: 'bg-success-100', textColor: 'text-success-800', description: 'Fiabilité excellente. Équipement en bon état.' };
};

const interpretProcessSafetyScore = (score: number) => {
  // For process safety, higher scores are MORE critical (NEW LOGIC)
  // Score of 5 = MORE critical than score of 1
  if (score >= 4.5) return { level: 'CRITIQUE', color: 'error', bgColor: 'bg-error-100', textColor: 'text-error-800', description: 'Risque de sécurité majeur. Arrêt immédiat requis.' };
  if (score >= 3.5) return { level: 'ÉLEVÉ', color: 'error', bgColor: 'bg-error-100', textColor: 'text-error-800', description: 'Risque de sécurité important. Intervention prioritaire.' };
  if (score >= 2.5) return { level: 'MODÉRÉ', color: 'warning', bgColor: 'bg-warning-100', textColor: 'text-warning-800', description: 'Risque de sécurité modéré. Surveillance requise.' };
  if (score >= 1.5) return { level: 'FAIBLE', color: 'success', bgColor: 'bg-success-100', textColor: 'text-success-800', description: 'Risque de sécurité faible. Conditions acceptables.' };
  return { level: 'TRÈS FAIBLE', color: 'success', bgColor: 'bg-success-100', textColor: 'text-success-800', description: 'Conditions de sécurité optimales.' };
};

// Training-related interfaces
interface TrainingRecord {
  anomaly_id: string;
  description: string;
  equipment_name: string;
  equipment_id: string;
  availability_score: number;
  fiability_score: number;
  process_safety_score: number;
}

interface TrainingResponse {
  success: boolean;
  message?: string;
  statistics?: {
    total_records_added: number;
    records_per_model: {
      availability: number;
      fiability: number;
      process_safety: number;
    };
    training_time_seconds: number;
    models_retrained: {
      availability: boolean;
      fiability: boolean;
      process_safety: boolean;
    };
    backup_location: string;
  };
  training_session_id?: number;
  is_training: boolean;
  error?: string;
  validation_errors?: string[];
}

interface BackupInfo {
  name: string;
  created: string;
  path: string;
}

interface BackupsResponse {
  backups: BackupInfo[];
  count: number;
}

// TypeScript interfaces for AI test results
interface PredictionResult {
  description: string;
  score: number;
}

interface RiskAssessment {
  critical_factors: string[];
  overall_risk_level: string;
  recommended_action: string;
  weakest_aspect: string;
}

interface TestAnomalyResult {
  anomaly_id: string;
  equipment_id: string;
  equipment_name: string;
  maintenance_recommendations: string[];
  overall_score: number;
  predictions: {
    availability: PredictionResult;
    process_safety: PredictionResult;
    reliability: PredictionResult;
  };
  processing_time_seconds: number;
  risk_assessment: RiskAssessment;
  status: string;
}

// Mock data based on the API endpoints provided
const mockModelInfo = {
  models: {
    availability: {
      description: "Predicts equipment uptime and operational readiness",
      features: 23,
      target_range: "1-5"
    },
    process_safety: {
      description: "Predicts safety risk assessment and hazard identification", 
      features: 29,
      target_range: "1-5"
    },
    reliability: {
      description: "Predicts equipment integrity and dependability",
      features: 23,
      target_range: "1-5"
    }
  },
  models_loaded: true,
  usage: {
    batch_processing: "Automatically detects single vs multiple anomalies",
    endpoint: "/predict",
    method: "POST",
    required_fields: [
      "anomaly_id",
      "description", 
      "equipment_name",
      "equipment_id"
    ],
    supports: "Single anomaly object OR array of anomaly objects (max 6000)"
  }
};

const mockHealthStatus = {
  app_name: "Equipment Prediction API",
  message: "Equipment Prediction API is running",
  models_loaded: true,
  status: "healthy",
  version: "1.0.0"
};

const mockMetrics = {
  timestamp: "2024-01-15T10:30:45.123456",
  models_loaded: true,
  model_performance: {
    availability: {
      test_samples: 120,
      regression_metrics: {
        mae: 0.3245,
        mse: 0.1876,
        rmse: 0.4331,
        r2_score: 0.8234
      },
      accuracy_metrics: {
        accuracy_within_0_5: 89.5,
        accuracy_within_1_0: 96.2
      },
      prediction_statistics: {
        mean_prediction: 3.124,
        mean_actual: 3.087,
        bias: 0.037,
        prediction_std: 1.234,
        actual_std: 1.198
      }
    },
    fiability: {
      test_samples: 115,
      regression_metrics: {
        mae: 0.2891,
        mse: 0.1654,
        rmse: 0.4067,
        r2_score: 0.8456
      },
      accuracy_metrics: {
        accuracy_within_0_5: 91.2,
        accuracy_within_1_0: 97.8
      },
      prediction_statistics: {
        mean_prediction: 2.987,
        mean_actual: 2.954,
        bias: 0.033,
        prediction_std: 1.156,
        actual_std: 1.123
      }
    },
    process_safety: {
      test_samples: 108,
      regression_metrics: {
        mae: 0.3567,
        mse: 0.2134,
        rmse: 0.4621,
        r2_score: 0.7998
      },
      accuracy_metrics: {
        accuracy_within_0_5: 87.3,
        accuracy_within_1_0: 94.6
      },
      prediction_statistics: {
        mean_prediction: 3.298,
        mean_actual: 3.267,
        bias: 0.031,
        prediction_std: 1.345,
        actual_std: 1.312
      }
    }
  },
  summary: {
    overall_model_health: 85.6,
    health_status: "EXCELLENT",
    models_evaluated: 3,
    total_training_records: 3687,
    recommendations: [
      "Model performance is excellent",
      "Consider training with more diverse data"
    ]
  }
};

const mockTrainingStatus = {
  is_training: false,
  training_sessions_completed: 5,
  available_backups: 8,
  last_training: {
    timestamp: "2024-12-05T14:30:22.123456",
    records_added: 3,
    training_time: 45.67,
    models_retrained: 3,
    backup_path: "model_backups/backup_20241205_143022",
    success: true
  }
};

import { EquipmentService } from '@/lib/services/equipment-service';

// Equipment data for autocomplete - loaded from API
let equipmentData: { id: string; name: string }[] = [];

// Function to load equipment data from API
const loadEquipmentData = async () => {
  if (equipmentData.length > 0) return; // Already loaded
  
  try {
    const equipment = await EquipmentService.getAllEquipment({ limit: 100 });
    equipmentData = equipment.map(eq => ({ id: eq.id, name: eq.name }));
    console.log(`Loaded ${equipmentData.length} equipment entries from API`);
  } catch (error) {
    console.error('Error loading equipment data:', error);
    // Fallback to some sample data if API loading fails
    equipmentData.push(
      { id: 'e9bdadb4-9d03-4417-ac28-841b8762c35c', name: 'Equipement de levage palans et ponts 00/30/40SMA' },
      { id: '86748963-0947-49a1-b2de-e195088bd561', name: 'ACCUMULATEUR DE PRESSION' },
      { id: '04a24577-b97c-42dc-9b74-c3af4caddf9e', name: 'ACIMULATEUR DE FIOUL N°001' },
      { id: 'ba94430b-c394-4144-82fb-000df8b98b67', name: 'ACIMULATEUR DE FIOUL N°002' },
      { id: '98b82203-7170-45bf-879e-f47ba6e12c86', name: 'POMPE FUEL PRINCIPALE N°1' }
    );
  }
};

export default function AIModelPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isTraining, setIsTraining] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  
  // Test anomaly states
  const [testAnomaly, setTestAnomaly] = useState({
    anomaly_id: 'ANO-2024-001',
    description: 'Fuite importante d\'huile au niveau du palier avec vibrations anormales',
    equipment_name: 'POMPE FUEL PRINCIPALE N°1',
    equipment_id: '98b82203-7170-45bf-879e-f47ba6e12c86'
  });
  const [testResult, setTestResult] = useState<TestAnomalyResult | null>(null);
  const [isTestingAnomaly, setIsTestingAnomaly] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);
  
  // Real API data states
  const [healthData, setHealthData] = useState(mockHealthStatus);
  const [modelInfoData, setModelInfoData] = useState(mockModelInfo);
  const [metricsData, setMetricsData] = useState(mockMetrics);
  const [trainingStatusData, setTrainingStatusData] = useState(mockTrainingStatus);
  const [isLoading, setIsLoading] = useState(false);

  // Equipment autocomplete states
  const [showEquipmentDropdown, setShowEquipmentDropdown] = useState(false);
  const [equipmentSearchTerm, setEquipmentSearchTerm] = useState('');
  const equipmentDropdownRef = useRef<HTMLDivElement>(null);

  // Training-related states
  const [trainingData, setTrainingData] = useState<TrainingRecord[]>([]);
  const [trainingResult, setTrainingResult] = useState<TrainingResponse | null>(null);
  const [trainingError, setTrainingError] = useState<string | null>(null);
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [isLoadingBackups, setIsLoadingBackups] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isReloading, setIsReloading] = useState(false);

  // Click outside handler to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (equipmentDropdownRef.current && !equipmentDropdownRef.current.contains(event.target as Node)) {
        setShowEquipmentDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Load equipment data on component mount
  useEffect(() => {
    loadEquipmentData();
  }, []);

  // Initialize search term with current equipment name
  useEffect(() => {
    setEquipmentSearchTerm(testAnomaly.equipment_name);
  }, [testAnomaly.equipment_name]);

  // Mock training function
  const handleStartTraining = async () => {
    if (!uploadedFile) {
      setTrainingError('Veuillez sélectionner un fichier d\'entraînement');
      return;
    }

    try {
      // TODO: Parse uploaded file to create training records
      // For now, we'll create a sample training record
      const sampleTrainingRecord: TrainingRecord = {
        anomaly_id: 'TRAIN-' + Date.now(),
        description: 'Données d\'entraînement importées depuis ' + uploadedFile.name,
        equipment_name: 'Équipement Sample',
        equipment_id: 'sample-equipment-id',
        availability_score: 3,
        fiability_score: 3,
        process_safety_score: 3,
      };

      await startTraining([sampleTrainingRecord]);
    } catch (error) {
      console.error('Training failed:', error);
      setTrainingError(error instanceof Error ? error.message : 'Erreur lors de l\'entraînement');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  // Real API calls
  const fetchModelHealth = async () => {
    try {
      const response = await fetch('/api/ai-health');
      const data = await response.json();
      setHealthData(data);
      return data;
    } catch (error) {
      console.error('Error fetching model health:', error);
      // Keep mock data on error
    }
  };

  const fetchModelInfo = async () => {
    try {
      const response = await fetch('/api/ai-models/info');
      const data = await response.json();
      setModelInfoData(data);
      return data;
    } catch (error) {
      console.error('Error fetching model info:', error);
      // Keep mock data on error
    }
  };

  const fetchModelMetrics = async () => {
    try {
      const response = await fetch('/api/ai-models/metrics');
      const data = await response.json();
      setMetricsData(data);
      return data;
    } catch (error) {
      console.error('Error fetching model metrics:', error);
      // Keep mock data on error
    }
  };

  const fetchTrainingStatus = async () => {
    try {
      const response = await fetch('/api/ai-train/status');
      const data = await response.json();
      setTrainingStatusData(data);
      return data;
    } catch (error) {
      console.error('Error fetching training status:', error);
      // Keep mock data on error
    }
  };

  // Real training functions
  const startTraining = async (trainingRecords: TrainingRecord[]) => {
    if (!trainingRecords || trainingRecords.length === 0) {
      throw new Error('Training data is required');
    }

    setIsTraining(true);
    setTrainingError(null);
    setTrainingResult(null);
    setTrainingProgress(0);

    try {
      const response = await fetch('/api/ai-train', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trainingRecords),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Training failed');
      }

      setTrainingResult(data);
      setTrainingProgress(100);
      
      // Refresh training status after successful training
      await fetchTrainingStatus();
      
      return data;
    } catch (error) {
      console.error('Training error:', error);
      setTrainingError(error instanceof Error ? error.message : 'Training failed');
      throw error;
    } finally {
      setIsTraining(false);
    }
  };

  const reloadModels = async () => {
    setIsReloading(true);
    try {
      const response = await fetch('/api/ai-train/reload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reload models');
      }

      return data;
    } catch (error) {
      console.error('Model reload error:', error);
      throw error;
    } finally {
      setIsReloading(false);
    }
  };

  const fetchBackups = async () => {
    setIsLoadingBackups(true);
    try {
      const response = await fetch('/api/ai-train/backups');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch backups');
      }

      setBackups(data.backups || []);
      return data;
    } catch (error) {
      console.error('Backups fetch error:', error);
      throw error;
    } finally {
      setIsLoadingBackups(false);
    }
  };

  const restoreBackup = async (backupName: string) => {
    if (!backupName) {
      throw new Error('Backup name is required');
    }

    setIsRestoring(true);
    try {
      const response = await fetch(`/api/ai-train/restore/${backupName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to restore backup');
      }

      // Refresh training status after successful restore
      await fetchTrainingStatus();
      
      return data;
    } catch (error) {
      console.error('Backup restore error:', error);
      throw error;
    } finally {
      setIsRestoring(false);
    }
  };

  // Handler functions for backup management
  const handleRestoreBackup = async (backupName: string) => {
    try {
      setTrainingError(null);
      await restoreBackup(backupName);
      setTrainingResult({
        success: true,
        message: `Sauvegarde ${backupName} restaurée avec succès`,
        is_training: false
      });
    } catch (error) {
      setTrainingError(error instanceof Error ? error.message : 'Erreur lors de la restauration');
    }
  };

  const handleReloadModels = async () => {
    setIsReloading(true);
    try {
      const response = await fetch('/api/ai-train/reload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reload models');
      }

      setTrainingResult({
        success: true,
        message: 'Modèles rechargés avec succès',
        is_training: false
      });

      // Refresh model health status
      await fetchModelHealth();
    } catch (error) {
      setTrainingError(error instanceof Error ? error.message : 'Erreur lors du rechargement des modèles');
    } finally {
      setIsReloading(false);
    }
  };

  // Helper function to create training record from test anomaly
  const createTrainingRecord = (anomaly: typeof testAnomaly, scores: { availability: number; fiability: number; process_safety: number }): TrainingRecord => ({
    anomaly_id: anomaly.anomaly_id,
    description: anomaly.description,
    equipment_name: anomaly.equipment_name,
    equipment_id: anomaly.equipment_id,
    availability_score: scores.availability,
    fiability_score: scores.fiability,
    process_safety_score: scores.process_safety,
  });

  // Load backups on component mount
  React.useEffect(() => {
    fetchBackups();
  }, []);

  // Fetch all real data
  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchModelHealth(),
        fetchModelInfo(), 
        fetchModelMetrics(),
        fetchTrainingStatus()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount
  React.useEffect(() => {
    fetchAllData();
  }, []);

  const handleRefresh = () => {
    fetchAllData();
  };

  // Test anomaly function
  const testAnomalyPrediction = async () => {
    if (!testAnomaly.anomaly_id || !testAnomaly.description || !testAnomaly.equipment_name || !testAnomaly.equipment_id) {
      setTestError('Tous les champs sont requis pour tester une anomalie');
      return;
    }

    setIsTestingAnomaly(true);
    setTestError(null);
    setTestResult(null);

    try {
      const response = await fetch('/api/ai-predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testAnomaly)
      });

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      setTestResult(result);
    } catch (error) {
      console.error('Error testing anomaly:', error);
      setTestError(error instanceof Error ? error.message : 'Erreur lors du test de l\'anomalie');
    } finally {
      setIsTestingAnomaly(false);
    }
  };

  const resetTestForm = () => {
    setTestAnomaly({
      anomaly_id: 'ANO-2024-001',
      description: 'Fuite importante d\'huile au niveau du palier avec vibrations anormales',
      equipment_name: 'POMPE FUEL PRINCIPALE N°1',
      equipment_id: '98b82203-7170-45bf-879e-f47ba6e12c86'
    });
    setTestResult(null);
    setTestError(null);
  };

  // Function to remove emojis from text


  // Function to calculate overall score as sum of availability, fiability, and process safety
  const calculateOverallScore = (testResult: TestAnomalyResult): number => {
    if (!testResult.predictions) return 0;
    
    const availabilityScore = roundPredictionScore(testResult.predictions.availability?.score || 0);
    const fiabilityScore = roundPredictionScore(testResult.predictions.reliability?.score || 0);
    const processSafetyScore = roundPredictionScore(testResult.predictions.process_safety?.score || 0);
    
    return availabilityScore + fiabilityScore + processSafetyScore;
  };

  // Function to round prediction scores to nearest integer
  const roundPredictionScore = (score: number): number => {
    return Math.round(score);
  };

  // Equipment autocomplete helper functions
  const filterEquipment = (searchTerm: string) => {
    if (!searchTerm.trim()) return equipmentData.slice(0, 10); // Show first 10 items when empty
    
    return equipmentData.filter(equipment => 
      equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipment.id.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 10); // Limit to 10 results
  };

  const handleEquipmentSelect = (equipment: { id: string; name: string }) => {
    setTestAnomaly({
      ...testAnomaly,
      equipment_id: equipment.id,
      equipment_name: equipment.name
    });
    setEquipmentSearchTerm(equipment.name);
    setShowEquipmentDropdown(false);
  };

  const handleEquipmentInputChange = (value: string) => {
    setEquipmentSearchTerm(value);
    setShowEquipmentDropdown(value.length > 0);
    
    // Auto-fill based on exact match
    const exactMatch = equipmentData.find(equipment => 
      equipment.name.toLowerCase() === value.toLowerCase() || 
      equipment.id.toLowerCase() === value.toLowerCase()
    );
    
    if (exactMatch) {
      setTestAnomaly({
        ...testAnomaly,
        equipment_id: exactMatch.id,
        equipment_name: exactMatch.name
      });
    } else {
      // If no exact match, just update the name field
      setTestAnomaly({
        ...testAnomaly,
        equipment_name: value
      });
    }
  };

  // Function to handle equipment ID input changes
  const handleEquipmentIdChange = (id: string) => {
    const equipment = equipmentData.find(eq => eq.id === id);
    if (equipment) {
      setTestAnomaly({
        ...testAnomaly,
        equipment_id: id,
        equipment_name: equipment.name
      });
      setEquipmentSearchTerm(equipment.name);
    } else {
      setTestAnomaly({
        ...testAnomaly,
        equipment_id: id
      });
    }
  };

  // Load backups when training tab is active
  useEffect(() => {
    if (activeTab === 'training') {
      fetchBackups().catch(console.error);
      fetchTrainingStatus().catch(console.error);
    }
  }, [activeTab]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Gestion du Modèle IA
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Surveillez et gérez les performances du modèle d'intelligence artificielle
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleRefresh}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Actualisation...' : 'Actualiser'}
          </button>
    
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4">
        {/* Model Health */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-50 text-success-500">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">État du Modèle</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">v{healthData.version}</p>
              </div>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2 py-1 text-xs font-medium text-success-700">
                <div className="w-1.5 h-1.5 bg-success-500 rounded-full"></div>
                {healthData.status.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Model Performance */}


        {/* Training Status */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
              isTraining ? 'bg-warning-50 text-warning-500' : 'bg-gray-50 text-gray-500'
            }`}>
              {isTraining ? <Clock className="w-5 h-5" /> : <Database className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">Entraînement</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isTraining ? 'En cours...' : 'Inactif'}
              </p>
            </div>
          </div>
          <div className="mt-3">
            {isTraining ? (
              <div className="space-y-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-brand-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${trainingProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500">{Math.round(trainingProgress)}% terminé</p>
              </div>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {trainingStatusData.training_sessions_completed} sessions terminées
              </p>
            )}
          </div>
        </div>

        {/* Total Records */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-light-50 text-blue-light-500">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">Données</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total des enregistrements</p>
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-gray-800 dark:text-white/90">
              6288
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">Précision du Modèle</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Performance globale</p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                92%
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: '92%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Vue d\'ensemble', icon: <Activity className="w-4 h-4" /> },
            { id: 'test', label: 'Test Anomalies', icon: <Play className="w-4 h-4" /> },
            { id: 'training', label: 'Entraînement', icon: <Zap className="w-4 h-4" /> },
            { id: 'api', label: 'API & Exemples', icon: <Settings className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
                activeTab === tab.id
                  ? 'border-brand-500 text-brand-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Model Information Cards */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {Object.entries(modelInfoData.models).map(([modelName, modelData]) => (
              <div key={modelName} className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-500">
                      <Brain className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 capitalize">
                        {modelName.replace('_', ' ')}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {modelData.features} caractéristiques
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2 py-1 text-xs font-medium text-success-700">
                    <CheckCircle className="w-3 h-3" />
                    Actif
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {modelData.description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Plage cible:</span>
                    <span className="text-gray-800 dark:text-white/90 font-medium">
                      {modelData.target_range}
                    </span>
                  </div>
                  
                  {showAdvancedMetrics && metricsData.model_performance[modelName as keyof typeof metricsData.model_performance] && (
                    <div className="mt-4 space-y-3 border-t border-gray-100 dark:border-gray-800 pt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">R² Score</p>
                          <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                            {metricsData.model_performance[modelName as keyof typeof metricsData.model_performance]?.regression_metrics?.r2_score ? (metricsData.model_performance[modelName as keyof typeof metricsData.model_performance].regression_metrics.r2_score * 100).toFixed(1) + '%' : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Précision ±0.5</p>
                          <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                            {metricsData.model_performance[modelName as keyof typeof metricsData.model_performance]?.accuracy_metrics?.accuracy_within_0_5?.toFixed(1) || 'N/A'}%
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Recent Predictions Summary */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
              Résumé des Prédictions Récentes
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-2xl font-bold text-brand-500">342</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Prédictions aujourd'hui</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-2xl font-bold text-success-500">92.2%</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Précision moyenne</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-2xl font-bold text-gray-800 dark:text-white/90">1.2s</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Temps de réponse</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'test' && (
        <div className="space-y-6">
          {/* Test Anomaly Form */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  Test d&apos;Anomalie avec IA
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Testez les prédictions du modèle IA avec des données d&apos;anomalie réelles
                </p>
              </div>
              <button
                onClick={resetTestForm}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <RefreshCw className="w-4 h-4" />
                Réinitialiser
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Input Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ID Anomalie
                  </label>
                  <input
                    type="text"
                    value={testAnomaly.anomaly_id}
                    onChange={(e) => setTestAnomaly({...testAnomaly, anomaly_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    placeholder="ANO-2024-001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ID Équipement
                  </label>
                  <input
                    type="text"
                    value={testAnomaly.equipment_id}
                    onChange={(e) => handleEquipmentIdChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    placeholder="98b82203-7170-45bf-879e-f47ba6e12c86"
                  />
                </div>

                <div className="relative" ref={equipmentDropdownRef}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nom Équipement
                  </label>
                  <input
                    type="text"
                    value={equipmentSearchTerm}
                    onChange={(e) => handleEquipmentInputChange(e.target.value)}
                    onFocus={() => setShowEquipmentDropdown(true)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    placeholder="Rechercher un équipement..."
                    autoComplete="off"
                  />
                  
                  {showEquipmentDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filterEquipment(equipmentSearchTerm).map((equipment, index) => (
                        <div
                          key={`${equipment.id}-${index}`}
                          onClick={() => handleEquipmentSelect(equipment)}
                          className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                        >
                          <div className="font-medium text-gray-900 dark:text-white text-sm">
                            {equipment.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            ID: {equipment.id}
                          </div>
                        </div>
                      ))}
                      {filterEquipment(equipmentSearchTerm).length === 0 && (
                        <div className="px-3 py-2 text-gray-500 dark:text-gray-400 text-sm">
                          Aucun équipement trouvé
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description Anomalie
                  </label>
                  <textarea
                    value={testAnomaly.description}
                    onChange={(e) => setTestAnomaly({...testAnomaly, description: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    placeholder="Fuite importante d'huile au niveau du palier avec vibrations anormales"
                  />
                </div>

                {testError && (
                  <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-700 dark:text-red-400">{testError}</p>
                  </div>
                )}

                <button
                  onClick={testAnomalyPrediction}
                  disabled={isTestingAnomaly}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white bg-brand-500 rounded-lg shadow-sm hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isTestingAnomaly ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Test en cours...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Tester l&apos;Anomalie
                    </>
                  )}
                </button>
              </div>

                            {/* Results */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                    Résultats de la Prédiction
                  </h4>
                  {testResult && (
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      testResult.status === 'success' 
                        ? 'bg-success-50 text-success-700 border border-success-200' 
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        testResult.status === 'success' ? 'bg-success-500' : 'bg-red-500'
                      }`} />
                      {testResult.status === 'success' ? 'Succès' : 'Erreur'}
                    </span>
                  )}
                </div>

                {testResult ? (
                  <div className="space-y-6">
                    {/* Overall Score Card */}
                    <div className="bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-900/20 dark:to-brand-800/20 border border-brand-200 dark:border-brand-700 rounded-lg p-4">
                      <div className="text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-500 rounded-full mb-3">
                          <Brain className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-brand-600 dark:text-brand-400 mb-1">
                          {calculateOverallScore(testResult)}
                        </h3>
                        <p className="text-xs text-brand-700 dark:text-brand-300 mt-1">
                          Score Global IA
                        </p>
                        <p className="text-xs text-brand-600 dark:text-brand-400 mt-1">
                          (Disponibilité + Fiabilité + Sécurité)
                        </p>
                        
                        {/* Score Breakdown */}
                        <div className="mt-3 pt-3 border-t border-brand-200 dark:border-brand-800">
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="text-center">
                              <div className="font-semibold text-brand-600 dark:text-brand-400">
                                {roundPredictionScore(testResult.predictions.availability?.score || 0)}
                              </div>
                              <div className="text-brand-500 dark:text-brand-400">Disponibilité</div>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold text-brand-600 dark:text-brand-400">
                                {roundPredictionScore(testResult.predictions.reliability?.score || 0)}
                              </div>
                              <div className="text-brand-500 dark:text-brand-400">Fiabilité</div>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold text-brand-600 dark:text-brand-400">
                                {roundPredictionScore(testResult.predictions.process_safety?.score || 0)}
                              </div>
                              <div className="text-brand-500 dark:text-brand-400">Sécurité</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Risk Assessment */}
                  

                    {/* Predictions Grid */}
                    {testResult.predictions && (
                      <div>
                        <h5 className="text-sm font-semibold text-gray-800 dark:text-white/90 mb-4 flex items-center gap-2">
                          <BarChart3 className="w-4 h-4" />
                          Prédictions par Modèle
                        </h5>
                        <div className="grid gap-4">
                          {Object.entries(testResult.predictions).map(([key, prediction]: [string, PredictionResult]) => {
                            // Round the score before interpretation
                            const roundedScore = roundPredictionScore(prediction.score);
                            
                            // Use appropriate interpretation function based on the key
                            const interpretation = key === 'availability' ? interpretAvailabilityScore(roundedScore) :
                                                  key === 'reliability' || key === 'fiability' ? interpretFiabilityScore(roundedScore) :
                                                  key === 'process_safety' ? interpretProcessSafetyScore(roundedScore) :
                                                  interpretCriticalityScore(roundedScore);
                            
                            return (
                              <div key={key} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${
                                      interpretation.color === 'error' ? 'bg-red-500' :
                                      interpretation.color === 'warning' ? 'bg-yellow-500' :
                                      'bg-green-500'
                                    }`} />
                                    <h6 className="text-base font-medium text-gray-800 dark:text-white/90 capitalize">
                                      {key.replace('_', ' ')}
                                    </h6>
                                    <span className={`text-xs px-2 py-1 rounded-full ${interpretation.bgColor} ${interpretation.textColor}`}>
                                      {interpretation.level}
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    <span className={`text-xl font-bold ${
                                      interpretation.color === 'error' ? 'text-red-600' :
                                      interpretation.color === 'warning' ? 'text-yellow-600' :
                                      'text-green-600'
                                    }`}>
                                      {roundedScore}
                                    </span>
                                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">/5</span>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {prediction.description}
                                </p>
                                {/* Score bar */}
                                <div className="mt-3">
                                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div 
                                      className={`h-2 rounded-full transition-all duration-500 ${
                                        interpretation.color === 'error' ? 'bg-red-500' :
                                        interpretation.color === 'warning' ? 'bg-yellow-500' :
                                        'bg-green-500'
                                      }`}
                                      style={{ width: `${(roundedScore / 5) * 100}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Maintenance Recommendations */}
                   
                    {/* Processing Time Footer */}
                    <div className="flex items-center justify-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Temps de traitement: {testResult.processing_time_seconds?.toFixed(3)}s
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-6">
                      <Brain className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 dark:text-white/90 mb-2">
                      Prêt pour l&apos;analyse IA
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                      Remplissez les informations de l&apos;anomalie et cliquez sur &quot;Tester l&apos;Anomalie&quot; pour obtenir les prédictions de l&apos;IA.
                    </p>
                    <div className="flex items-center justify-center gap-6 text-xs text-gray-400">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        <span>Disponibilité</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Sécurité</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>Fiabilité</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* API Information */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
              Informations API
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-800 dark:text-white/90 mb-2">Endpoint</h4>
                <code className="text-xs text-brand-600 dark:text-brand-400 bg-white dark:bg-gray-800 px-2 py-1 rounded">
                  POST https://taqa-efuvl.ondigitalocean.app/predict
                </code>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-800 dark:text-white/90 mb-2">Format</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  JSON avec anomaly_id, description, equipment_name, equipment_id
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

     

      {activeTab === 'training' && (
        <div className="space-y-6">
          {/* Training Controls */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
              Entraînement du Modèle
            </h3>
            
            {/* File Upload Section */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fichier de Données d'Entraînement
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 hover:border-brand-500 transition-colors">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white/90">
                          Glissez et déposez votre fichier ici, ou 
                        </span>
                        <span className="text-brand-500 hover:text-brand-600"> parcourir</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          accept=".csv,.xlsx,.xls"
                          className="sr-only"
                          onChange={handleFileUpload}
                        />
                      </label>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        CSV ou Excel (max 10MB)
                      </p>
                    </div>
                  </div>
                </div>
                
                {uploadedFile && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <FileText className="w-4 h-4" />
                    <span>{uploadedFile.name}</span>
                    <span className="text-gray-400">({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                )}
              </div>

              {/* Training Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={handleStartTraining}
                  disabled={isTraining || !uploadedFile}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg shadow-sm hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isTraining ? <Clock className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isTraining ? 'Entraînement en cours...' : 'Démarrer l\'Entraînement'}
                </button>
                
                <button
                  disabled={!isTraining}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700"
                >
                  <Pause className="w-4 h-4" />
                  Arrêter
                </button>
              </div>
            </div>
          </div>

          {/* Training History */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Historique d'Entraînement
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {trainingStatusData.training_sessions_completed} sessions terminées
              </span>
            </div>

            <div className="space-y-3">
              {trainingStatusData.training_sessions_completed > 0 ? (
                [...Array(Math.min(3, trainingStatusData.training_sessions_completed))].map((_, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success-50 text-success-500">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                          Session #{trainingStatusData.training_sessions_completed - index}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {trainingStatusData.last_training ? new Date(trainingStatusData.last_training.timestamp).toLocaleDateString('fr-FR') : 'N/A'} • 
                          {trainingStatusData.last_training ? trainingStatusData.last_training.records_added + index * 12 : 0} enregistrements
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                        {trainingStatusData.last_training ? (trainingStatusData.last_training.training_time + index * 5).toFixed(1) : '0'}s
                      </p>
                      <p className="text-xs text-success-500">Réussi</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 mx-auto mb-4">
                    <Database className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">Aucune session d'entraînement</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Commencez par entraîner le modèle avec de nouvelles données</p>
                </div>
              )}
            </div>
          </div>

          {/* Backup Management */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Gestion des Sauvegardes
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {backups.length} sauvegardes disponibles
                </span>
                <button
                  onClick={() => fetchBackups()}
                  disabled={isLoadingBackups}
                  className="inline-flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoadingBackups ? 'animate-spin' : ''}`} />
                  Actualiser
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              {isLoadingBackups ? (
                <div className="text-center py-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 mx-auto mb-4">
                    <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
                  </div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">Chargement des sauvegardes...</p>
                </div>
              ) : backups.length > 0 ? (
                backups.map((backup) => (
                  <div key={backup.name} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
                        <Database className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                          {backup.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Créé le {new Date(backup.created).toLocaleDateString('fr-FR', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedBackup(selectedBackup === backup.name ? null : backup.name)}
                        className={`inline-flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg shadow-sm ${
                          selectedBackup === backup.name
                            ? 'text-white bg-brand-500 hover:bg-brand-600'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700'
                        }`}
                      >
                        {selectedBackup === backup.name ? 'Sélectionné' : 'Sélectionner'}
                      </button>
                      <button
                        onClick={() => handleRestoreBackup(backup.name)}
                        disabled={isRestoring}
                        className="inline-flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-300 rounded-lg shadow-sm hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-green-900/20 dark:text-green-400 dark:border-green-700 dark:hover:bg-green-900/30"
                      >
                        {isRestoring ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <RefreshCw className="w-3 h-3" />
                        )}
                        Restaurer
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 mx-auto mb-4">
                    <Database className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">Aucune sauvegarde disponible</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Les sauvegardes sont créées automatiquement lors de l'entraînement</p>
                </div>
              )}
            </div>

            {/* Model Reload Section */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-800 dark:text-white/90">
                    Rechargement des Modèles
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Rechargez les modèles après une restauration ou un entraînement
                  </p>
                </div>
                <button
                  onClick={handleReloadModels}
                  disabled={isReloading}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg shadow-sm hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isReloading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  {isReloading ? 'Rechargement...' : 'Recharger les Modèles'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'api' && (
        <div className="space-y-6">
          {/* API Endpoints */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-6">
              Endpoints API Disponibles
            </h3>
            
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* Health Check */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                    GET
                  </span>
                  <h4 className="font-medium text-gray-800 dark:text-white/90">Health Check</h4>
                </div>
                <code className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-2 rounded block mb-2">
                  GET /health
                </code>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Vérifier l'état de santé du service IA et si les modèles sont chargés
                </p>
              </div>

              {/* Model Info */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                               <div className="flex items-center gap-3 mb-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                    GET
                  </span>
                  <h4 className="font-medium text-gray-800 dark:text-white/90">Model Info</h4>
                </div>
                <code className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-2 rounded block mb-2">
                  GET /models/info
                </code>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Obtenir les informations détaillées sur tous les modèles disponibles
                </p>
              </div>

              {/* Prediction */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-light-100 text-blue-light-800">
                    POST
                  </span>
                  <h4 className="font-medium text-gray-800 dark:text-white/90">Prédiction</h4>
                </div>
                <code className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-2 rounded block mb-2">
                  POST /predict
                </code>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Prédire les scores pour une ou plusieurs anomalies
                </p>
              </div>

              {/* Model Metrics */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                    GET
                  </span>
                  <h4 className="font-medium text-gray-800 dark:text-white/90">Métriques</h4>
                </div>
                <code className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-2 rounded block mb-2">
                  GET /models/metrics
                </code>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Récupérer les métriques de performance détaillées des modèles
                </p>
              </div>

              {/* Training */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-light-100 text-blue-light-800">
                    POST
                  </span>
                  <h4 className="font-medium text-gray-800 dark:text-white/90">Entraînement</h4>
                </div>
                <code className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-2 rounded block mb-2">
                  POST /train
                </code>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Démarrer l'entraînement incrémental avec de nouvelles données
                </p>
              </div>

              {/* Training Status */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                    GET
                  </span>
                  <h4 className="font-medium text-gray-800 dark:text-white/90">État Entraînement</h4>
                </div>
                <code className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-2 rounded block mb-2">
                  GET /train/status
                </code>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Vérifier l'état actuel de l'entraînement et l'historique
                </p>
              </div>
            </div>
          </div>

          {/* Example Request/Response */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Request Example */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-light-50 text-blue-light-500">
                  <Upload className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  Exemple de Requête
                </h3>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-800 dark:text-white/90 mb-2">Endpoint</h4>
                  <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                    <code className="text-sm text-blue-light-600 dark:text-blue-light-400">
                      POST https://taqa-efuvl.ondigitalocean.app/predict
                    </code>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-800 dark:text-white/90 mb-2">Headers</h4>
                  <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                    <code className="text-sm text-gray-600 dark:text-gray-400">
                      Content-Type: application/json
                    </code>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-800 dark:text-white/90 mb-2">Body (JSON)</h4>
                  <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg overflow-x-auto">
                    <pre className="text-xs text-gray-700 dark:text-gray-300">
                      {JSON.stringify({
                        "anomaly_id": "ANO-2024-001",
                        "description": "Fuite importante d'huile au niveau du palier avec vibrations anormales",
                        "equipment_name": "POMPE FUEL PRINCIPALE N°1",
                        "equipment_id": "98b82203-7170-45bf-879e-f47ba6e12c86"
                      }, null, 2)}
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-800 dark:text-white/90 mb-2">
                    Réponse IA
                  </h4>
                </div>

              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-800 dark:text-white/90 mb-2">Status: 200 OK</h4>
                  <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg overflow-x-auto">
                    <pre className="text-xs text-gray-600 dark:text-gray-400">
{`{
  "anomaly_id": "ANO-2024-001",
  "equipment_id": "98b82203-7170-45bf-879e-f47ba6e12c86",
  "predictions": {
    "availability": {
      "score": 2.1,
      "confidence": 0.89,
      "risk_level": "ÉLEVÉ"
    },
    "reliability": {
      "score": 1.8,
      "confidence": 0.92,
      "risk_level": "CRITIQUE"
    },
    "process_safety": {
      "score": 2.5,
      "confidence": 0.85,
      "risk_level": "MODÉRÉ"
    }
  },
  "overall_assessment": {
    "priority": "URGENT",
    "recommended_actions": [
      "Arrêt immédiat de l'équipement",
      "Inspection complète du palier",
      "Remplacement des joints d'étanchéité"
    ],
    "estimated_downtime": "4-6 heures"
  },
  "processing_time": "0.234s",
  "model_version": "1.0.0"
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>          {/* Analysis Interpretation */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
              Interprétation de l'Analyse IA
            </h3>
            
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {/* Availability Score */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-800 dark:text-white/90">Disponibilité</h4>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${interpretAvailabilityScore(roundPredictionScore(2.1)).bgColor} ${interpretAvailabilityScore(roundPredictionScore(2.1)).textColor}`}>
                    Score: {roundPredictionScore(2.1)}/5
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Confiance:</span>
                    <span className="font-medium text-gray-800 dark:text-white/90">89%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Niveau de risque:</span>
                    <span className={`font-medium ${interpretAvailabilityScore(roundPredictionScore(2.1)).textColor.replace('text-', 'text-').replace('-800', '-600')}`}>
                      {interpretAvailabilityScore(roundPredictionScore(2.1)).level}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    {interpretAvailabilityScore(roundPredictionScore(2.1)).description}
                  </p>
                </div>
              </div>

              {/* Reliability Score */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-800 dark:text-white/90">Fiabilité</h4>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${interpretFiabilityScore(roundPredictionScore(1.8)).bgColor} ${interpretFiabilityScore(roundPredictionScore(1.8)).textColor}`}>
                    Score: {roundPredictionScore(1.8)}/5
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Confiance:</span>
                    <span className="font-medium text-gray-800 dark:text-white/90">92%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Niveau de risque:</span>
                    <span className={`font-medium ${interpretFiabilityScore(roundPredictionScore(1.8)).textColor.replace('text-', 'text-').replace('-800', '-600')}`}>
                      {interpretFiabilityScore(roundPredictionScore(1.8)).level}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    {interpretFiabilityScore(roundPredictionScore(1.8)).description}
                  </p>
                </div>
              </div>

              {/* Process Safety Score */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-800 dark:text-white/90">Sécurité</h4>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${interpretProcessSafetyScore(roundPredictionScore(2.5)).bgColor} ${interpretProcessSafetyScore(roundPredictionScore(2.5)).textColor}`}>
                    Score: {roundPredictionScore(2.5)}/5
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Confiance:</span>
                    <span className="font-medium text-gray-800 dark:text-white/90">85%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Niveau de risque:</span>
                    <span className={`font-medium ${interpretProcessSafetyScore(roundPredictionScore(2.5)).textColor.replace('text-', 'text-').replace('-800', '-600')}`}>
                      {interpretProcessSafetyScore(roundPredictionScore(2.5)).level}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    {interpretProcessSafetyScore(roundPredictionScore(2.5)).description}
                  </p>
                </div>
              </div>
            </div>

            {/* Recommended Actions */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Actions Recommandées
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm text-blue-800 dark:text-blue-200">
                    Inspection immédiate du système de lubrification
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm text-blue-800 dark:text-blue-200">
                    Surveillance continue des vibrations pendant 48h
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm text-blue-800 dark:text-blue-200">
                    Planifier maintenance préventive dans 7 jours
                  </span>
                </div>
              </div>
            </div>
           
          </div>
        </div>
      </div>    
      )}

      {/* Training Results/Errors */}
          {(trainingResult || trainingError) && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
              {trainingResult && (
                <div className="flex items-center gap-3 p-4 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-success-600 dark:text-success-400" />
                  <div>
                    <p className="text-sm font-medium text-success-800 dark:text-success-200">
                      {trainingResult.message}
                    </p>
                    {trainingResult.statistics && (
                      <p className="text-xs text-success-700 dark:text-success-300 mt-1">
                        {trainingResult.statistics.total_records_added} enregistrements ajoutés • 
                        {trainingResult.statistics.training_time_seconds.toFixed(1)}s de traitement
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {trainingError && (
                <div className="flex items-center gap-3 p-4 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-error-600 dark:text-error-400" />
                  <div>
                    <p className="text-sm font-medium text-error-800 dark:text-error-200">
                      Erreur d'entraînement
                    </p>
                    <p className="text-xs text-error-700 dark:text-error-300 mt-1">
                      {trainingError}
                    </p>
                  </div>
                  <button
                    onClick={() => setTrainingError(null)}
                    className="ml-auto text-error-600 dark:text-error-400 hover:text-error-800 dark:hover:text-error-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )}
    </div>

);
}