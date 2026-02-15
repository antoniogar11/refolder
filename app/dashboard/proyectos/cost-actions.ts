"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createCostAction(
  projectId: string,
  data: { descripcion: string; categoria: string; importe: string; fecha: string; notas: string; tipo?: string },
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "No estás autenticado." };

  const importe = parseFloat(data.importe);
  if (isNaN(importe) || importe <= 0) {
    return { success: false, message: "El importe debe ser un número positivo." };
  }

  const tipo = data.tipo === "ingreso" ? "ingreso" : "gasto";

  const { error } = await supabase.from("project_costs").insert({
    project_id: projectId,
    user_id: user.id,
    descripcion: data.descripcion,
    categoria: data.categoria,
    importe,
    fecha: data.fecha,
    notas: data.notas || null,
    tipo,
  });

  if (error) {
    console.error("Error creating cost", error);
    const label = tipo === "ingreso" ? "ingreso" : "gasto";
    return { success: false, message: `No se pudo guardar el ${label}: ${error.message}` };
  }

  revalidatePath(`/dashboard/proyectos/${projectId}`);
  const label = tipo === "ingreso" ? "Ingreso" : "Gasto";
  return { success: true, message: `${label} registrado correctamente.` };
}

export async function deleteCostAction(
  costId: string,
  projectId: string,
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "No estás autenticado." };

  const { error } = await supabase
    .from("project_costs")
    .delete()
    .eq("id", costId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting cost", error);
    return { success: false, message: `No se pudo eliminar el gasto: ${error.message}` };
  }

  revalidatePath(`/dashboard/proyectos/${projectId}`);
  return { success: true, message: "Gasto eliminado." };
}

export async function linkEstimateToProjectAction(
  projectId: string,
  estimateId: string,
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "No estás autenticado." };

  const { error } = await supabase
    .from("projects")
    .update({ estimate_id: estimateId, updated_at: new Date().toISOString() })
    .eq("id", projectId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error linking estimate", error);
    return { success: false, message: `No se pudo vincular: ${error.message}` };
  }

  revalidatePath(`/dashboard/proyectos/${projectId}`);
  return { success: true, message: "Presupuesto vinculado al proyecto." };
}
