import { createClient } from "@/lib/supabase/server";

export type DashboardStats = {
  totalClients: number;
  activeProjects: number;
  pendingEstimates: number;
  acceptedEstimatesTotal: number;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      totalClients: 0,
      activeProjects: 0,
      pendingEstimates: 0,
      acceptedEstimatesTotal: 0,
    };
  }

  const [clientsResult, projectsResult, estimatesResult] = await Promise.all([
    supabase
      .from("clients")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("projects")
      .select("id, status")
      .eq("user_id", user.id),
    supabase
      .from("estimates")
      .select("id, status, total_amount")
      .eq("user_id", user.id),
  ]);

  const activeProjects =
    projectsResult.data?.filter((p) => p.status === "in_progress").length ?? 0;
  const pendingEstimates =
    estimatesResult.data?.filter((e) => e.status === "sent").length ?? 0;
  const acceptedEstimatesTotal =
    estimatesResult.data
      ?.filter((e) => e.status === "accepted")
      .reduce((sum, e) => sum + (e.total_amount ?? 0), 0) ?? 0;

  return {
    totalClients: clientsResult.count ?? 0,
    activeProjects,
    pendingEstimates,
    acceptedEstimatesTotal,
  };
}
