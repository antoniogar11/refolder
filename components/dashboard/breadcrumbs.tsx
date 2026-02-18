"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

const labelMap: Record<string, string> = {
  dashboard: "Dashboard",
  clientes: "Clientes",
  proyectos: "Proyectos",
  presupuestos: "Presupuestos",
  proveedores: "Proveedores",
  finanzas: "Finanzas",
  visitas: "Visitas",
  configuracion: "Configuración",
  nuevo: "Nuevo",
  nueva: "Nueva",
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1) return null;

  const crumbs = segments
    .map((segment, index) => {
      const href = "/" + segments.slice(0, index + 1).join("/");
      // Skip UUID segments — the detail page title handles showing the name
      if (UUID_REGEX.test(segment)) return null;
      const label = labelMap[segment] ?? segment;
      const isLast = index === segments.length - 1 || UUID_REGEX.test(segments[index + 1] ?? "");

      return { href, label, isLast };
    })
    .filter(Boolean) as { href: string; label: string; isLast: boolean }[];

  return (
    <nav className="hidden sm:flex items-center gap-1 text-sm text-slate-400 dark:text-slate-400">
      {crumbs.map((crumb, index) => (
        <span key={crumb.href} className="flex items-center gap-1">
          {index > 0 && <ChevronRight className="h-3 w-3" />}
          {crumb.isLast ? (
            <span className="text-slate-900 dark:text-white font-medium">
              {crumb.label}
            </span>
          ) : (
            <Link href={crumb.href} className="hover:text-slate-900 dark:hover:text-white transition-colors">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
