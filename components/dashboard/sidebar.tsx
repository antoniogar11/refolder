"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Building2, FileText, Truck, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/clientes", label: "Clientes", icon: Users },
  { href: "/dashboard/obras", label: "Obras", icon: Building2 },
  { href: "/dashboard/presupuestos", label: "Presupuestos", icon: FileText },
  { href: "/dashboard/proveedores", label: "Proveedores", icon: Truck },
  { href: "/dashboard/finanzas", label: "Finanzas", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 min-h-screen">
      <div className="p-6">
        <Link href="/dashboard" className="text-xl font-bold text-gray-900 dark:text-white">
          Refolder
        </Link>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
