import { createClient } from "@/lib/supabase/server";
import type { ProjectHour } from "@/types";

export async function getHoursByProjectId(projectId: string): Promise<ProjectHour[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("project_hours")
    .select("*")
    .eq("project_id", projectId)
    .eq("user_id", user.id)
    .order("fecha", { ascending: false });

  if (error) {
    console.error("Error fetching project hours", error);
    return [];
  }

  return data ?? [];
}

export async function getHoursSummary(
  projectId: string
): Promise<{ totalHours: number; totalCost: number; count: number }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { totalHours: 0, totalCost: 0, count: 0 };

  const { data, error } = await supabase
    .from("project_hours")
    .select("horas, coste_total")
    .eq("project_id", projectId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error fetching hours summary", error);
    return { totalHours: 0, totalCost: 0, count: 0 };
  }

  const totalHours = data?.reduce((sum, h) => sum + Number(h.horas), 0) ?? 0;
  const totalCost = data?.reduce((sum, h) => sum + Number(h.coste_total), 0) ?? 0;

  return {
    totalHours: Math.round(totalHours * 100) / 100,
    totalCost: Math.round(totalCost * 100) / 100,
    count: data?.length ?? 0,
  };
}
