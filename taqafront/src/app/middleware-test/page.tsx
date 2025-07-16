"use client";

import React, { useEffect, useState } from 'react';

export default function MiddlewareTestPage() {
  const [cookies, setCookies] = useState('');
  const [localStorage, setLocalStorage] = useState('');

  useEffect(() => {
    // Check cookies
    setCookies(document.cookie);
    
    // Check localStorage
    const token = window.localStorage.getItem('taqa_auth_token');
    setLocalStorage(token || 'No token in localStorage');
    
    console.log('=== MIDDLEWARE TEST PAGE ===');
    console.log('Document cookies:', document.cookie);
    console.log('LocalStorage token:', token);
    console.log('============================');
  }, []);

  const clearAllAuth = () => {
    // Clear localStorage
    localStorage.removeItem('taqa_auth_token');
    localStorage.removeItem('taqa_user_data');
    
    // Clear cookies aggressively
    const cookieName = 'taqa_auth_token';
    document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict`;
    document.cookie = `${cookieName}=; path=/; max-age=0; SameSite=Strict`;
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    
    // Force reload
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-red-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-red-600 mb-6">
            🔥 Page de Test Middleware - CETTE PAGE DEVRAIT ÊTRE BLOQUÉE!
          </h1>
          
          <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">
              ⚠️ PROBLÈME DÉTECTÉ!
            </h2>
            <p className="text-red-700">
              Si vous voyez cette page sans être connecté, cela signifie que le middleware ne fonctionne pas correctement.
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Cookies du navigateur:</h3>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                {cookies || 'Aucun cookie trouvé'}
              </pre>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">LocalStorage:</h3>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                {localStorage}
              </pre>
            </div>

            <button
              onClick={clearAllAuth}
              className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              🧹 Nettoyer Tout et Recharger
            </button>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">Instructions:</h3>
              <ol className="text-blue-700 text-sm space-y-1 list-decimal list-inside">
                <li>Si vous voyez cette page sans être connecté, le middleware ne marche pas</li>
                <li>Cliquez sur "Nettoyer Tout" pour supprimer toute authentification</li>
                <li>La page devrait se recharger et vous rediriger vers la connexion</li>
                <li>Si ça ne marche pas, il y a un problème avec le middleware</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 