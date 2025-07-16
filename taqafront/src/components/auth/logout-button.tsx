"use client";

import React from 'react';
import { useSession } from '@/context/AuthProvider';
import { LogOut } from 'lucide-react';

interface LogoutButtonProps {
  className?: string;
  variant?: 'button' | 'link';
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({ 
  className = '', 
  variant = 'button' 
}) => {
  const { signOut } = useSession();

  const handleLogout = async () => {
    try {
      console.log('Logout button clicked, calling signOut...');
      await signOut();
      console.log('SignOut completed successfully');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (variant === 'link') {
    return (
      <button
        onClick={handleLogout}
        className={`flex items-center gap-2 text-red-600 hover:text-red-800 transition-colors ${className}`}
      >
        <LogOut className="w-4 h-4" />
        Se déconnecter
      </button>
    );
  }

  return (
    <button
      onClick={handleLogout}
      className={`flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors ${className}`}
    >
      <LogOut className="w-4 h-4" />
      Se déconnecter
    </button>
  );
}; 