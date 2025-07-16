"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { TAQALogo } from "@/components/ui/taqa-logo";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useSession } from "@/context/AuthProvider";

export default function HomePage() {
  const router = useRouter();
  const { session, status, isInitialLoading } = useSession();

  useEffect(() => {
    if (isInitialLoading) return;

    const timer = setTimeout(() => {
      if (status === 'authenticated') {
        router.push("/dashboard");
      } else {
      router.push("/auth/login");
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [router, status, isInitialLoading]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-taqa-navy via-taqa-electric-blue to-taqa-navy flex items-center justify-center">
      <div className="text-center">
        <TAQALogo size="xl" variant="dark" className="mx-auto mb-8" />
        <h1 className="text-white text-3xl font-bold mb-4">
          Système de Gestion des Anomalies
        </h1>
        <p className="text-blue-100 text-lg mb-8">
          Plateforme industrielle TAQA Morocco
        </p>
        <LoadingSpinner 
          size="lg" 
          text={isInitialLoading ? "Vérification de la session..." : "Redirection en cours..."}
          className="text-white"
        />
        </div>
    </div>
  );
}
