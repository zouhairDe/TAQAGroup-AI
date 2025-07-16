"use client";

import React from 'react';
import { useSession } from '@/context/AuthProvider';

export function LogoutLoading() {
  const { isLoggingOut } = useSession();

  // Only show during actual logout process
  if (!isLoggingOut) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-center">
          <svg
            className="animate-spin w-8 h-8 text-taqa-electric-blue"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Déconnexion en cours...
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Veuillez patienter pendant que nous vous déconnectons
          </p>
        </div>
      </div>
    </div>
  );
}

export default LogoutLoading; 