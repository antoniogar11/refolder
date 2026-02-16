"use server";

import { revalidatePath } from "next/cache";

import type { FormState } from "@/lib/forms/form-state";
import { zodErrorsToFormState } from "@/lib/forms/form-state";
import { parseFormData } from "@/lib/forms/parse";
import { createClient } from "@/lib/supabase/server";
import { projectSchema } from "@/lib/validations/project";

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
    return { status: "error", message: `No se pudo crear el proyecto: ${error.message}` };
  }

  revalidatePath("/dashboard/proyectos");
  return { status: "success", message: "Proyecto creado correctamente." };
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
    return { status: "error", message: `No se pudo actualizar el proyecto: ${error.message}` };
  }

  revalidatePath("/dashboard/proyectos");
  revalidatePath(`/dashboard/proyectos/${projectId}`);
  return { status: "success", message: "Proyecto actualizado correctamente." };
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
    return { success: false, message: `No se pudo eliminar el proyecto: ${error.message}` };
  }

  revalidatePath("/dashboard/proyectos");
  return { success: true, message: "Proyecto eliminado correctamente." };
}
