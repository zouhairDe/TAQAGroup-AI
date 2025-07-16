"use client";

import React, { useEffect } from 'react';
import { TAQALogo } from './taqa-logo';
import { useGlobalLoader } from '@/context/GlobalLoaderContext';

export const GlobalLoader: React.FC = () => {
  const { isLoading, loadingMessage } = useGlobalLoader();

  // Add custom animation delays via CSS (only on client side)
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .animation-delay-100 {
        animation-delay: 0.1s;
      }
      .animation-delay-150 {
        animation-delay: 0.15s;
      }
      .animation-delay-200 {
        animation-delay: 0.2s;
      }
    `;
    document.head.appendChild(style);

    // Cleanup function to remove the style when component unmounts
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
      <div className="text-center">
        {/* TAQA Logo with pulse animation */}
        <div className="mb-8 animate-pulse">
          <TAQALogo size="xl" variant="light" className="mx-auto" />
        </div>

        {/* Loading Animation */}
        <div className="mb-6">
          <div className="relative">
            {/* Outer ring */}
            <div className="w-16 h-16 mx-auto border-4 border-gray-200 dark:border-gray-700 rounded-full animate-spin">
              <div className="absolute inset-0 border-4 border-transparent border-t-taqa-electric-blue rounded-full animate-spin"></div>
            </div>
            
            {/* Inner ring */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-gray-300 dark:border-gray-600 rounded-full animate-spin animation-delay-150">
                <div className="absolute inset-0 border-2 border-transparent border-t-taqa-mustard rounded-full animate-spin"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Message */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {loadingMessage}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Veuillez patienter pendant que nous préparons vos données...
          </p>
        </div>
 
        {/* Loading Dots Animation */}
        <div className="flex justify-center mt-6 space-x-2">
          <div className="w-2 h-2 bg-taqa-electric-blue rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-taqa-electric-blue rounded-full animate-bounce animation-delay-100"></div>
          <div className="w-2 h-2 bg-taqa-electric-blue rounded-full animate-bounce animation-delay-200"></div>
        </div>

        {/* Progress Bar */}
        <div className="mt-8 w-64 mx-auto">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-gradient-to-r from-taqa-electric-blue to-taqa-mustard h-2 rounded-full animate-pulse"></div>
          </div>
        </div>

      </div>
    </div>
  );
}; 