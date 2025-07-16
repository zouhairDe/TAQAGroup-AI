"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, Mail, Phone, MapPin, Calendar, Eye, Edit, Save, X,
  EyeOff, Lock, Shield, Building, UserCheck
} from 'lucide-react';
import { userService, type UserProfile } from '@/lib/services/user-service';
import { toast } from '@/components/ui/use-toast';
import { AuthService } from '@/lib/auth';

export default function ProfilePage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  
  // User profile data
  const [profileData, setProfileData] = useState<UserProfile | null>(null);

  // Password change data
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showCurrentPassword: false,
    showNewPassword: false,
    showConfirmPassword: false
  });

  useEffect(() => {
    checkAuthAndLoadProfile();
  }, []);

  const checkAuthAndLoadProfile = async () => {
    try {
      setIsAuthChecking(true);
      const user = await AuthService.verifyToken();
      if (!user) {
        router.replace('/auth/login');
        return;
      }
      await loadUserProfile();
    } catch (error) {
      console.error('Auth check failed:', error);
      toast({
        title: "Erreur d'authentification",
        description: "Veuillez vous reconnecter",
        variant: "destructive"
      });
      router.replace('/auth/login');
    } finally {
      setIsAuthChecking(false);
    }
  };

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      const data = await userService.getProfile();
      setProfileData(data);
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du profil",
        variant: "destructive"
      });
      if (error instanceof Error && error.message === 'Not authenticated') {
        router.replace('/auth/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = (field: string, value: string) => {
    if (profileData) {
      setProfileData(prev => prev ? { ...prev, [field]: value } : null);
    }
  };

  const handlePasswordUpdate = (field: string, value: string | boolean) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      if (!profileData) return;
      
      const updatedProfile = await userService.updateProfile({
        name: profileData.name,
        phone: profileData.phone
      });
      
      setProfileData(updatedProfile);
      setIsEditing(false);
      toast({
        title: "Succès",
        description: "Profil mis à jour avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil",
        variant: "destructive"
      });
    }
  };

  const handleSavePassword = async () => {
    try {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast({
          title: "Erreur",
          description: "Les mots de passe ne correspondent pas",
          variant: "destructive"
        });
        return;
      }

      await userService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        showCurrentPassword: false,
        showNewPassword: false,
        showConfirmPassword: false
      });

      toast({
        title: "Succès",
        description: "Mot de passe changé avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de changer le mot de passe",
        variant: "destructive"
      });
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    loadUserProfile(); // Reload original data
  };

  const handleCancelPasswordChange = () => {
    setIsChangingPassword(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      showCurrentPassword: false,
      showNewPassword: false,
      showConfirmPassword: false
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleLabel = (role: string) => {
    const roleLabels: Record<string, string> = {
      admin: 'Administrateur',
      manager: 'Manager',
      technician: 'Technicien',
      user: 'Utilisateur'
    };
    return roleLabels[role] || role;
  };

  if (isAuthChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Vérification de l'authentification...</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Chargement du profil...</span>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">
          Impossible de charger les données du profil. 
          <button 
            onClick={loadUserProfile}
            className="ml-2 text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            Réessayer
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            Profil Utilisateur
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gérez vos informations personnelles et votre mot de passe
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!isEditing && !isChangingPassword && (
            <button 
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            >
              <Edit className="h-4 w-4" />
              Modifier
            </button>
          )}
          {isEditing && (
            <>
              <button 
                onClick={handleCancelEdit}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-900"
              >
                <X className="h-4 w-4" />
                Annuler
          </button>
          <button 
                onClick={handleSaveProfile}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
                <Save className="h-4 w-4" />
                Sauvegarder
              </button>
              </>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Information */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Informations personnelles
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Vos informations de profil utilisateur
              </p>
                </div>
              </div>

          <div className="space-y-6">
            {/* Name */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Nom complet
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                  value={profileData.name}
                  onChange={(e) => handleProfileUpdate('name', e.target.value)}
                        className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-300 focus:outline-none focus:ring-3 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-blue-800"
                      />
                    ) : (
                <p className="text-sm font-medium text-gray-800 dark:text-white/90 py-2.5">
                  {profileData.name}
                      </p>
                    )}
                  </div>

            {/* Email */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Email
                    </label>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-400" />
                      <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {profileData.email}
                </p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                L'email ne peut pas être modifié
              </p>
                  </div>

            {/* Role */}
            <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Rôle
                    </label>
              <div className="flex items-center gap-3">
                <UserCheck className="h-4 w-4 text-gray-400" />
                      <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {getRoleLabel(profileData.role)}
                      </p>
              </div>
                  </div>

            {/* Department */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      Département
                    </label>
              <div className="flex items-center gap-3">
                <Building className="h-4 w-4 text-gray-400" />
                      <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                        {profileData.department}
                      </p>
              </div>
            </div>

            {/* Site */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Site
                </label>
                <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-gray-400" />
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {profileData.site}
                    </p>
                </div>
              </div>

            {/* Phone */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Téléphone
                </label>
                  {isEditing ? (
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => handleProfileUpdate('phone', e.target.value)}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent pl-10 pr-4 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-300 focus:outline-none focus:ring-3 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-blue-800"
                    />
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {profileData.phone}
                    </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Security & Account Info */}
        <div className="space-y-6">
          {/* Password Change */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/20">
                  <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                    Sécurité
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Gérer votre mot de passe
                </p>
                </div>
              </div>
              {!isChangingPassword && !isEditing && (
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-900"
                >
                  <Lock className="h-4 w-4" />
                  Changer le mot de passe
                </button>
              )}
            </div>

            {isChangingPassword ? (
            <div className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Mot de passe actuel
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type={passwordData.showCurrentPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => handlePasswordUpdate('currentPassword', e.target.value)}
                      className="h-11 w-full rounded-lg border border-gray-300 bg-transparent pl-10 pr-12 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-300 focus:outline-none focus:ring-3 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-blue-800"
                      placeholder="Entrez votre mot de passe actuel"
                    />
                    <button
                      type="button"
                      onClick={() => handlePasswordUpdate('showCurrentPassword', !passwordData.showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {passwordData.showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type={passwordData.showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => handlePasswordUpdate('newPassword', e.target.value)}
                      className="h-11 w-full rounded-lg border border-gray-300 bg-transparent pl-10 pr-12 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-300 focus:outline-none focus:ring-3 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-blue-800"
                      placeholder="Entrez le nouveau mot de passe"
                    />
                    <button
                      type="button"
                      onClick={() => handlePasswordUpdate('showNewPassword', !passwordData.showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {passwordData.showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Confirmer le nouveau mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type={passwordData.showConfirmPassword ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => handlePasswordUpdate('confirmPassword', e.target.value)}
                      className="h-11 w-full rounded-lg border border-gray-300 bg-transparent pl-10 pr-12 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-300 focus:outline-none focus:ring-3 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-blue-800"
                      placeholder="Confirmez le nouveau mot de passe"
                    />
                    <button
                      type="button"
                      onClick={() => handlePasswordUpdate('showConfirmPassword', !passwordData.showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {passwordData.showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
            </div>
          </div>

                {/* Password Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleCancelPasswordChange}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-900"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSavePassword}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                  >
                    <Shield className="h-4 w-4" />
                    Changer le mot de passe
                  </button>
              </div>
              </div>
            ) : (
            <div className="space-y-4">
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Votre mot de passe est sécurisé. Changez-le régulièrement pour maintenir la sécurité de votre compte.
                  </p>
                </div>
            </div>
            )}
          </div>

          {/* Account Information */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
                <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  Informations du compte
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Détails de votre compte utilisateur
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Statut du compte</span>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      profileData.isActive 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {profileData.isActive ? 'Actif' : 'Inactif'}
                    </span>
                </div>
              </div>

                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
                  <div className="mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Compte créé le</span>
                </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDateTime(profileData.createdAt)}
                  </p>
              </div>

                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
                  <div className="mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dernière connexion</span>
                </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDateTime(profileData.lastLogin)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 