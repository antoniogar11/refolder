import { throwQueryError } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";
import { roundCurrency } from "@/lib/utils";
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

  if (error) throwQueryError("getHoursByProjectId", error);

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

  if (error) throwQueryError("getHoursSummary", error);

  const totalHours = data?.reduce((sum, h) => sum + Number(h.horas), 0) ?? 0;
  const totalCost = data?.reduce((sum, h) => sum + Number(h.coste_total), 0) ?? 0;

  return {
    totalHours: roundCurrency(totalHours),
    totalCost: roundCurrency(totalCost),
    count: data?.length ?? 0,
  };
}
