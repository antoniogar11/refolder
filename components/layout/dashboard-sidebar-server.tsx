import { DashboardSidebarWrapper } from "./dashboard-sidebar-wrapper";
import { getUserRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";
import { hasWorkerPermission, isCompanyAdmin } from "@/lib/data/companies";

export async function DashboardSidebarServer() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userRole: string | null = null;
  if (user) {
    userRole = await getUserRole(user.id);
  }

  const isGlobalAdmin = userRole === "admin";
  const isCompanyAdminUser = await isCompanyAdmin();

  // Verificar permisos para cada sección
  const canViewProjects = isCompanyAdminUser || await hasWorkerPermission("projects:read");
  const canViewClients = isCompanyAdminUser || await hasWorkerPermission("clients:read");
  const canViewEstimates = isCompanyAdminUser || await hasWorkerPermission("estimates:read");
  const canViewInvoices = isCompanyAdminUser || await hasWorkerPermission("invoices:read");
  const canViewFinances = isCompanyAdminUser || await hasWorkerPermission("finances:read");
  const canViewTimeTracking = isCompanyAdminUser || await hasWorkerPermission("time-tracking:read");

  return (
    <DashboardSidebarWrapper
      permissions={{
        canViewProjects,
        canViewClients,
        canViewEstimates,
        canViewInvoices,
        canViewFinances,
        canViewTimeTracking,
        isCompanyAdmin: isCompanyAdminUser,
        isGlobalAdmin,
      }}
    />
  );
}

