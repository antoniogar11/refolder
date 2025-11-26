import { createClient } from "@/lib/supabase/server";

export type Company = {
  id: string;
  name: string;
  owner_id: string;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  postal_code?: string | null;
  phone?: string | null;
  email?: string | null;
  tax_id?: string | null; // CIF o NIF
  logo_url?: string | null;
  created_at: string;
  updated_at: string | null;
};

export type CompanyMember = {
  id: string;
  company_id: string;
  user_id: string;
  role: "admin" | "worker";
  permissions: Record<string, boolean>;
  created_at: string;
  updated_at: string | null;
};

export type CompanyMemberWithUser = CompanyMember & {
  user: {
    id: string;
    email: string;
    name?: string;
  };
};

/**
 * Obtiene la empresa del usuario actual
 * @returns La empresa del usuario (como dueño o miembro) o null si no tiene empresa
 * @remarks Verifica primero si el usuario es dueño, luego si es miembro
 */
export async function getUserCompany(): Promise<Company | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Primero verificar si es dueño de una empresa
  const { data: ownedCompany, error: ownedError } = await supabase
    .from("companies")
    .select("*")
    .eq("owner_id", user.id)
    .single();

  if (ownedCompany && !ownedError) {
    return ownedCompany;
  }

  // Si no es dueño, verificar si es miembro
  const { data: memberCompany, error: memberError } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", user.id)
    .single();

  if (memberCompany && !memberError) {
    const { data: company, error } = await supabase
      .from("companies")
      .select("*")
      .eq("id", memberCompany.company_id)
      .single();

    if (company && !error) {
      return company;
    }
  }

  return null;
}

/**
 * Crea una nueva empresa para el usuario actual
 * @param name - Nombre de la empresa
 * @returns Objeto con la empresa creada o error si falla
 * @throws Si el usuario ya tiene una empresa o no está autenticado
 */
export async function createCompany(name: string): Promise<{ company: Company | null; error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { company: null, error: "Usuario no autenticado" };
  }

  // Verificar si ya tiene una empresa
  const existingCompany = await getUserCompany();
  if (existingCompany) {
    return { company: null, error: "Ya tienes una empresa" };
  }

  const { data: company, error } = await supabase
    .from("companies")
    .insert({
      name,
      owner_id: user.id,
    })
    .select()
    .single();

  if (error) {
    return { company: null, error: error.message };
  }

  return { company, error: null };
}

/**
 * Verifica si el usuario actual es administrador de su empresa
 * @returns true si es dueño o tiene rol de admin, false en caso contrario
 */
export async function isCompanyAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const company = await getUserCompany();
  if (!company) {
    return false;
  }

  // Es dueño
  if (company.owner_id === user.id) {
    return true;
  }

  // Es admin miembro
  const { data: member } = await supabase
    .from("company_members")
    .select("role")
    .eq("company_id", company.id)
    .eq("user_id", user.id)
    .eq("role", "admin")
    .single();

  return !!member;
}

/**
 * Obtiene el miembro actual y sus permisos
 */
export async function getCurrentMember(): Promise<CompanyMember | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const company = await getUserCompany();
  if (!company) {
    return null;
  }

  // Es dueño - tiene todos los permisos
  if (company.owner_id === user.id) {
    return {
      id: company.owner_id,
      company_id: company.id,
      user_id: company.owner_id,
      role: "admin",
      permissions: {}, // Los dueños tienen todos los permisos implícitamente
      created_at: company.created_at,
      updated_at: company.updated_at,
    };
  }

  // Buscar miembro
  const { data: member } = await supabase
    .from("company_members")
    .select("*")
    .eq("company_id", company.id)
    .eq("user_id", user.id)
    .single();

  if (!member) {
    return null;
  }

  return {
    ...member,
    permissions: (member.permissions as Record<string, boolean>) || {},
  };
}

/**
 * Verifica si el usuario actual tiene un permiso específico
 * @param permission - Permiso a verificar (ej: "projects:read", "clients:write")
 * @returns true si tiene el permiso, false en caso contrario
 * @remarks Los admins y dueños tienen todos los permisos implícitamente
 */
export async function hasWorkerPermission(permission: string): Promise<boolean> {
  const member = await getCurrentMember();
  
  if (!member) {
    return false;
  }

  // Los admins y dueños tienen todos los permisos
  if (member.role === "admin") {
    return true;
  }

  // Verificar permiso específico del trabajador
  return member.permissions[permission] === true;
}

/**
 * Obtiene todos los trabajadores de la empresa (dueño + miembros) con sus datos
 */
export async function getCompanyWorkers(): Promise<CompanyMemberWithUser[]> {
  const supabase = await createClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();
  
  const company = await getUserCompany();

  if (!company || !currentUser) {
    return [];
  }

  const workers: CompanyMemberWithUser[] = [];

  // 1. Añadir el dueño (si existe)
  if (company.owner_id) {
    // Obtener datos del dueño desde auth.users usando función RPC
    const ownerResult = await supabase.rpc('get_user_data', {
      user_uuid: company.owner_id
    }).single();
    
    const ownerData = ownerResult.data as { id: string; email: string; name: string | null; full_name: string | null } | null;

    workers.push({
      id: company.owner_id,
      company_id: company.id,
      user_id: company.owner_id,
      role: "admin" as const, // El dueño es admin
      permissions: {},
      created_at: company.created_at,
      updated_at: company.updated_at,
      user: {
        id: company.owner_id,
        email: ownerData?.email || company.owner_id,
        name: ownerData?.name || ownerData?.full_name || ownerData?.email?.split('@')[0] || undefined,
      },
    });
  }

  // 2. Añadir miembros (excluyendo al dueño si aparece como miembro)
  const { data: members, error } = await supabase
    .from("company_members")
    .select("*")
    .eq("company_id", company.id)
    .neq("user_id", company.owner_id); // Excluir al dueño si está duplicado

  if (!error && members) {
    const membersWithUsers = await Promise.all(
      members.map(async (member) => {
        // Obtener datos del miembro desde auth.users usando función RPC
        const memberResult = await supabase.rpc('get_user_data', {
          user_uuid: member.user_id
        }).single();
        
        const memberData = memberResult.data as { id: string; email: string; name: string | null; full_name: string | null } | null;

        return {
          ...member,
          permissions: (member.permissions as Record<string, boolean>) || {},
          user: {
            id: member.user_id,
            email: memberData?.email || member.user_id,
            name: memberData?.name || memberData?.full_name || memberData?.email?.split('@')[0] || undefined,
          },
        };
      })
    );

    workers.push(...membersWithUsers);
  }

  return workers;
}

/**
 * Obtiene todos los miembros de la empresa del usuario (solo miembros, no el dueño)
 * @deprecated Usar getCompanyWorkers() en su lugar
 */
export async function getCompanyMembers(): Promise<CompanyMemberWithUser[]> {
  const supabase = await createClient();
  const company = await getUserCompany();

  if (!company) {
    return [];
  }

  const { data: members, error } = await supabase
    .from("company_members")
    .select("*")
    .eq("company_id", company.id);

  if (error || !members) {
    return [];
  }

  // Obtener información de usuarios
  const membersWithUsers = await Promise.all(
    members.map(async (member) => {
      // Obtener email del usuario desde auth.users (requiere función RPC o metadata)
      const memberResult = await supabase.rpc('get_user_data', {
        user_uuid: member.user_id
      }).single();
      
      const memberData = memberResult.data as { id: string; email: string; name: string | null; full_name: string | null } | null;

      return {
        ...member,
        permissions: (member.permissions as Record<string, boolean>) || {},
        user: {
          id: member.user_id,
          email: memberData?.email || member.user_id,
          name: memberData?.name || memberData?.full_name || memberData?.email?.split('@')[0] || undefined,
        },
      };
    })
  );

  return membersWithUsers;
}
