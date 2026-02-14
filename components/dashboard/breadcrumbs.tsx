"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

const labelMap: Record<string, string> = {
  dashboard: "Dashboard",
  clientes: "Clientes",
  obras: "Obras",
  presupuestos: "Presupuestos",
  proveedores: "Proveedores",
  finanzas: "Finanzas",
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1) return null;

  const crumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const label = labelMap[segment] ?? segment;
    const isLast = index === segments.length - 1;

    return { href, label, isLast };
  });

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
