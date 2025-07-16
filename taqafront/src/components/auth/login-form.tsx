"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail, Loader2, AlertCircle, HelpCircle } from "lucide-react";

import Button from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

import { loginSchema, type LoginFormData, type PasswordResetRequestData } from "@/lib/validations";

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
  onPasswordResetRequest: (data: PasswordResetRequestData) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  onPasswordResetRequest,
  isLoading = false,
  error,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const resetForm = useForm<PasswordResetRequestData>({
    defaultValues: {
      email: "",
      reason: "",
      requestedBy: "",
    },
  });

  const handleSubmit = async (data: LoginFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handlePasswordResetRequest = async (data: PasswordResetRequestData) => {
    setResetLoading(true);
    try {
      await onPasswordResetRequest(data);
      setShowResetDialog(false);
      resetForm.reset();
    } catch (error) {
      console.error("Password reset request error:", error);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Error Alert */}
          {error && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700 leading-relaxed">{error}</p>
            </div>
          )}

          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-sm font-medium text-gray-700">
                  Adresse email
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                    <Input
                      {...field}
                      type="email"
                      placeholder="votre.email@taqa.ma"
                      className="pl-10 h-12 border-gray-300 focus:border-taqa-electric-blue focus:ring-1 focus:ring-taqa-electric-blue transition-colors"
                      disabled={isLoading}
                      autoComplete="email"
                      autoFocus
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Password Field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-sm font-medium text-gray-700">
                  Mot de passe
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10 h-12 border-gray-300 focus:border-taqa-electric-blue focus:ring-1 focus:ring-taqa-electric-blue transition-colors"
                      disabled={isLoading}
                      autoComplete="current-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-10 w-10 hover:bg-gray-100"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                      aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Remember Me & Password Reset */}
          <div className="flex items-center justify-between pt-2">
            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                      className="data-[state=checked]:bg-taqa-electric-blue data-[state=checked]:border-taqa-electric-blue"
                    />
                  </FormControl>
                  <FormLabel className="text-sm text-gray-600 cursor-pointer font-normal">
                    Se souvenir de moi
                  </FormLabel>
                </FormItem>
              )}
            />

            <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-sm text-taqa-electric-blue hover:text-taqa-navy transition-colors font-medium"
                >
                  <HelpCircle className="h-4 w-4 mr-1" />
                  Mot de passe oublié ?
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Demande de réinitialisation</DialogTitle>
                  <DialogDescription>
                    Une demande sera envoyée à votre manager pour approuver la réinitialisation de votre mot de passe.
                  </DialogDescription>
                </DialogHeader>
                <Form {...resetForm}>
                  <form onSubmit={resetForm.handleSubmit(handlePasswordResetRequest)} className="space-y-4">
                    <FormField
                      control={resetForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Adresse email</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              placeholder="votre.email@taqa.ma"
                              disabled={resetLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={resetForm.control}
                      name="requestedBy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Votre nom complet</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Nom et prénom"
                              disabled={resetLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={resetForm.control}
                      name="reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Raison de la demande</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Décrivez brièvement pourquoi vous avez besoin de réinitialiser votre mot de passe..."
                              rows={3}
                              disabled={resetLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowResetDialog(false)}
                        disabled={resetLoading}
                        className="flex-1"
                      >
                        Annuler
                      </Button>
                      <Button
                        type="submit"
                        disabled={resetLoading}
                        className="flex-1 bg-taqa-electric-blue hover:bg-taqa-navy"
                      >
                        {resetLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Envoi...
                          </>
                        ) : (
                          "Envoyer la demande"
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-12 bg-taqa-electric-blue hover:bg-taqa-navy text-white font-medium transition-all duration-200 mt-8"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connexion en cours...
              </>
            ) : (
              "Se connecter"
            )}
          </Button>

          {/* Demo Credentials */}
          {/* <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-900 mb-3">
              Comptes de démonstration
            </h4>
            <div className="space-y-2 text-xs text-blue-800">
              <div className="flex items-center justify-between">
                <span className="font-medium">👨‍💼 Manager</span>
                <span className="font-mono">manager@taqa.ma</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">🔧 Technicien</span>
                <span className="font-mono">tech@taqa.ma</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">⚙️ Admin</span>
                <span className="font-mono">admin@taqa.ma</span>
              </div>
              <div className="pt-1 text-center border-t border-blue-200">
                <span className="text-blue-600">Mot de passe : <span className="font-mono">password123</span></span>
              </div>
            </div>
          </div> */}
        </form>
      </Form>
    </>
  );
}; 