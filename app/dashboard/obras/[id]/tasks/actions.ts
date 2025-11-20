"use server";

import { revalidatePath } from "next/cache";

import type { TaskFormState } from "@/lib/forms/task-form-state";
import { initialTaskFormState } from "@/lib/forms/task-form-state";
import { createClient } from "@/lib/supabase/server";

type TaskPayload = {
  title: string;
  description: string | null;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  due_date: string | null;
  assigned_to: string | null;
  estimated_hours: number | null;
  actual_hours: number | null;
  notes: string | null;
};

function validateTask(formData: FormData): { data?: TaskPayload; errors?: Record<string, string[]> } {
  const errors: Record<string, string[]> = {};

  const title = (formData.get("title") as string | null)?.trim() ?? "";
  const description = (formData.get("description") as string | null)?.trim() ?? "";
  const status = (formData.get("status") as string | null)?.trim() ?? "";
  const priority = (formData.get("priority") as string | null)?.trim() ?? "";
  const dueDate = (formData.get("due_date") as string | null)?.trim() ?? "";
  const assignedTo = (formData.get("assigned_to") as string | null)?.trim() ?? "";
  const estimatedHoursRaw = (formData.get("estimated_hours") as string | null)?.trim() ?? "";
  const actualHoursRaw = (formData.get("actual_hours") as string | null)?.trim() ?? "";
  const notes = (formData.get("notes") as string | null)?.trim() ?? "";

  if (!title) {
    errors.title = ["El título es obligatorio."];
  }

  if (status && !["pending", "in_progress", "completed", "cancelled"].includes(status)) {
    errors.status = ["Estado inválido."];
  }

  if (priority && !["low", "medium", "high", "urgent"].includes(priority)) {
    errors.priority = ["Prioridad inválida."];
  }

  let estimatedHours: number | null = null;
  if (estimatedHoursRaw) {
    const hours = parseFloat(estimatedHoursRaw);
    if (isNaN(hours) || hours < 0) {
      errors.estimated_hours = ["Las horas estimadas deben ser un número válido mayor o igual a 0."];
    } else {
      estimatedHours = hours;
    }
  }

  let actualHours: number | null = null;
  if (actualHoursRaw) {
    const hours = parseFloat(actualHoursRaw);
    if (isNaN(hours) || hours < 0) {
      errors.actual_hours = ["Las horas reales deben ser un número válido mayor o igual a 0."];
    } else {
      actualHours = hours;
    }
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  return {
    data: {
      title,
      description: description || null,
      status: (status as TaskPayload["status"]) || "pending",
      priority: (priority as TaskPayload["priority"]) || "medium",
      due_date: dueDate || null,
      assigned_to: assignedTo || null,
      estimated_hours: estimatedHours,
      actual_hours: actualHours,
      notes: notes || null,
    },
  };
}

export async function createTaskAction(
  projectId: string,
  _: TaskFormState,
  formData: FormData,
): Promise<TaskFormState> {
  const validation = validateTask(formData);

  if (validation.errors) {
    return {
      status: "error",
      message: "Revisa los campos.",
      errors: validation.errors,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      status: "error",
      message: "No estás autenticado. Por favor, inicia sesión.",
    };
  }

  // Verificar que el proyecto pertenece al usuario
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();

  if (projectError || !project) {
    return {
      status: "error",
      message: "No tienes permiso para agregar tareas a este proyecto.",
    };
  }

  const { error } = await supabase.from("tasks").insert({
    ...validation.data!,
    project_id: projectId,
    user_id: user.id,
  });

  if (error) {
    console.error("Error creating task", error);
    return {
      status: "error",
      message: `No se pudo crear la tarea: ${error.message}`,
    };
  }

  revalidatePath(`/dashboard/obras/${projectId}`);

  return {
    status: "success",
    message: "Tarea creada correctamente.",
  };
}

export async function updateTaskAction(
  taskId: string,
  projectId: string,
  _: TaskFormState,
  formData: FormData,
): Promise<TaskFormState> {
  const validation = validateTask(formData);

  if (validation.errors) {
    return {
      status: "error",
      message: "Revisa los campos.",
      errors: validation.errors,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      status: "error",
      message: "No estás autenticado. Por favor, inicia sesión.",
    };
  }

  const updateData: any = {
    ...validation.data!,
    updated_at: new Date().toISOString(),
  };

  // Si la tarea se marca como completada, agregar fecha de completado
  if (validation.data!.status === "completed") {
    updateData.completed_at = new Date().toISOString();
  } else {
    updateData.completed_at = null;
  }

  const { error } = await supabase
    .from("tasks")
    .update(updateData)
    .eq("id", taskId)
    .eq("user_id", user.id)
    .eq("project_id", projectId);

  if (error) {
    console.error("Error updating task", error);
    return {
      status: "error",
      message: `No se pudo actualizar la tarea: ${error.message}`,
    };
  }

  revalidatePath(`/dashboard/obras/${projectId}`);

  return {
    status: "success",
    message: "Tarea actualizada correctamente.",
  };
}

export async function deleteTaskAction(
  taskId: string,
  projectId: string,
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "No estás autenticado. Por favor, inicia sesión.",
    };
  }

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId)
    .eq("user_id", user.id)
    .eq("project_id", projectId);

  if (error) {
    console.error("Error deleting task", error);
    return {
      success: false,
      message: `No se pudo eliminar la tarea: ${error.message}`,
    };
  }

  revalidatePath(`/dashboard/obras/${projectId}`);

  return {
    success: true,
    message: "Tarea eliminada correctamente.",
  };
}

