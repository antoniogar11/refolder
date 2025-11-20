import { createClient } from "@/lib/supabase/server";

export type EstimateStatus = "draft" | "sent" | "accepted" | "rejected" | "expired";

export type Estimate = {
  id: string;
  user_id: string;
  client_id: string | null;
  project_id: string | null;
  estimate_number: string;
  title: string;
  description: string | null;
  issue_date: string;
  validity_date: string | null;
  status: EstimateStatus;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  notes: string | null;
  terms: string | null;
  created_at: string;
  updated_at: string | null;
};

export type EstimateItem = {
  id: string;
  estimate_id: string;
  line_number: number;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  subtotal: number;
  tax_amount: number;
  total: number;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
};

export type EstimateWithRelations = Estimate & {
  client?: {
    id: string;
    name: string;
    email: string | null;
  } | null;
  project?: {
    id: string;
    name: string;
  } | null;
  items?: EstimateItem[];
};

/**
 * Obtiene todos los presupuestos del usuario
 */
export async function getEstimates(): Promise<EstimateWithRelations[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from("estimates")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching estimates:", error);
      return [];
    }

    if (!data) {
      return [];
    }

    // Obtener clientes y proyectos relacionados
    const clientIds = data.filter((e: any) => e.client_id).map((e: any) => e.client_id);
    const projectIds = data.filter((e: any) => e.project_id).map((e: any) => e.project_id);

    let clientsMap: Record<string, { id: string; name: string; email: string | null }> = {};
    let projectsMap: Record<string, { id: string; name: string }> = {};

    if (clientIds.length > 0) {
      const { data: clientsData } = await supabase
        .from("clients")
        .select("id, name, email")
        .in("id", clientIds)
        .eq("user_id", user.id);

      if (clientsData) {
        clientsMap = clientsData.reduce((acc: Record<string, { id: string; name: string; email: string | null }>, client) => {
          acc[client.id] = client;
          return acc;
        }, {});
      }
    }

    if (projectIds.length > 0) {
      const { data: projectsData } = await supabase
        .from("projects")
        .select("id, name")
        .in("id", projectIds)
        .eq("user_id", user.id);

      if (projectsData) {
        projectsMap = projectsData.reduce((acc: Record<string, { id: string; name: string }>, project) => {
          acc[project.id] = project;
          return acc;
        }, {});
      }
    }

    return data.map((estimate: any) => ({
      id: estimate.id,
      user_id: estimate.user_id,
      client_id: estimate.client_id || null,
      project_id: estimate.project_id || null,
      estimate_number: estimate.estimate_number,
      title: estimate.title,
      description: estimate.description || null,
      issue_date: estimate.issue_date,
      validity_date: estimate.validity_date || null,
      status: estimate.status as EstimateStatus,
      subtotal: parseFloat(estimate.subtotal || 0),
      tax_rate: parseFloat(estimate.tax_rate || 21),
      tax_amount: parseFloat(estimate.tax_amount || 0),
      total: parseFloat(estimate.total || 0),
      notes: estimate.notes || null,
      terms: estimate.terms || null,
      created_at: estimate.created_at,
      updated_at: estimate.updated_at || null,
      client: estimate.client_id ? clientsMap[estimate.client_id] || null : null,
      project: estimate.project_id ? projectsMap[estimate.project_id] || null : null,
      items: [],
    }));
  } catch (err) {
    console.error("Unexpected error in getEstimates:", err);
    return [];
  }
}

/**
 * Obtiene un presupuesto por ID con sus items
 */
export async function getEstimateById(id: string): Promise<EstimateWithRelations | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const { data: estimate, error: estimateError } = await supabase
      .from("estimates")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (estimateError || !estimate) {
      return null;
    }

    // Obtener items del presupuesto
    const { data: items, error: itemsError } = await supabase
      .from("estimate_items")
      .select("*")
      .eq("estimate_id", id)
      .order("line_number", { ascending: true });

    if (itemsError) {
      console.error("Error fetching estimate items:", itemsError);
    }

    // Obtener cliente y proyecto
    let client = null;
    let project = null;

    if (estimate.client_id) {
      const { data: clientData } = await supabase
        .from("clients")
        .select("id, name, email")
        .eq("id", estimate.client_id)
        .eq("user_id", user.id)
        .single();

      if (clientData) {
        client = clientData;
      }
    }

    if (estimate.project_id) {
      const { data: projectData } = await supabase
        .from("projects")
        .select("id, name")
        .eq("id", estimate.project_id)
        .eq("user_id", user.id)
        .single();

      if (projectData) {
        project = projectData;
      }
    }

    return {
      id: estimate.id,
      user_id: estimate.user_id,
      client_id: estimate.client_id || null,
      project_id: estimate.project_id || null,
      estimate_number: estimate.estimate_number,
      title: estimate.title,
      description: estimate.description || null,
      issue_date: estimate.issue_date,
      validity_date: estimate.validity_date || null,
      status: estimate.status as EstimateStatus,
      subtotal: parseFloat(estimate.subtotal || 0),
      tax_rate: parseFloat(estimate.tax_rate || 21),
      tax_amount: parseFloat(estimate.tax_amount || 0),
      total: parseFloat(estimate.total || 0),
      notes: estimate.notes || null,
      terms: estimate.terms || null,
      created_at: estimate.created_at,
      updated_at: estimate.updated_at || null,
      client,
      project,
      items: (items || []).map((item: any) => ({
        id: item.id,
        estimate_id: item.estimate_id,
        line_number: item.line_number,
        description: item.description,
        quantity: parseFloat(item.quantity || 1),
        unit_price: parseFloat(item.unit_price || 0),
        tax_rate: parseFloat(item.tax_rate || 21),
        subtotal: parseFloat(item.subtotal || 0),
        tax_amount: parseFloat(item.tax_amount || 0),
        total: parseFloat(item.total || 0),
        notes: item.notes || null,
        created_at: item.created_at,
        updated_at: item.updated_at || null,
      })),
    };
  } catch (err) {
    console.error("Unexpected error in getEstimateById:", err);
    return null;
  }
}

/**
 * Obtiene presupuestos por proyecto
 */
export async function getEstimatesByProjectId(projectId: string): Promise<EstimateWithRelations[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from("estimates")
      .select("*")
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error || !data) {
      return [];
    }

    // Obtener cliente si existe
    const clientIds = data.filter((e: any) => e.client_id).map((e: any) => e.client_id);
    let clientsMap: Record<string, { id: string; name: string; email: string | null }> = {};

    if (clientIds.length > 0) {
      const { data: clientsData } = await supabase
        .from("clients")
        .select("id, name, email")
        .in("id", clientIds)
        .eq("user_id", user.id);

      if (clientsData) {
        clientsMap = clientsData.reduce((acc: Record<string, { id: string; name: string; email: string | null }>, client) => {
          acc[client.id] = client;
          return acc;
        }, {});
      }
    }

    return data.map((estimate: any) => ({
      id: estimate.id,
      user_id: estimate.user_id,
      client_id: estimate.client_id || null,
      project_id: estimate.project_id || null,
      estimate_number: estimate.estimate_number,
      title: estimate.title,
      description: estimate.description || null,
      issue_date: estimate.issue_date,
      validity_date: estimate.validity_date || null,
      status: estimate.status as EstimateStatus,
      subtotal: parseFloat(estimate.subtotal || 0),
      tax_rate: parseFloat(estimate.tax_rate || 21),
      tax_amount: parseFloat(estimate.tax_amount || 0),
      total: parseFloat(estimate.total || 0),
      notes: estimate.notes || null,
      terms: estimate.terms || null,
      created_at: estimate.created_at,
      updated_at: estimate.updated_at || null,
      client: estimate.client_id ? clientsMap[estimate.client_id] || null : null,
      project: { id: projectId, name: "" }, // Ya sabemos el proyecto
      items: [],
    }));
  } catch (err) {
    console.error("Unexpected error in getEstimatesByProjectId:", err);
    return [];
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(amount);
}

