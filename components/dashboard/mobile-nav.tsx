"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, LayoutDashboard, Users, Building2, FileText, Truck, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/clientes", label: "Clientes", icon: Users },
  { href: "/dashboard/obras", label: "Obras", icon: Building2 },
  { href: "/dashboard/presupuestos", label: "Presupuestos", icon: FileText },
  { href: "/dashboard/proveedores", label: "Proveedores", icon: Truck },
  { href: "/dashboard/finanzas", label: "Finanzas", icon: BarChart3 },
];

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="lg:hidden mr-2">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            Refolder
          </span>
        </div>
        <nav className="px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
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
      </SheetContent>
    </Sheet>
  );
}
