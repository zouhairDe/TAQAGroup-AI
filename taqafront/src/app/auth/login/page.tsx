"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TAQALogo } from "@/components/ui/taqa-logo";
import { ThemeProvider } from "@/context/ThemeContext";
import GridShape from "@/components/common/GridShape";
import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";
import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Checkbox from "@/components/form/input/Checkbox";
import TailAdminButton from "@/components/ui/button/TailAdminButton";
import { Alert } from "@/components/ui/alert";
import { AuthService } from "@/lib/auth";
import { AuthOnlyRoute } from "@/components/auth/AuthGuard";
import { Eye, EyeOff, Lock, Mail, Loader2, AlertCircle, ChevronLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log("Login attempt:", { ...formData, password: "[REDACTED]" });
      
      // Use AuthService to login
      const response = await AuthService.login({
        email: formData.email,
        password: formData.password,
        rememberMe: isChecked,
      });

      setSuccess("Connexion réussie ! Redirection en cours...");
      
      // Short delay to allow session provider to update from custom event
      setTimeout(() => {
        // Check if password change is required
        if (response.requiresPasswordChange) {
          router.push("/auth/change-password");
        } else {
          router.push("/dashboard");
        }
      }, 500);
      
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Une erreur inattendue s'est produite. Veuillez réessayer.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthOnlyRoute>
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <ThemeProvider>
        <div className="relative flex lg:flex-row w-full h-screen justify-center flex-col dark:bg-gray-900 sm:p-0">
                     {/* Left Side - Login Form */}
          <div className="flex flex-col flex-1 lg:w-1/2 w-full">

            <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
              <div>
                <div className="mb-5 sm:mb-8">
                  <h1 className="mb-2 font-semibold text-gray-800 text-2xl dark:text-white/90 sm:text-3xl">
                    Connexion
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Connectez-vous à votre compte pour accéder au système de gestion des anomalies
                  </p>
                </div>

                <div>
                  <form onSubmit={handleLogin}>
                    <div className="space-y-6">
                      {/* Error Alert */}
                      {error && (
                        <Alert
                          variant="error"
                          title="Erreur de connexion"
                          message={error}
                          onClose={() => setError(null)}
                        />
                      )}

                      {/* Success Alert */}
                      {success && (
                        <Alert
                          variant="success"
                          title="Connexion réussie"
                          message={success}
                        />
                      )}

                      {/* Email Field */}
                      <div>
                        <Label>
                          Adresse email <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                          <InputField
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="votre.email@taqa.ma"
                            className="pl-10"
                            disabled={isLoading}
                            autoComplete="email"
                            autoFocus
                            required
                          />
                        </div>
                      </div>

                      {/* Password Field */}
                      <div>
                        <Label>
                          Mot de passe <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                          <InputField
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="••••••••"
                            className="pl-10 pr-10"
                            disabled={isLoading}
                            autoComplete="current-password"
                            required
                          />
                          <span
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                          >
                            {showPassword ? (
                              <Eye className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Remember Me & Forgot Password */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Checkbox checked={isChecked} onChange={setIsChecked} />
                          <span className="block font-normal text-gray-700 text-sm dark:text-gray-400">
                            Se souvenir de moi
                          </span>
                        </div>
                        <Link
                          href="#"
                          className="text-sm text-taqa-electric-blue hover:text-taqa-navy dark:text-taqa-electric-blue transition-colors"
                        >
                          Mot de passe oublié ?
                        </Link>
                      </div>

                      {/* Submit Button */}
                      <div>
                        <TailAdminButton
                          type="submit"
                          disabled={isLoading}
                          className="w-full"
                          size="sm"
                          startIcon={isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
                        >
                          {isLoading ? "Connexion en cours..." : "Se connecter"}
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
              {/* Grid Shape Background */}
              <GridShape />
              
              <div className="flex flex-col items-center max-w-xs">
                <Link href="/dashboard" className="block mb-4">
                  <TAQALogo size="xl" variant="dark" />
                </Link>
                <p className="text-center text-gray-400 dark:text-white/60">
                  Système de Gestion des Anomalies Industrielles
                </p>
              </div>
            </div>
          </div>

          {/* Theme Toggler */}
          <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
            <ThemeTogglerTwo />
          </div>
        </div>
      </ThemeProvider>
    </div>
    </AuthOnlyRoute>
  );
} 