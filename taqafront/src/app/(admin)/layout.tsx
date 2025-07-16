"use client";

import { useSidebar, SidebarProvider } from "@/context/SidebarContext";
import AppHeader from "@/components/layout/dashboard-header";
import AppSidebar from "@/components/layout/app-sidebar";
import Backdrop from "@/layout/Backdrop";
import { ProtectedRoute } from "@/components/auth/AuthGuard";
import { GlobalLoaderProvider } from "@/context/GlobalLoaderContext";
import { GlobalLoader } from "@/components/ui/global-loader";
import React from "react";

function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  return (
    <div className="min-h-screen xl:flex">
      {/* Sidebar and Backdrop */}
      <AppSidebar />
      <Backdrop />
      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
      >
        {/* Header */}
        <AppHeader />
        {/* Page Content */}
        <div className="p-4 mx-auto max-w-[1600px] md:p-6">{children}</div>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <GlobalLoaderProvider>
        <SidebarProvider>
          <AdminLayoutContent>{children}</AdminLayoutContent>
          <GlobalLoader />
        </SidebarProvider>
      </GlobalLoaderProvider>
    </ProtectedRoute>
  );
} 