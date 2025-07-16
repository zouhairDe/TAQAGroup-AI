"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { dataProcessingService } from '@/lib/services/data-processing-service';

interface GlobalLoaderContextType {
  isLoading: boolean;
  loadingMessage: string;
  setLoading: (loading: boolean, message?: string) => void;
  checkSystemStatus: () => Promise<void>;
}

const GlobalLoaderContext = createContext<GlobalLoaderContextType | undefined>(undefined);

export const useGlobalLoader = () => {
  const context = useContext(GlobalLoaderContext);
  if (!context) {
    throw new Error('useGlobalLoader must be used within a GlobalLoaderProvider');
  }
  return context;
};

interface GlobalLoaderProviderProps {
  children: React.ReactNode;
}

export const GlobalLoaderProvider: React.FC<GlobalLoaderProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Chargement...');
  const [checkInterval, setCheckInterval] = useState<NodeJS.Timeout | null>(null);

  const setLoading = (loading: boolean, message: string = 'Chargement...') => {
    setIsLoading(loading);
    setLoadingMessage(message);
  };

  const checkSystemStatus = async () => {
    try {
      const isProcessing = await dataProcessingService.isSystemProcessing();
      
      if (isProcessing) {
        const runningProcesses = await dataProcessingService.getRunningProcesses();
        if (runningProcesses.length > 0) {
          const currentProcess = runningProcesses[0];
          setLoading(true, `Traitement en cours: ${currentProcess.operation}`);
        } else {
          setLoading(true, 'Traitement des données en cours...');
        }
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking system status:', error);
      // Don't show loading if we can't check status
      setLoading(false);
    }
  };

  // Check system status on mount and set up interval
  useEffect(() => {
    checkSystemStatus();

    // Check every 5 seconds for system processing status
    const interval = setInterval(checkSystemStatus, 5000);
    setCheckInterval(interval);

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (checkInterval) {
        clearInterval(checkInterval);
      }
    };
  }, [checkInterval]);

  return (
    <GlobalLoaderContext.Provider value={{
      isLoading,
      loadingMessage,
      setLoading,
      checkSystemStatus
    }}>
      {children}
    </GlobalLoaderContext.Provider>
  );
}; 