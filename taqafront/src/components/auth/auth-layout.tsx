"use client";

import React from "react";
import { TAQALogo } from "@/components/ui/taqa-logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  description,
  className,
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-taqa-navy to-taqa-electric-blue relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white/5 rounded-full" />
          <div className="absolute bottom-32 right-20 w-24 h-24 bg-white/5 rounded-full" />
          <div className="absolute top-1/2 right-32 w-16 h-16 bg-white/5 rounded-full" />
          <div className="absolute bottom-20 left-32 w-20 h-20 bg-white/5 rounded-full" />
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 py-20">
          <TAQALogo size="xl" variant="dark" className="mb-12" priority />
          
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-white leading-tight">
              Système de Gestion<br />
              des Anomalies
            </h1>
            
            <p className="text-xl text-blue-100 leading-relaxed">
              Plateforme industrielle centralisée pour la surveillance 
              et la gestion des anomalies critiques
            </p>
            
            <div className="space-y-4 pt-8">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-taqa-mustard rounded-full" />
                <span className="text-blue-100">Gestion en temps réel</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-taqa-mustard rounded-full" />
                <span className="text-blue-100">Interface mobile optimisée</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-taqa-mustard rounded-full" />
                <span className="text-blue-100">Traçabilité complète</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Authentication Form */}
      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <TAQALogo size="lg" variant="light" className="mx-auto mb-4" priority />
            <h1 className="text-2xl font-bold text-taqa-navy">
              Système de Gestion des Anomalies
            </h1>
          </div>

          {/* Auth Card */}
          <Card className={cn("shadow-sm border border-gray-200", className)}>
            <CardHeader className="space-y-2 pb-8">
              <CardTitle className="text-2xl font-semibold text-gray-900">
                {title}
              </CardTitle>
              <CardDescription className="text-gray-600 text-base">
                {description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6 pb-8">
              {children}
            </CardContent>
          </Card>

          {/* Footer */}
          {/* <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              &copy; 2024 TAQA Morocco. Tous droits réservés.
            </p>
            <div className="flex justify-center gap-6 mt-3">
              <a 
                href="#" 
                className="text-xs text-gray-400 hover:text-taqa-electric-blue transition-colors"
              >
                Confidentialité
              </a>
              <a 
                href="#" 
                className="text-xs text-gray-400 hover:text-taqa-electric-blue transition-colors"
              >
                Conditions d&apos;utilisation
              </a>
              <a 
                href="#" 
                className="text-xs text-gray-400 hover:text-taqa-electric-blue transition-colors"
              >
                Support
              </a>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}; 