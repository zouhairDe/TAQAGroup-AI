/**
 * Custom hook for managing dashboard data
 */

import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '@/lib/services/dashboard-service';
import { DashboardData } from '@/types/database-types';

interface DashboardHookData {
  data: DashboardData | null;
  loading: boolean;
  isInitialLoading: boolean;
  error: string | null;
  lastUpdate: Date | null;
}

interface UseDashboardOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

export function useDashboard(options: UseDashboardOptions = {}) {
  const { autoRefresh = true, refreshInterval = 30000 } = options;
  
  const [state, setState] = useState<DashboardHookData>({
    data: null,
    loading: true,
    isInitialLoading: true,
    error: null,
    lastUpdate: null,
  });

  const fetchDashboardData = useCallback(async (isInitial = false) => {
    try {
      setState(prev => ({ 
        ...prev, 
        loading: true, 
        isInitialLoading: isInitial, 
        error: null 
      }));

      const response = await dashboardService.getDashboardData();

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch dashboard data');
      }

      setState({
        data: response.data!,
        loading: false,
        isInitialLoading: false,
        error: null,
        lastUpdate: new Date(Math.floor(Date.now() / 60000) * 60000), // Round to nearest minute to prevent hydration issues
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        isInitialLoading: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      }));
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData(true); // Mark as initial loading
  }, [fetchDashboardData]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchDashboardData(false); // Mark as refresh, not initial
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchDashboardData]);

  // Manual refresh function
  const refresh = useCallback(() => {
    fetchDashboardData(false); // Mark as refresh, not initial
  }, [fetchDashboardData]);

  // Individual data fetchers for components that need specific data
  const fetchMetrics = useCallback(async () => {
    try {
      const response = await dashboardService.getDashboardMetrics();
      return response.data;
    } catch (error) {
      console.error('Error fetching metrics:', error);
      return null;
    }
  }, []);

  const fetchAnomalyTypes = useCallback(async () => {
    try {
      const response = await dashboardService.getAnomalyTypeDistribution();
      return response.data;
    } catch (error) {
      console.error('Error fetching anomaly types:', error);
      return null;
    }
  }, []);

  const fetchCriticalAlerts = useCallback(async () => {
    try {
      const response = await dashboardService.getCriticalAlerts();
      return response.data;
    } catch (error) {
      console.error('Error fetching critical alerts:', error);
      return null;
    }
  }, []);

  const fetchTeamPerformance = useCallback(async () => {
    try {
      const response = await dashboardService.getTeamPerformance();
      return response.data;
    } catch (error) {
      console.error('Error fetching team performance:', error);
      return null;
    }
  }, []);

  const fetchRecentActivities = useCallback(async () => {
    try {
      const response = await dashboardService.getRecentActivities();
      return response.data;
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      return null;
    }
  }, []);

  // Get formatted time ago
  const getTimeAgo = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date(Math.floor(Date.now() / 60000) * 60000); // Round to nearest minute for consistency
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'À l\'instant';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `Il y a ${minutes} min`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `Il y a ${hours}h`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `Il y a ${days}j`;
    }
  }, []);

  return {
    ...state,
    refresh,
    fetchMetrics,
    fetchAnomalyTypes,
    fetchCriticalAlerts,
    fetchTeamPerformance,
    fetchRecentActivities,
    getTimeAgo,
  };
} 