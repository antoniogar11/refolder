import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/dashboard/sidebar";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { Breadcrumbs } from "@/components/dashboard/breadcrumbs";
import { LogoutButton } from "@/components/auth/logout-button";

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen">
          <header className="border-b bg-white dark:bg-gray-800 h-16 flex items-center px-4 lg:px-8">
            <MobileNav />
            <Breadcrumbs />
            <div className="ml-auto flex items-center gap-2">
              <span className="hidden sm:block text-sm text-gray-600 dark:text-gray-400">
                {user.email}
              </span>
              <LogoutButton variant="outline" />
            </div>
          </header>
          <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
