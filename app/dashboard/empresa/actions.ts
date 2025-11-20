"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isCompanyAdmin, getUserCompany } from "@/lib/data/companies";

/**
 * Añade un miembro a la empresa
 */
export async function addCompanyMemberAction(
  companyId: string,
  _prevState: { status: "idle" | "success" | "error"; message?: string },
  formData: FormData
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      status: "error" as const,
      message: "Usuario no autenticado",
    };
  }

  const admin = await isCompanyAdmin();
  if (!admin) {
    return {
      status: "error" as const,
      message: "No tienes permisos para añadir miembros",
    };
  }

  const email = formData.get("email") as string;
  const role = formData.get("role") as "admin" | "worker";

  if (!email || !role) {
    return {
      status: "error" as const,
      message: "Email y rol son requeridos",
    };
  }

  // Buscar usuario por email
  let userId: string | null = null;
  try {
    const adminClient = createAdminClient();
    const { data: existingUsers } = await adminClient.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );
    if (existingUser) {
      userId = existingUser.id;
    }
  } catch (error) {
    console.warn("No se pudo buscar usuario por email:", error);
  }

  // Verificar si ya existe un miembro con ese email o user_id
  if (email) {
    const { data: existingMember } = await supabase
      .from("company_members")
      .select("id")
      .eq("company_id", companyId)
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (existingMember) {
      return {
        status: "error" as const,
        message: "Ya existe un miembro con ese email en esta empresa",
      };
    }
  }

  // Crear el miembro
  const memberData: {
    company_id: string;
    user_id?: string | null;
    role: "admin" | "worker";
    email: string;
    permissions: Record<string, boolean>;
    created_at: string;
    updated_at: string;
  } = {
    company_id: companyId,
    role,
    email: email.toLowerCase(),
    permissions: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (userId) {
    memberData.user_id = userId;
  }

  const { error } = await supabase.from("company_members").insert(memberData);

  if (error) {
    console.error("Error adding company member:", error);
    return {
      status: "error" as const,
      message: error.message || "Error al añadir miembro",
    };
  }

  revalidatePath("/dashboard/empresa");
  return {
    status: "success" as const,
    message: `Miembro añadido correctamente${userId ? "" : ". Se ha enviado una invitación por email."}`,
  };
}

/**
 * Actualiza los permisos de un trabajador
 */
export async function updateWorkerPermissionsAction(
  companyId: string,
  userId: string,
  _prevState: { status: "idle" | "success" | "error"; message?: string },
  formData: FormData
): Promise<{ status: "idle" | "success" | "error"; message?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      status: "error" as const,
      message: "Usuario no autenticado",
    };
  }

  const admin = await isCompanyAdmin();
  if (!admin) {
    return {
      status: "error" as const,
      message: "No tienes permisos para actualizar permisos",
    };
  }

  // Recopilar permisos del formulario
  const permissions: Record<string, boolean> = {};
  const permissionKeys = [
    "projects:read",
    "projects:write",
    "projects:delete",
    "clients:read",
    "clients:write",
    "clients:delete",
    "finances:read",
    "finances:write",
    "finances:delete",
    "tasks:read",
    "tasks:write",
    "tasks:delete",
    "time-tracking:read",
    "time-tracking:write",
    "time-tracking:delete",
    "estimates:read",
    "estimates:write",
    "estimates:delete",
  ];

  permissionKeys.forEach((key) => {
    const value = formData.get(`permission_${key}`);
    // El valor puede ser "true" (string), "on" (checkbox marcado), o null/undefined (no presente)
    permissions[key] = value === "true" || value === "on" || value === true;
  });

  // Obtener el miembro para asegurar que pertenece a la empresa
  const { data: member, error: memberFetchError } = await supabase
    .from("company_members")
    .select("id, user_id")
    .eq("id", userId)
    .eq("company_id", companyId)
    .single();

  if (memberFetchError || !member) {
    // Si no encuentra por id, intentar por user_id
    const { data: memberByUserId } = await supabase
      .from("company_members")
      .select("id, user_id")
      .eq("user_id", userId)
      .eq("company_id", companyId)
      .single();

    if (memberByUserId) {
      const { error } = await supabase
        .from("company_members")
        .update({ permissions, updated_at: new Date().toISOString() })
        .eq("id", memberByUserId.id);

      if (error) {
        console.error("Error updating worker permissions:", error);
        return {
          status: "error" as const,
          message: error.message || "Error al actualizar permisos",
        };
      }

      revalidatePath("/dashboard/empresa");
      return {
        status: "success" as const,
        message: "Permisos actualizados correctamente",
      };
    }

    return {
      status: "error" as const,
      message: "Miembro no encontrado o no pertenece a tu empresa",
    };
  }

  const { error } = await supabase
    .from("company_members")
    .update({ permissions, updated_at: new Date().toISOString() })
    .eq("id", member.id);

  if (error) {
    console.error("Error updating worker permissions:", error);
    return {
      status: "error" as const,
      message: error.message || "Error al actualizar permisos",
    };
  }

  revalidatePath("/dashboard/empresa");
  return {
    status: "success" as const,
    message: "Permisos actualizados correctamente",
  };
}
