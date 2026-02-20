"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navItems, settingsItem } from "@/lib/nav-items";

type SidebarProps = {
  quickAddButton?: React.ReactNode;
};

export function Sidebar({ quickAddButton }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-slate-900 min-h-screen">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-2 text-xl font-bold text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-sm font-bold text-white">
            R
          </span>
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
                  ? "bg-slate-800 text-white border-l-2 border-amber-500"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white transition-colors",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 pb-4 mt-auto border-t border-slate-800 pt-4 space-y-2">
        {quickAddButton}
        <Link
          href={settingsItem.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            pathname.startsWith(settingsItem.href)
              ? "bg-slate-800 text-white border-l-2 border-amber-500"
              : "text-slate-400 hover:bg-slate-800 hover:text-white transition-colors",
          )}
        >
          <settingsItem.icon className="h-5 w-5" />
          {settingsItem.label}
        </Link>
      </div>
    </aside>
  );
}
