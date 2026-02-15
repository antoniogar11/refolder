import { createClient } from "@/lib/supabase/server";
import type { MovementType, ProjectCost } from "@/types";

export async function getCostsByProjectId(
  projectId: string,
  tipo?: MovementType
): Promise<ProjectCost[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from("project_costs")
    .select("*")
    .eq("project_id", projectId)
    .eq("user_id", user.id);

  if (tipo) {
    query = query.eq("tipo", tipo);
  }

  const { data, error } = await query.order("fecha", { ascending: false });

  if (error) {
    console.error("Error fetching project costs", error);
    return [];
  }

  return data ?? [];
}

export async function getCostsSummary(
  projectId: string,
  tipo?: MovementType
): Promise<{ totalCost: number; count: number }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { totalCost: 0, count: 0 };

  let query = supabase
    .from("project_costs")
    .select("importe")
    .eq("project_id", projectId)
    .eq("user_id", user.id);

  if (tipo) {
    query = query.eq("tipo", tipo);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching costs summary", error);
    return { totalCost: 0, count: 0 };
  }

  const totalCost = data?.reduce((sum, c) => sum + Number(c.importe), 0) ?? 0;
  return { totalCost: Math.round(totalCost * 100) / 100, count: data?.length ?? 0 };
}

export type FinancialSummary = {
  presupuestado: number;
  gastado: number;
  cobrado: number;
  costeManoObra: number;
  beneficio: number;
};

export async function getFinancialSummary(projectId: string): Promise<FinancialSummary> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { presupuestado: 0, gastado: 0, cobrado: 0, costeManoObra: 0, beneficio: 0 };

  // Fetch project budget + all costs + all hours in parallel
  const [projectRes, costsRes, hoursRes] = await Promise.all([
    supabase
      .from("projects")
      .select("total_budget")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("project_costs")
      .select("importe, tipo")
      .eq("project_id", projectId)
      .eq("user_id", user.id),
    supabase
      .from("project_hours")
      .select("coste_total")
      .eq("project_id", projectId)
      .eq("user_id", user.id),
  ]);

  const presupuestado = Number(projectRes.data?.total_budget) || 0;

  const gastos = costsRes.data
    ?.filter((c) => c.tipo === "gasto")
    .reduce((sum, c) => sum + Number(c.importe), 0) ?? 0;

  const cobrado = costsRes.data
    ?.filter((c) => c.tipo === "ingreso")
    .reduce((sum, c) => sum + Number(c.importe), 0) ?? 0;

  const costeManoObra = hoursRes.data
    ?.reduce((sum, h) => sum + Number(h.coste_total), 0) ?? 0;

  const gastadoTotal = Math.round((gastos + costeManoObra) * 100) / 100;
  const beneficio = Math.round((cobrado - gastadoTotal) * 100) / 100;

  return {
    presupuestado: Math.round(presupuestado * 100) / 100,
    gastado: gastadoTotal,
    cobrado: Math.round(cobrado * 100) / 100,
    costeManoObra: Math.round(costeManoObra * 100) / 100,
    beneficio,
  };
}
