import { createClient } from "@/lib/supabase/server";
import type { ProjectCost } from "@/types";

export async function getCostsByProjectId(projectId: string): Promise<ProjectCost[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("project_costs")
    .select("*")
    .eq("project_id", projectId)
    .eq("user_id", user.id)
    .order("fecha", { ascending: false });

  if (error) {
    console.error("Error fetching project costs", error);
    return [];
  }

  return data ?? [];
}

export async function getCostsSummary(projectId: string): Promise<{ totalCost: number; count: number }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { totalCost: 0, count: 0 };

  const { data, error } = await supabase
    .from("project_costs")
    .select("importe")
    .eq("project_id", projectId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error fetching costs summary", error);
    return { totalCost: 0, count: 0 };
  }

  const totalCost = data?.reduce((sum, c) => sum + Number(c.importe), 0) ?? 0;
  return { totalCost: Math.round(totalCost * 100) / 100, count: data?.length ?? 0 };
}
