import { createClient } from "@/lib/supabase/server";
import type { Project, Estimate } from "@/types";

export type DashboardStats = {
  totalClients: number;
  totalProjects: number;
  totalEstimates: number;
  activeProjects: number;
  pendingEstimates: number;
  acceptedEstimatesTotal: number;
  recentProjects: (Pick<Project, "id" | "name" | "status" | "created_at"> & {
    client?: { id: string; name: string } | null;
  })[];
  recentEstimates: (Pick<Estimate, "id" | "name" | "status" | "total_amount" | "created_at"> & {
    client?: { id: string; name: string } | null;
  })[];
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      totalClients: 0,
      totalProjects: 0,
      totalEstimates: 0,
      activeProjects: 0,
      pendingEstimates: 0,
      acceptedEstimatesTotal: 0,
      recentProjects: [],
      recentEstimates: [],
    };
  }

  const [clientsResult, projectsResult, estimatesResult, recentProjectsResult, recentEstimatesResult] = await Promise.all([
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
    supabase
      .from("projects")
      .select("id, name, status, created_at, client:clients(id, name)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("estimates")
      .select("id, name, status, total_amount, created_at, client:clients!estimates_client_id_fkey(id, name)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
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
    totalProjects: projectsResult.data?.length ?? 0,
    totalEstimates: estimatesResult.data?.length ?? 0,
    activeProjects,
    pendingEstimates,
    acceptedEstimatesTotal,
    recentProjects: (recentProjectsResult.data as unknown as DashboardStats["recentProjects"]) ?? [],
    recentEstimates: (recentEstimatesResult.data as unknown as DashboardStats["recentEstimates"]) ?? [],
  };
}
