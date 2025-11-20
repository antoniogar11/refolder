"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole, type UserRole } from "@/lib/auth/require-role";
import { getAvailableRoles } from "@/lib/auth/roles";

/**
 * Asigna o actualiza el rol de un usuario
 */
export async function updateUserRoleAction(
  userId: string,
  _prevState: { status: "idle" | "success" | "error"; message?: string },
  formData: FormData
) {
  // Verificar que el usuario actual es admin
  await requireRole(["admin"]);

  const role = formData.get("role") as UserRole;
  const supabase = await createClient();

  // Verificar que el rol es válido
  const availableRoles = getAvailableRoles();
  if (!role || !availableRoles.includes(role)) {
    return {
      status: "error" as const,
      message: "Rol inválido",
    };
  }

  // Insertar o actualizar el rol
  const { error } = await supabase
    .from("user_roles")
    .upsert(
      {
        user_id: userId,
        role: role,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      }
    );

  if (error) {
    console.error("Error updating user role:", error);
    return {
      status: "error" as const,
      message: error.message || "Error al actualizar el rol",
    };
  }

  revalidatePath("/dashboard/admin/roles");
  return {
    status: "success" as const,
    message: "Rol actualizado correctamente",
  };
}

/**
 * Asigna un rol por defecto a un nuevo usuario
 */
export async function assignDefaultRole(userId: string) {
  const supabase = await createClient();

  // Verificar si ya tiene un rol asignado
  const { data: existingRole } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .single();

  if (existingRole) {
    return; // Ya tiene un rol
  }

  // Asignar rol 'user' por defecto
  const { error } = await supabase.from("user_roles").insert({
    user_id: userId,
    role: "user",
  });

  if (error) {
    console.error("Error assigning default role:", error);
  }
}

