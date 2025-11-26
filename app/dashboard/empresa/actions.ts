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
    permissions[key] = value === "true" || value === "on" || value === "1";
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

/**
 * Actualiza los datos de la empresa
 */
export async function updateCompanyAction(
  _prevState: { status: "idle" | "success" | "error"; message?: string; errors?: Record<string, string[]> },
  formData: FormData
): Promise<{ status: "idle" | "success" | "error"; message?: string; errors?: Record<string, string[]> }> {
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
      message: "No tienes permisos para actualizar los datos de la empresa",
    };
  }

  const companyId = formData.get("companyId") as string;
  if (!companyId) {
    return {
      status: "error" as const,
      message: "ID de empresa no proporcionado",
    };
  }

  // Verificar que la empresa pertenece al usuario
  const company = await getUserCompany();
  if (!company || company.id !== companyId) {
    return {
      status: "error" as const,
      message: "No tienes permisos para actualizar esta empresa",
    };
  }

  const errors: Record<string, string[]> = {};

  const name = (formData.get("name") as string | null)?.trim() ?? "";
  if (!name) {
    errors.name = ["El nombre de la empresa es obligatorio."];
  }

  const email = (formData.get("email") as string | null)?.trim() ?? "";
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = ["Formato de email inválido."];
  }

  if (Object.keys(errors).length > 0) {
    return {
      status: "error" as const,
      message: "Revisa el formulario.",
      errors,
    };
  }

  // Preparar datos para actualizar
  const updateData: {
    name: string;
    address?: string | null;
    city?: string | null;
    province?: string | null;
    postal_code?: string | null;
    phone?: string | null;
    email?: string | null;
    tax_id?: string | null;
    logo_url?: string | null;
    updated_at: string;
  } = {
    name,
    address: (formData.get("address") as string | null)?.trim() || null,
    city: (formData.get("city") as string | null)?.trim() || null,
    province: (formData.get("province") as string | null)?.trim() || null,
    postal_code: (formData.get("postal_code") as string | null)?.trim() || null,
    phone: (formData.get("phone") as string | null)?.trim() || null,
    email: email || null,
    tax_id: (formData.get("tax_id") as string | null)?.trim() || null,
    logo_url: (formData.get("logo_url") as string | null)?.trim() || null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("companies")
    .update(updateData)
    .eq("id", companyId);

  if (error) {
    console.error("Error updating company:", error);
    return {
      status: "error" as const,
      message: error.message || "Error al actualizar los datos de la empresa",
    };
  }

  revalidatePath("/dashboard/empresa");
  return {
    status: "success" as const,
    message: "Datos de la empresa actualizados correctamente",
  };
}
