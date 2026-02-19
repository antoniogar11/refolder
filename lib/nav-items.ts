import { LayoutDashboard, Users, Building2, FileText, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/presupuestos", label: "Presupuestos", icon: FileText },
  { href: "/dashboard/proyectos", label: "Proyectos", icon: Building2 },
  { href: "/dashboard/clientes", label: "Clientes", icon: Users },
];

export const settingsItem: NavItem = {
  href: "/dashboard/configuracion",
  label: "Configuración",
  icon: Settings,
};
