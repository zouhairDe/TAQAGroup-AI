"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AnomalyService } from '@/lib/services/anomaly-service';
import { DashboardService } from '@/lib/services/dashboard-service';
import { useSession } from './AuthProvider';

// Types for all the data we'll manage
interface DataContextType {
  // Data states
  anomalies: any[];
  anomaliesStats: any;
  dashboardData: any;
  
  // Loading states
  isInitialLoading: boolean;
  isAnomaliesLoading: boolean;
  isDashboardLoading: boolean;
  
  // Error states
  anomaliesError: string | null;
  dashboardError: string | null;
  
  // Refresh methods
  refreshAnomalies: () => Promise<void>;
  refreshDashboard: () => Promise<void>;
  refreshAll: () => Promise<void>;
  
  // Create/Update methods that auto-refresh
  createAnomaly: (data: any) => Promise<any>;
  updateAnomaly: (id: string, data: any) => Promise<any>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}

export function DataProvider({ children }: DataProviderProps) {
  // Data states
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [anomaliesStats, setAnomaliesStats] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  
  // Loading states
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isAnomaliesLoading, setIsAnomaliesLoading] = useState(false);
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);
  
  // Error states
  const [anomaliesError, setAnomaliesError] = useState<string | null>(null);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  
  const { user, isAuthenticated } = useSession();

  // Fetch anomalies data
  const fetchAnomalies = async (showLoading = false) => {
    try {
      if (showLoading) setIsAnomaliesLoading(true);
      setAnomaliesError(null);
      
      console.log('=== FETCHING ANOMALIES DATA ===');
      
      // Fetch 100 anomalies and stats in parallel
      const [anomaliesResponse, statsResponse] = await Promise.all([
        AnomalyService.getAllAnomalies({
          page: 1,
          limit: 100,
          status: 'all',
          priority: 'all',
          search: ''
        }),
        AnomalyService.getAnomalyStats()
      ]);
      
      if (anomaliesResponse.success) {
        console.log('Raw anomalies response:', anomaliesResponse);
        const transformedAnomalies = anomaliesResponse.data.map((anomaly: any) => 
          AnomalyService.transformAnomalyData(anomaly)
        );
        console.log('Transformed anomalies (100 items):', transformedAnomalies);
        setAnomalies(transformedAnomalies);
      }
      
      if (statsResponse.success) {
        console.log('Anomalies stats:', statsResponse.data);
        setAnomaliesStats(statsResponse.data);
      }
      
    } catch (error) {
      console.error('Error fetching anomalies data:', error);
      setAnomaliesError(error instanceof Error ? error.message : 'Failed to fetch anomalies');
    } finally {
      if (showLoading) setIsAnomaliesLoading(false);
    }
  };

  // Fetch dashboard data
  const fetchDashboard = async (showLoading = false) => {
    try {
      if (showLoading) setIsDashboardLoading(true);
      setDashboardError(null);
      
      console.log('=== FETCHING DASHBOARD DATA ===');
      
      const response = await DashboardService.getDashboardData();
      
      if (response.success) {
        console.log('Dashboard data:', response.data);
        setDashboardData(response.data);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDashboardError(error instanceof Error ? error.message : 'Failed to fetch dashboard data');
    } finally {
      if (showLoading) setIsDashboardLoading(false);
    }
  };

  // Initial data fetch when user logs in
  useEffect(() => {
    const initializeData = async () => {
      if (!isAuthenticated || !user) {
        setIsInitialLoading(false);
        return;
      }

      console.log('=== INITIALIZING ALL APPLICATION DATA ===');
      console.log('User authenticated:', user);
      
      setIsInitialLoading(true);
      
      try {
        // Fetch all data in parallel
        await Promise.all([
          fetchAnomalies(false),
          fetchDashboard(false)
        ]);
        
        console.log('=== ALL DATA INITIALIZED SUCCESSFULLY ===');
        
      } catch (error) {
        console.error('=== ERROR INITIALIZING DATA ===', error);
      } finally {
        // Small delay to ensure smooth loading transition
        setTimeout(() => {
          setIsInitialLoading(false);
        }, 500);
      }
    };

    initializeData();
  }, [isAuthenticated, user]);

  // Refresh methods
  const refreshAnomalies = async () => {
    await fetchAnomalies(true);
  };

  const refreshDashboard = async () => {
    await fetchDashboard(true);
  };

  const refreshAll = async () => {
    console.log('=== REFRESHING ALL DATA ===');
    await Promise.all([
      fetchAnomalies(false),
      fetchDashboard(false)
    ]);
  };

  // Create anomaly with auto-refresh
  const createAnomaly = async (data: any) => {
    try {
      console.log('Creating anomaly and refreshing data...', data);
      const result = await AnomalyService.createAnomaly(data);
      
      // Refresh anomalies data after creation
      await fetchAnomalies(false);
      await fetchDashboard(false); // Dashboard might have updated stats
      
      return result;
    } catch (error) {
      console.error('Error creating anomaly:', error);
      throw error;
    }
  };

  // Update anomaly with auto-refresh
  const updateAnomaly = async (id: string, data: any) => {
    try {
      console.log('Updating anomaly and refreshing data...', { id, data });
      const result = await AnomalyService.updateAnomaly(id, data);
      
      // Refresh anomalies data after update
      await fetchAnomalies(false);
      await fetchDashboard(false); // Dashboard might have updated stats
      
      return result;
    } catch (error) {
      console.error('Error updating anomaly:', error);
      throw error;
    }
  };

  const value: DataContextType = {
    // Data
    anomalies,
    anomaliesStats,
    dashboardData,
    
    // Loading states
    isInitialLoading,
    isAnomaliesLoading,
    isDashboardLoading,
    
    // Error states
    anomaliesError,
    dashboardError,
    
    // Refresh methods
    refreshAnomalies,
    refreshDashboard,
    refreshAll,
    
    // CRUD methods
    createAnomaly,
    updateAnomaly,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
} 