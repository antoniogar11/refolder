import { throwQueryError } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";
import { roundCurrency } from "@/lib/utils";
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

  if (error) throwQueryError("getCostsByProjectId", error);

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

  if (error) throwQueryError("getCostsSummary", error);

  const totalCost = data?.reduce((sum, c) => sum + Number(c.importe), 0) ?? 0;
  return { totalCost: roundCurrency(totalCost), count: data?.length ?? 0 };
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

  if (costsRes.error) throwQueryError("getFinancialSummary:costs", costsRes.error);
  if (hoursRes.error) throwQueryError("getFinancialSummary:hours", hoursRes.error);

  const presupuestado = Number(projectRes.data?.total_budget) || 0;

  const gastos = costsRes.data
    ?.filter((c) => c.tipo === "gasto")
    .reduce((sum, c) => sum + Number(c.importe), 0) ?? 0;

  const cobrado = costsRes.data
    ?.filter((c) => c.tipo === "ingreso")
    .reduce((sum, c) => sum + Number(c.importe), 0) ?? 0;

  const costeManoObra = hoursRes.data
    ?.reduce((sum, h) => sum + Number(h.coste_total), 0) ?? 0;

  const gastadoTotal = roundCurrency(gastos + costeManoObra);
  const beneficio = roundCurrency(cobrado - gastadoTotal);

  return {
    presupuestado: roundCurrency(presupuestado),
    gastado: gastadoTotal,
    cobrado: roundCurrency(cobrado),
    costeManoObra: roundCurrency(costeManoObra),
    beneficio,
  };
}

export async function getGlobalFinancialSummary(): Promise<FinancialSummary> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { presupuestado: 0, gastado: 0, cobrado: 0, costeManoObra: 0, beneficio: 0 };

  const [projectsRes, costsRes, hoursRes] = await Promise.all([
    supabase
      .from("projects")
      .select("total_budget")
      .eq("user_id", user.id),
    supabase
      .from("project_costs")
      .select("importe, tipo")
      .eq("user_id", user.id),
    supabase
      .from("project_hours")
      .select("coste_total")
      .eq("user_id", user.id),
  ]);

  if (projectsRes.error) throwQueryError("getGlobalFinancialSummary:projects", projectsRes.error);
  if (costsRes.error) throwQueryError("getGlobalFinancialSummary:costs", costsRes.error);
  if (hoursRes.error) throwQueryError("getGlobalFinancialSummary:hours", hoursRes.error);

  const presupuestado = projectsRes.data
    ?.reduce((sum, p) => sum + (Number(p.total_budget) || 0), 0) ?? 0;

  const gastos = costsRes.data
    ?.filter((c) => c.tipo === "gasto")
    .reduce((sum, c) => sum + Number(c.importe), 0) ?? 0;

  const cobrado = costsRes.data
    ?.filter((c) => c.tipo === "ingreso")
    .reduce((sum, c) => sum + Number(c.importe), 0) ?? 0;

  const costeManoObra = hoursRes.data
    ?.reduce((sum, h) => sum + Number(h.coste_total), 0) ?? 0;

  const gastadoTotal = roundCurrency(gastos + costeManoObra);
  const beneficio = roundCurrency(cobrado - gastadoTotal);

  return {
    presupuestado: roundCurrency(presupuestado),
    gastado: gastadoTotal,
    cobrado: roundCurrency(cobrado),
    costeManoObra: roundCurrency(costeManoObra),
    beneficio,
  };
}
