"use server";

import { revalidatePath } from "next/cache";

import type { FormState } from "@/lib/forms/form-state";
import { zodErrorsToFormState } from "@/lib/forms/form-state";
import { createClient } from "@/lib/supabase/server";
import { projectSchema } from "@/lib/validations/project";

function parseFormData(formData: FormData): Record<string, string> {
  const result: Record<string, string> = {};
  formData.forEach((value, key) => {
    result[key] = typeof value === "string" ? value.trim() : "";
  });
  return result;
}

export async function createProjectAction(
  _: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = projectSchema.safeParse(parseFormData(formData));

  if (!parsed.success) {
    return zodErrorsToFormState(parsed.error.issues);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "No estás autenticado." };
  }

  const { error } = await supabase.from("projects").insert({
    ...parsed.data,
    user_id: user.id,
  });

  if (error) {
    console.error("Error creating project", error);
    return { status: "error", message: `No se pudo crear la obra: ${error.message}` };
  }

  revalidatePath("/dashboard/obras");
  return { status: "success", message: "Obra creada correctamente." };
}

export async function updateProjectAction(
  projectId: string,
  _: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = projectSchema.safeParse(parseFormData(formData));

  if (!parsed.success) {
    return zodErrorsToFormState(parsed.error.issues);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "No estás autenticado." };
  }

  const { error } = await supabase
    .from("projects")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", projectId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error updating project", error);
    return { status: "error", message: `No se pudo actualizar la obra: ${error.message}` };
  }

  revalidatePath("/dashboard/obras");
  revalidatePath(`/dashboard/obras/${projectId}`);
  return { status: "success", message: "Obra actualizada correctamente." };
}

export async function deleteProjectAction(
  projectId: string,
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "No estás autenticado." };
  }

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting project", error);
    return { success: false, message: `No se pudo eliminar la obra: ${error.message}` };
  }

  revalidatePath("/dashboard/obras");
  return { success: true, message: "Obra eliminada correctamente." };
}
