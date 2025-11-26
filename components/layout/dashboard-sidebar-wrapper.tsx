"use client";

import { usePathname } from "next/navigation";
import { DashboardSidebar } from "./dashboard-sidebar";

type DashboardSidebarWrapperProps = {
  permissions: {
    canViewProjects: boolean;
    canViewClients: boolean;
    canViewEstimates: boolean;
    canViewInvoices: boolean;
    canViewFinances: boolean;
    canViewTimeTracking: boolean;
    isCompanyAdmin: boolean;
    isGlobalAdmin: boolean;
  };
};

export function DashboardSidebarWrapper({ permissions }: DashboardSidebarWrapperProps) {
  const pathname = usePathname();
  const isMainDashboard = pathname === "/dashboard";

  // No mostrar el sidebar en la página principal
  if (isMainDashboard) {
    return null;
  }

  return (
    <>
      <DashboardSidebar permissions={permissions} />
      {/* Spacer para desktop - solo cuando el sidebar está visible */}
      <div className="hidden md:block w-64 flex-shrink-0" aria-hidden="true" />
    </>
  );
}

