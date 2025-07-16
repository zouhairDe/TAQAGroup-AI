import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { SessionProvider } from "@/context/AuthProvider";
import { ThemeScript } from "@/components/common/ThemeScript";
import { LogoutLoading } from "@/components/auth/LogoutLoading";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono", 
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TAQA Morocco - Système de Gestion des Anomalies",
  description: "Plateforme industrielle de gestion centralisée des anomalies critiques pour TAQA Morocco",
  keywords: ["TAQA", "Morocco", "anomalies", "industriel", "maintenance", "énergie"],
  authors: [{ name: "TAQA Morocco" }],
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#00A0DF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} ${jetbrainsMono.variable} ${outfit.variable}`}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/logo_2.svg" type="image/svg+xml" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="TAQA Anomalies" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#1e3a8a" />
        <meta name="msapplication-tap-highlight" content="no" />
        <ThemeScript />
      </head>
      <body className={`${outfit.className} dark:bg-gray-900`} suppressHydrationWarning={true}>
        <SessionProvider>
          <ThemeProvider>
            <SidebarProvider>
              {children}
              <LogoutLoading />
            </SidebarProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
