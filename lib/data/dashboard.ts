import { throwQueryError } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";

type RecentProject = {
  id: string;
  name: string;
  status: string;
  created_at: string;
  client: { id: string; name: string } | null;
};

type RecentEstimate = {
  id: string;
  name: string;
  status: string;
  total_amount: number;
  created_at: string;
  client: { id: string; name: string } | null;
};

export type DashboardStats = {
  totalClients: number;
  totalProjects: number;
  totalEstimates: number;
  activeProjects: number;
  pendingEstimates: number;
  acceptedEstimatesTotal: number;
  recentProjects: RecentProject[];
  recentEstimates: RecentEstimate[];
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

  if (projectsResult.error) throwQueryError("getDashboardStats:projects", projectsResult.error);
  if (estimatesResult.error) throwQueryError("getDashboardStats:estimates", estimatesResult.error);

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
    recentProjects: (recentProjectsResult.data ?? []).map((p) => ({
      id: p.id,
      name: p.name,
      status: p.status,
      created_at: p.created_at,
      client: Array.isArray(p.client) ? p.client[0] ?? null : p.client ?? null,
    })),
    recentEstimates: (recentEstimatesResult.data ?? []).map((e) => ({
      id: e.id,
      name: e.name,
      status: e.status,
      total_amount: e.total_amount,
      created_at: e.created_at,
      client: Array.isArray(e.client) ? e.client[0] ?? null : e.client ?? null,
    })),
  };
}
