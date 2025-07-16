"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TAQALogo } from "@/components/ui/taqa-logo";
import { ThemeProvider } from "@/context/ThemeContext";
import GridShape from "@/components/common/GridShape";
import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import TailAdminButton from "@/components/ui/button/TailAdminButton";
import { Alert } from "@/components/ui/alert";
import { AuthService } from "@/lib/auth";
import { Eye, EyeOff, Lock, Loader2, CheckCircle } from "lucide-react";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    // Get user data from localStorage
    const userData = AuthService.getUser();
    if (!userData) {
      router.push('/auth/login');
      return;
    }
    setUser(userData);
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return "Le mot de passe doit contenir au moins 8 caractères";
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return "Le mot de passe doit contenir au moins une minuscule";
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return "Le mot de passe doit contenir au moins une majuscule";
    }
    if (!/(?=.*\d)/.test(password)) {
      return "Le mot de passe doit contenir au moins un chiffre";
    }
    if (!/(?=.*[!@#$%^&*])/.test(password)) {
      return "Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*)";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    // Validate passwords
    const passwordError = validatePassword(formData.newPassword);
    if (passwordError) {
      setError(passwordError);
      setIsLoading(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setIsLoading(false);
      return;
    }

    if (!user) {
      setError("Utilisateur non trouvé");
      setIsLoading(false);
      return;
    }

    try {
      await AuthService.changePassword(user.id, formData.newPassword);
      
      setSuccess("Mot de passe mis à jour avec succès ! Redirection vers le tableau de bord...");
      
      // Wait a moment to show success message
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
      
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Une erreur s'est produite lors du changement de mot de passe");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/(?=.*[a-z])/.test(password)) strength++;
    if (/(?=.*[A-Z])/.test(password)) strength++;
    if (/(?=.*\d)/.test(password)) strength++;
    if (/(?=.*[!@#$%^&*])/.test(password)) strength++;
    return strength;
  };

  const getStrengthColor = (strength: number) => {
    switch (strength) {
      case 0:
      case 1:
        return "bg-red-500";
      case 2:
        return "bg-orange-500";
      case 3:
        return "bg-yellow-500";
      case 4:
        return "bg-blue-500";
      case 5:
        return "bg-green-500";
      default:
        return "bg-gray-300";
    }
  };

  const getStrengthText = (strength: number) => {
    switch (strength) {
      case 0:
      case 1:
        return "Très faible";
      case 2:
        return "Faible";
      case 3:
        return "Moyen";
      case 4:
        return "Fort";
      case 5:
        return "Très fort";
      default:
        return "";
    }
  };

  const currentStrength = passwordStrength(formData.newPassword);

  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <ThemeProvider>
        <div className="relative flex lg:flex-row w-full h-screen justify-center flex-col dark:bg-gray-900 sm:p-0">
          {/* Left Side - Change Password Form */}
          <div className="flex flex-col flex-1 lg:w-1/2 w-full">
            <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
              <div>
                <div className="mb-5 sm:mb-8">
                  <h1 className="mb-2 font-semibold text-gray-800 text-2xl dark:text-white/90 sm:text-3xl">
                    Changement de mot de passe
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Veuillez créer un nouveau mot de passe sécurisé pour votre première connexion
                  </p>
                  {user && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-300">
                        Connecté en tant que: <strong>{user.email}</strong>
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                      {/* Error Alert */}
                      {error && (
                        <Alert
                          variant="error"
                          title="Erreur"
                          message={error}
                          onClose={() => setError(null)}
                        />
                      )}

                      {/* Success Alert */}
                      {success && (
                        <Alert
                          variant="success"
                          title="Succès"
                          message={success}
                        />
                      )}

                      {/* New Password Field */}
                      <div>
                        <Label>
                          Nouveau mot de passe <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                          <InputField
                            type={showNewPassword ? "text" : "password"}
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleInputChange}
                            placeholder="••••••••"
                            className="pl-10 pr-10"
                            disabled={isLoading}
                            required
                          />
                          <span
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                          >
                            {showNewPassword ? (
                              <Eye className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            )}
                          </span>
                        </div>
                        
                        {/* Password Strength Indicator */}
                        {formData.newPassword && (
                          <div className="mt-2">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all ${getStrengthColor(currentStrength)}`}
                                  style={{ width: `${(currentStrength / 5) * 100}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                {getStrengthText(currentStrength)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Confirm Password Field */}
                      <div>
                        <Label>
                          Confirmer le mot de passe <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                          <InputField
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            placeholder="••••••••"
                            className="pl-10 pr-10"
                            disabled={isLoading}
                            required
                          />
                          <span
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                          >
                            {showConfirmPassword ? (
                              <Eye className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            )}
                          </span>
                        </div>
                        
                        {/* Password Match Indicator */}
                        {formData.confirmPassword && (
                          <div className="mt-2">
                            {formData.newPassword === formData.confirmPassword ? (
                              <div className="flex items-center gap-2 text-green-600">
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-sm">Les mots de passe correspondent</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-red-600">
                                <span className="text-sm">Les mots de passe ne correspondent pas</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Password Requirements */}
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Exigences du mot de passe:
                        </h4>
                        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                          <li className={formData.newPassword.length >= 8 ? "text-green-600" : ""}>
                            • Au moins 8 caractères
                          </li>
                          <li className={/(?=.*[a-z])/.test(formData.newPassword) ? "text-green-600" : ""}>
                            • Au moins une minuscule
                          </li>
                          <li className={/(?=.*[A-Z])/.test(formData.newPassword) ? "text-green-600" : ""}>
                            • Au moins une majuscule
                          </li>
                          <li className={/(?=.*\d)/.test(formData.newPassword) ? "text-green-600" : ""}>
                            • Au moins un chiffre
                          </li>
                          <li className={/(?=.*[!@#$%^&*])/.test(formData.newPassword) ? "text-green-600" : ""}>
                            • Au moins un caractère spécial (!@#$%^&*)
                          </li>
                        </ul>
                      </div>

                      {/* Submit Button */}
                      <div>
                        <TailAdminButton
                          type="submit"
                          disabled={isLoading || currentStrength < 5 || formData.newPassword !== formData.confirmPassword}
                          className="w-full"
                          size="sm"
                          startIcon={isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
                        >
                          {isLoading ? "Changement en cours..." : "Changer le mot de passe"}
                        </TailAdminButton>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Branding */}
          <div className="lg:w-1/2 w-full h-full bg-taqa-navy dark:bg-white/5 lg:grid items-center hidden">
            <div className="relative items-center justify-center flex z-1">
              <GridShape />
              <div className="flex flex-col items-center max-w-xs">
                <TAQALogo size="xl" variant="dark" className="mb-4" />
                <h2 className="text-xl font-semibold text-white mb-2">
                  Sécurité d'abord
                </h2>
                <p className="text-center text-gray-400 dark:text-white/60">
                  Créez un mot de passe fort pour protéger votre compte et les données industrielles
                </p>
              </div>
            </div>
          </div>
        </div>
      </ThemeProvider>
    </div>
  );
} 