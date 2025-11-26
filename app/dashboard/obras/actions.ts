"use server";

import { revalidatePath } from "next/cache";

import type { ProjectFormState } from "@/lib/forms/project-form-state";
import { initialProjectFormState } from "@/lib/forms/project-form-state";
import { createClient } from "@/lib/supabase/server";
import {
  isNotEmpty,
  isValidNumber,
  isDateAfter,
  isInList,
  getFormDataValue,
  getFormDataNumber,
} from "@/lib/utils/validation";
import { AppErrors, handleSupabaseError, createErrorResult } from "@/lib/utils/errors";

type ProjectPayload = {
  client_id: string | null;
  name: string;
  description: string | null;
  status: "planning" | "in_progress" | "completed" | "cancelled";
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  address: string | null;
  notes: string | null;
};

const VALID_STATUSES = ["planning", "in_progress", "completed", "cancelled"] as const;

/**
 * Valida los datos de un proyecto desde FormData
 * @param formData - FormData con los datos del proyecto
 * @returns Datos validados o errores de validación
 */
function validateProject(formData: FormData): { data?: ProjectPayload; errors?: Record<string, string[]> } {
  const errors: Record<string, string[]> = {};

  const name = getFormDataValue(formData, "name");
  const clientId = getFormDataValue(formData, "client_id");
  const description = getFormDataValue(formData, "description");
  const status = getFormDataValue(formData, "status");
  const startDate = getFormDataValue(formData, "start_date");
  const endDate = getFormDataValue(formData, "end_date");
  const budgetRaw = getFormDataValue(formData, "budget");
  const address = getFormDataValue(formData, "address");
  const notes = getFormDataValue(formData, "notes");

  if (!isNotEmpty(name)) {
    errors.name = ["El nombre es obligatorio."];
  }

  if (status && !isInList(status, VALID_STATUSES)) {
    errors.status = ["Estado inválido."];
  }

  let budget: number | null = null;
  if (budgetRaw) {
    if (!isValidNumber(budgetRaw, 0)) {
      errors.budget = ["El presupuesto debe ser un número válido mayor o igual a 0."];
    } else {
      budget = getFormDataNumber(formData, "budget", null);
    }
  }

  if (startDate && endDate && !isDateAfter(endDate, startDate)) {
    errors.end_date = ["La fecha de finalización debe ser posterior a la fecha de inicio."];
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  return {
    data: {
      client_id: clientId || null,
      name,
      description: description || null,
      status: (status as ProjectPayload["status"]) || "planning",
      start_date: startDate || null,
      end_date: endDate || null,
      budget,
      address: address || null,
      notes: notes || null,
    },
  };
}

export async function createProjectAction(_: ProjectFormState, formData: FormData): Promise<ProjectFormState> {
  const validation = validateProject(formData);

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

  // Preparar los datos para insertar, excluyendo campos que puedan no existir
  const insertData: any = {
    user_id: user.id,
    client_id: validation.data!.client_id,
    name: validation.data!.name,
    description: validation.data!.description,
    status: validation.data!.status,
    start_date: validation.data!.start_date,
    end_date: validation.data!.end_date,
    budget: validation.data!.budget,
    notes: validation.data!.notes,
  };

  // Agregar address si tiene valor (la columna debe existir en la BD)
  if (validation.data!.address) {
    insertData.address = validation.data!.address;
  }

  const { error } = await supabase.from("projects").insert(insertData);
  
  // Si el error es por columna faltante, dar un mensaje más claro
  if (error && error.message?.includes("address")) {
    return {
      status: "error",
      message: "La columna 'address' no existe en la tabla. Por favor, ejecuta el script SQL: sql/add_projects_address_column.sql",
    };
  }

  if (error) {
    console.error("Error creating project", error);
    const appError = handleSupabaseError(error);
    return createErrorResult(`No se pudo crear la obra: ${appError.message}`);
  }

  revalidatePath("/dashboard/obras");

  return {
    status: "success",
    message: "Obra creada correctamente.",
  };
}

export async function updateProjectAction(
  projectId: string,
  _: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  const validation = validateProject(formData);

  if (validation.errors) {
    return createErrorResult("Revisa los campos.", validation.errors);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return createErrorResult(AppErrors.UNAUTHORIZED.message);
  }

  // Preparar los datos para actualizar
  const updateData: any = {
    client_id: validation.data!.client_id,
    name: validation.data!.name,
    description: validation.data!.description,
    status: validation.data!.status,
    start_date: validation.data!.start_date,
    end_date: validation.data!.end_date,
    budget: validation.data!.budget,
    notes: validation.data!.notes,
    updated_at: new Date().toISOString(),
  };

  // Solo agregar address si la columna existe
  if (validation.data!.address !== undefined) {
    updateData.address = validation.data!.address;
  }

  const { error } = await supabase
    .from("projects")
    .update(updateData)
    .eq("id", projectId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error updating project", error);
    const appError = handleSupabaseError(error);
    return createErrorResult(`No se pudo actualizar la obra: ${appError.message}`);
  }

  revalidatePath("/dashboard/obras");
  revalidatePath(`/dashboard/obras/${projectId}`);

  return {
    status: "success",
    message: "Obra actualizada correctamente.",
  };
}

export async function deleteProjectAction(projectId: string): Promise<{ success: boolean; message: string }> {
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

  const { error } = await supabase.from("projects").delete().eq("id", projectId).eq("user_id", user.id);

  if (error) {
    console.error("Error deleting project", error);
    return {
      success: false,
      message: `No se pudo eliminar la obra: ${error.message}`,
    };
  }

  revalidatePath("/dashboard/obras");

  return {
    success: true,
    message: "Obra eliminada correctamente.",
  };
}

