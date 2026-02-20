import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/dashboard/sidebar";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { Breadcrumbs } from "@/components/dashboard/breadcrumbs";
import { LogoutButton } from "@/components/auth/logout-button";
import { QuickAddProvider } from "@/components/dashboard/quick-add-provider";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="flex">
        <Sidebar quickAddButton={<QuickAddProvider variant="sidebar" />} />
        <div className="flex-1 flex flex-col min-h-screen">
          <header className="border-b border-slate-200 bg-white dark:bg-slate-800 h-16 flex items-center px-4 lg:px-8">
            <MobileNav />
            <Breadcrumbs />
            <div className="ml-auto flex items-center gap-2">
              <span className="hidden sm:block text-sm text-slate-600 dark:text-slate-400">
                {user.email}
              </span>
              <LogoutButton variant="outline" />
            </div>
          </header>
          <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full pb-24 lg:pb-8">
            {children}
          </main>
          {/* FAB - Botón flotante móvil */}
          <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
            <QuickAddProvider variant="fab" />
          </div>
        </div>
      </div>
    </div>
  );
}
