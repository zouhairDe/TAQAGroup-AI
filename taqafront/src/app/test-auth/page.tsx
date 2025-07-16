"use client";

import React, { useEffect, useState } from 'react';
import { AuthService } from '@/lib/auth';
import { LogoutButton } from '@/components/auth/logout-button';

export default function TestAuthPage() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const currentUser = AuthService.getUser();
    const currentToken = AuthService.getToken();
    setUser(currentUser);
    setToken(currentToken);
    
    console.log('Test Auth Page - User:', currentUser);
    console.log('Test Auth Page - Token exists:', !!currentToken);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            🔒 Test Page de Protection d'Authentification
          </h1>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-green-800 mb-2">
              ✅ Page Protégée Accessible!
            </h2>
            <p className="text-green-700">
              Si vous voyez cette page, cela signifie que vous êtes authentifié et que le middleware fonctionne.
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Informations Utilisateur:</h3>
              {user ? (
                <div className="space-y-2 text-sm">
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Nom:</strong> {user.name}</p>
                  <p><strong>Rôle:</strong> {user.role}</p>
                  <p><strong>Actif:</strong> {user.isActive ? 'Oui' : 'Non'}</p>
                </div>
              ) : (
                <p className="text-red-600">Aucun utilisateur trouvé dans le localStorage</p>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Token d'Authentification:</h3>
              <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                {token ? `${token.substring(0, 50)}...` : 'Aucun token trouvé'}
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">Test de Déconnexion:</h3>
              <p className="text-yellow-700 text-sm mb-3">
                Cliquez sur le bouton de déconnexion ci-dessous, puis essayez de revenir à cette page en tapant l'URL directement.
              </p>
              <LogoutButton />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">Instructions de Test:</h3>
              <ol className="text-blue-700 text-sm space-y-1 list-decimal list-inside">
                <li>Notez l'URL de cette page: <code className="bg-blue-100 px-1 rounded">http://localhost:3000/test-auth</code></li>
                <li>Cliquez sur "Se déconnecter" ci-dessus</li>
                <li>Vous devriez être redirigé vers la page de connexion</li>
                <li>Tapez l'URL de cette page directement dans votre navigateur</li>
                <li>Vous devriez être automatiquement redirigé vers la page de connexion</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 