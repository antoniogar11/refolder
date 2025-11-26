"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FolderKanban,
  Users,
  FileText,
  Receipt,
  Wallet,
  Clock,
  Calculator,
  Building2,
  Settings,
  X,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
};

type DashboardSidebarProps = {
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

export function DashboardSidebar({ permissions }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navItems: NavItem[] = [
    {
      href: "/dashboard",
      label: "Inicio",
      icon: Home,
    },
    ...(permissions.canViewProjects
      ? [
          {
            href: "/dashboard/obras",
            label: "Obras",
            icon: FolderKanban,
          },
        ]
      : []),
    ...(permissions.canViewClients
      ? [
          {
            href: "/dashboard/clientes",
            label: "Clientes",
            icon: Users,
          },
        ]
      : []),
    ...(permissions.canViewEstimates
      ? [
          {
            href: "/dashboard/presupuestos",
            label: "Presupuestos",
            icon: FileText,
          },
        ]
      : []),
    ...(permissions.canViewInvoices
      ? [
          {
            href: "/dashboard/facturas",
            label: "Facturas",
            icon: Receipt,
          },
        ]
      : []),
    {
      href: "/dashboard/impuestos",
      label: "Impuestos",
      icon: Calculator,
    },
    ...(permissions.canViewFinances
      ? [
          {
            href: "/dashboard/finanzas",
            label: "Finanzas",
            icon: Wallet,
          },
        ]
      : []),
    ...(permissions.canViewTimeTracking
      ? [
          {
            href: "/dashboard/control-horario",
            label: "Control Horario",
            icon: Clock,
          },
        ]
      : []),
    ...(permissions.isCompanyAdmin
      ? [
          {
            href: "/dashboard/empresa",
            label: "Mi Empresa",
            icon: Building2,
          },
        ]
      : []),
    ...(permissions.isGlobalAdmin
      ? [
          {
            href: "/dashboard/admin/roles",
            label: "Administración",
            icon: Settings,
          },
        ]
      : []),
  ];

  return (
    <>
      {/* Botón para abrir el menú en móvil */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden bg-white dark:bg-gray-900 shadow-lg border border-gray-200 dark:border-gray-800"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Overlay en móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-40 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:z-30",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header del Sidebar */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/50">
                <span className="text-lg font-bold">R</span>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Refolder
              </span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navegación */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname?.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 shadow-sm"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 flex-shrink-0",
                      isActive
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-500 dark:text-gray-400"
                    )}
                  />
                  <span className="flex-1">{item.label}</span>
                  {isActive && (
                    <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer del Sidebar */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              © {new Date().getFullYear()} Refolder
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

