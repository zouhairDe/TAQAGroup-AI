"use client";

import React, { useState } from 'react';
import { User, Shield, Globe, Palette, Key, Database, FileText, Clock, Mail, Phone, MapPin, Save, Eye, EyeOff } from 'lucide-react';

export default function SettingsPage() {
  const [profileData, setProfileData] = useState({
    firstName: 'Ahmed',
    lastName: 'Benali',
    email: 'ahmed.benali@taqa.ma',
    phone: '+212 6 12 34 56 78',
    location: 'Casablanca, Maroc',
    role: 'Ingénieur Maintenance'
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showCurrentPassword: false,
    showNewPassword: false,
    showConfirmPassword: false
  });

  const [preferences, setPreferences] = useState({
    language: 'fr',
    timezone: 'Africa/Casablanca',
    theme: 'system',
    dateFormat: 'dd/MM/yyyy',
    autoSaveReports: true,
    showAdvancedFilters: true
  });

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'team',
    shareAnalytics: false,
    allowDataExport: true,
    sessionTimeout: '30'
  });

  const handleProfileUpdate = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSecurityUpdate = (field: string, value: string | boolean) => {
    setSecurityData(prev => ({ ...prev, [field]: value }));
  };

  const handlePreferenceUpdate = (field: string, value: string | boolean) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
  };

  const handlePrivacyUpdate = (field: string, value: string | boolean) => {
    setPrivacySettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveSettings = () => {
    console.log('Sauvegarde des paramètres...');
    // API call to save settings
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            Paramètres
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gérez vos préférences et paramètres du compte
          </p>
        </div>
        <button
          onClick={handleSaveSettings}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        >
          <Save className="h-4 w-4" />
          Sauvegarder
        </button>
      </div>

      <div className="">
        {/* Left Column - Profile & Security */}
        <div className="space-y-6">
          {/* Profile Information */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  Informations du profil
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Mettez à jour vos informations personnelles
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Prénom
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) => handleProfileUpdate('firstName', e.target.value)}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-300 focus:outline-none focus:ring-3 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-blue-800"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Nom
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) => handleProfileUpdate('lastName', e.target.value)}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-300 focus:outline-none focus:ring-3 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-blue-800"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleProfileUpdate('email', e.target.value)}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent pl-10 pr-4 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-300 focus:outline-none focus:ring-3 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-blue-800"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Téléphone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => handleProfileUpdate('phone', e.target.value)}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent pl-10 pr-4 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-300 focus:outline-none focus:ring-3 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-blue-800"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Localisation
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={(e) => handleProfileUpdate('location', e.target.value)}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent pl-10 pr-4 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-300 focus:outline-none focus:ring-3 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-blue-800"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/20">
                <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  Sécurité
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Gérez votre mot de passe et paramètres de sécurité
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Mot de passe actuel
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type={securityData.showCurrentPassword ? "text" : "password"}
                    value={securityData.currentPassword}
                    onChange={(e) => handleSecurityUpdate('currentPassword', e.target.value)}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent pl-10 pr-12 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-300 focus:outline-none focus:ring-3 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-blue-800"
                    placeholder="Saisir le mot de passe actuel"
                  />
                  <button
                    type="button"
                    onClick={() => handleSecurityUpdate('showCurrentPassword', !securityData.showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {securityData.showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type={securityData.showNewPassword ? "text" : "password"}
                      value={securityData.newPassword}
                      onChange={(e) => handleSecurityUpdate('newPassword', e.target.value)}
                      className="h-11 w-full rounded-lg border border-gray-300 bg-transparent pl-10 pr-12 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-300 focus:outline-none focus:ring-3 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-blue-800"
                      placeholder="Nouveau mot de passe"
                    />
                    <button
                      type="button"
                      onClick={() => handleSecurityUpdate('showNewPassword', !securityData.showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {securityData.showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type={securityData.showConfirmPassword ? "text" : "password"}
                      value={securityData.confirmPassword}
                      onChange={(e) => handleSecurityUpdate('confirmPassword', e.target.value)}
                      className="h-11 w-full rounded-lg border border-gray-300 bg-transparent pl-10 pr-12 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-300 focus:outline-none focus:ring-3 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-blue-800"
                      placeholder="Confirmer le mot de passe"
                    />
                    <button
                      type="button"
                      onClick={() => handleSecurityUpdate('showConfirmPassword', !securityData.showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {securityData.showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/30 dark:bg-amber-900/20">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    Recommandations de sécurité
                  </p>
                </div>
                <ul className="mt-2 list-disc list-inside text-xs text-amber-700 dark:text-amber-300 space-y-1">
                  <li>Utilisez au moins 8 caractères avec des lettres, chiffres et symboles</li>
                  <li>Évitez les mots de passe communs ou les informations personnelles</li>
                  <li>Changez votre mot de passe régulièrement</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 