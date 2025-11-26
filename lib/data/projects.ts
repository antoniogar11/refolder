import { createClient } from "@/lib/supabase/server";

export type Project = {
  id: string;
  client_id: string | null;
  name: string;
  description: string | null;
  status: "planning" | "in_progress" | "completed" | "cancelled";
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
};

export type ProjectWithClient = Project & {
  client?: {
    id: string;
    name: string;
  } | null;
};

/**
 * Obtiene todos los proyectos del usuario actual con sus clientes asociados
 * @returns Array de proyectos con información del cliente (si existe)
 * @remarks Esta función optimiza las queries evitando N+1 al obtener todos los clientes en una sola query
 */
export async function getProjects(): Promise<ProjectWithClient[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("Error getting user:", authError);
      return [];
    }

    if (!user) {
      console.log("No user found, returning empty array");
      return [];
    }

    console.log("Fetching projects for user:", user.id);

    // Primero intentar una consulta simple para ver si funciona
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching projects:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        fullError: JSON.stringify(error, null, 2),
      });
      
      // Si la tabla no existe, el código suele ser "42P01"
      if (error.code === "42P01" || error.message?.includes("does not exist")) {
        console.error("⚠️ La tabla 'projects' no existe. Por favor, ejecuta el script SQL: sql/create_projects_table.sql");
      }
      
      // Si es un error de permisos RLS
      if (error.code === "42501" || error.message?.includes("permission denied")) {
        console.error("⚠️ Error de permisos RLS. Verifica que las políticas de seguridad estén configuradas correctamente.");
      }
      
      return [];
    }

    // Si no hay datos, retornar array vacío
    if (!data) {
      console.log("No data returned from projects query");
      return [];
    }

    console.log(`Found ${data.length} projects`);

    // Obtener clientes por separado si hay proyectos con client_id
    const clientIds = data.filter((p: any) => p.client_id).map((p: any) => p.client_id);
    let clientsMap: Record<string, { id: string; name: string }> = {};

    if (clientIds.length > 0) {
      const { data: clientsData, error: clientsError } = await supabase
        .from("clients")
        .select("id, name")
        .in("id", clientIds)
        .eq("user_id", user.id);

      if (clientsError) {
        console.error("Error fetching clients:", clientsError);
      } else if (clientsData) {
        clientsMap = clientsData.reduce((acc: Record<string, { id: string; name: string }>, client) => {
          acc[client.id] = client;
          return acc;
        }, {});
      }
    }

    // Mapear los datos asegurándonos de que todos los campos estén presentes
    return data.map((project: any) => ({
      id: project.id,
      client_id: project.client_id || null,
      name: project.name || "",
      description: project.description || null,
      status: project.status || "planning",
      start_date: project.start_date || null,
      end_date: project.end_date || null,
      budget: project.budget ? parseFloat(project.budget) : null,
      address: project.address || null,
      notes: project.notes || null,
      created_at: project.created_at || new Date().toISOString(),
      updated_at: project.updated_at || null,
      client: project.client_id ? clientsMap[project.client_id] || null : null,
    }));
  } catch (err) {
    console.error("Unexpected error in getProjects:", err);
    return [];
  }
}

/**
 * Obtiene un proyecto por su ID con su cliente asociado
 * @param id - ID del proyecto
 * @returns Proyecto con información del cliente o null si no existe o no tiene permisos
 */
export async function getProjectById(id: string): Promise<ProjectWithClient | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("projects")
    .select(
      `
      id,
      client_id,
      name,
      description,
      status,
      start_date,
      end_date,
      budget,
      address,
      notes,
      created_at,
      updated_at
    `,
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("Error fetching project", error);
    return null;
  }

  if (!data) {
    return null;
  }

  // Obtener cliente si existe
  let client = null;
  if (data.client_id) {
    const { data: clientData } = await supabase
      .from("clients")
      .select("id, name")
      .eq("id", data.client_id)
      .eq("user_id", user.id)
      .single();

    if (clientData) {
      client = clientData;
    }
  }

  return {
    ...data,
    client,
  };
}

/**
 * Obtiene la lista de clientes para usar en selectores/dropdowns
 * @returns Array de clientes con id y name, ordenados alfabéticamente
 */
export async function getClientsForSelect() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("clients")
    .select("id, name")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching clients for select", error);
    return [];
  }

  return data ?? [];
}

