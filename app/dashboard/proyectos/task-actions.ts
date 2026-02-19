"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createTaskAction(
  projectId: string,
  data: {
    nombre: string;
    descripcion: string;
  },
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "No estás autenticado." };

  if (!data.nombre.trim()) {
    return { success: false, message: "El nombre de la tarea es obligatorio." };
  }

  // Obtener el último orden
  const { data: lastTask } = await supabase
    .from("project_tasks")
    .select("orden")
    .eq("project_id", projectId)
    .eq("user_id", user.id)
    .order("orden", { ascending: false })
    .limit(1)
    .single();

  const nextOrden = (lastTask?.orden ?? -1) + 1;

  const { error } = await supabase.from("project_tasks").insert({
    project_id: projectId,
    user_id: user.id,
    nombre: data.nombre.trim(),
    descripcion: data.descripcion.trim() || null,
    orden: nextOrden,
  });

  if (error) {
    console.error("Error creating task", error);
    return { success: false, message: `No se pudo crear la tarea: ${error.message}` };
  }

  revalidatePath(`/dashboard/proyectos/${projectId}`);
  return { success: true, message: "Tarea creada correctamente." };
}

export async function updateTaskStatusAction(
  taskId: string,
  estado: string,
  projectId: string,
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "No estás autenticado." };

  const validStates = ["pendiente", "en_progreso", "completada"];
  if (!validStates.includes(estado)) {
    return { success: false, message: "Estado no válido." };
  }

  const { error } = await supabase
    .from("project_tasks")
    .update({ estado })
    .eq("id", taskId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error updating task status", error);
    return { success: false, message: `No se pudo actualizar: ${error.message}` };
  }

  revalidatePath(`/dashboard/proyectos/${projectId}`);
  return { success: true, message: "Estado actualizado." };
}

export async function deleteTaskAction(
  taskId: string,
  projectId: string,
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "No estás autenticado." };

  const { error } = await supabase
    .from("project_tasks")
    .delete()
    .eq("id", taskId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting task", error);
    return { success: false, message: `No se pudo eliminar: ${error.message}` };
  }

  revalidatePath(`/dashboard/proyectos/${projectId}`);
  return { success: true, message: "Tarea eliminada." };
}
