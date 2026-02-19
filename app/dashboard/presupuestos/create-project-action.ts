"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createProjectFromEstimateAction(
  estimateId: string,
): Promise<{ success: boolean; message: string; projectId?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "No estás autenticado." };

  // 1. Leer presupuesto con cliente
  const { data: estimate, error: estError } = await supabase
    .from("estimates")
    .select("*, client:clients!estimates_client_id_fkey(id, name, address)")
    .eq("id", estimateId)
    .eq("user_id", user.id)
    .single();

  if (estError || !estimate) {
    console.error("Error fetching estimate", estError);
    return { success: false, message: "No se encontró el presupuesto." };
  }

  if (estimate.project_id) {
    return { success: false, message: "Este presupuesto ya tiene un proyecto vinculado." };
  }

  // 2. Leer partidas del presupuesto
  const { data: items, error: itemsError } = await supabase
    .from("estimate_items")
    .select("categoria, descripcion, orden")
    .eq("estimate_id", estimateId)
    .order("orden", { ascending: true });

  if (itemsError) {
    console.error("Error fetching estimate items", itemsError);
    return { success: false, message: "Error al leer las partidas del presupuesto." };
  }

  // 3. Crear proyecto
  const address = estimate.client?.address || "Sin dirección";
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      client_id: estimate.client_id,
      name: estimate.name,
      description: estimate.description,
      address,
      status: "planning",
      total_budget: estimate.total_amount,
      estimate_id: estimateId,
    })
    .select("id")
    .single();

  if (projectError || !project) {
    console.error("Error creating project", projectError);
    return { success: false, message: `No se pudo crear el proyecto: ${projectError?.message}` };
  }

  // 4. Crear tareas a partir de partidas
  if (items && items.length > 0) {
    const tasks = items.map((item, index) => ({
      project_id: project.id,
      user_id: user.id,
      nombre: item.categoria !== "General"
        ? `${item.categoria}: ${item.descripcion}`
        : item.descripcion,
      descripcion: null,
      estado: "pendiente",
      orden: item.orden ?? index,
    }));

    const { error: tasksError } = await supabase
      .from("project_tasks")
      .insert(tasks);

    if (tasksError) {
      console.error("Error creating tasks from estimate items", tasksError);
      // No revertimos la creación del proyecto, las tareas se pueden añadir manualmente
    }
  }

  // 5. Vincular presupuesto al proyecto
  await supabase
    .from("estimates")
    .update({ project_id: project.id, updated_at: new Date().toISOString() })
    .eq("id", estimateId)
    .eq("user_id", user.id);

  revalidatePath("/dashboard/presupuestos");
  revalidatePath(`/dashboard/presupuestos/${estimateId}`);
  revalidatePath("/dashboard/proyectos");
  revalidatePath(`/dashboard/proyectos/${project.id}`);

  return { success: true, message: "Proyecto creado con tareas desde el presupuesto.", projectId: project.id };
}
