import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { DashboardSidebarServer } from "@/components/layout/dashboard-sidebar-server";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div className="flex min-h-screen">
      <DashboardSidebarServer />
      <div className="flex-1 flex flex-col">
        {children}
        <MobileBottomNav />
      </div>
    </div>
  );
}

