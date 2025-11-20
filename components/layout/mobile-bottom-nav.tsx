"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FolderKanban, Users, FileText, Receipt } from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Inicio",
    icon: Home,
  },
  {
    href: "/dashboard/obras",
    label: "Obras",
    icon: FolderKanban,
  },
  {
    href: "/dashboard/clientes",
    label: "Clientes",
    icon: Users,
  },
  {
    href: "/dashboard/presupuestos",
    label: "Presup.",
    icon: FileText,
  },
  {
    href: "/dashboard/facturas",
    label: "Facturas",
    icon: Receipt,
  },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const visibleItems = navItems.slice(0, 5); // Mostrar solo los 5 primeros en móvil

  return (
    <>
      {/* Bottom Navigation - Solo visible en móvil */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200/80 dark:border-gray-800/80 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.4)] md:hidden safe-area-inset-bottom">
        <div className="flex justify-around items-center h-16 safe-area-inset-left safe-area-inset-right">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href + "/"));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 touch-target active:scale-95 ${
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400 active:text-blue-600 dark:active:text-blue-400"
                }`}
              >
                <div className={`relative mb-0.5 transition-transform duration-200 ${isActive ? "scale-110" : "scale-100"}`}>
                  <Icon className="h-5 w-5" />
                  {isActive && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse" />
                  )}
                </div>
                <span className={`text-[10px] font-medium leading-tight transition-all ${isActive ? "font-semibold" : ""}`}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-blue-600 dark:bg-blue-400 rounded-b-full" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
      
      {/* Spacer para evitar que el contenido quede oculto detrás del bottom nav */}
      <div className="h-16 md:hidden safe-area-inset-bottom" />
    </>
  );
}
