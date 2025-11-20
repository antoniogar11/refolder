import { createClient } from "@/lib/supabase/server";

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled" | "partial";

export type Invoice = {
  id: string;
  user_id: string;
  company_id: string | null;
  client_id: string | null;
  project_id: string | null;
  estimate_id: string | null;
  invoice_number: string;
  series: string;
  title: string;
  description: string | null;
  issue_date: string;
  due_date: string | null;
  status: InvoiceStatus;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  paid_amount: number;
  payment_date: string | null;
  payment_method: string | null;
  notes: string | null;
  terms: string | null;
  created_at: string;
  updated_at: string | null;
};

export type InvoiceItem = {
  id: string;
  invoice_id: string;
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

export type InvoiceWithRelations = Invoice & {
  client?: {
    id: string;
    name: string;
    email: string | null;
  } | null;
  project?: {
    id: string;
    name: string;
  } | null;
  estimate?: {
    id: string;
    estimate_number: string;
    title: string;
  } | null;
  items?: InvoiceItem[];
};

/**
 * Obtiene todas las facturas del usuario actual
 */
export async function getInvoices(): Promise<InvoiceWithRelations[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  try {
    // Obtener todas las facturas del usuario o de su empresa
    const { data: invoices, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("user_id", user.id)
      .order("issue_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching invoices:", error);
      return [];
    }

    if (!invoices || invoices.length === 0) {
      return [];
    }

    // Obtener clientes y proyectos únicos
    const clientIds = [...new Set(invoices.map((inv) => inv.client_id).filter(Boolean))];
    const projectIds = [...new Set(invoices.map((inv) => inv.project_id).filter(Boolean))];
    const estimateIds = [...new Set(invoices.map((inv) => inv.estimate_id).filter(Boolean))];

    // Obtener clientes
    const clientsMap: Record<string, { id: string; name: string; email: string | null }> = {};
    if (clientIds.length > 0) {
      const { data: clients } = await supabase
        .from("clients")
        .select("id, name, email")
        .in("id", clientIds);

      if (clients) {
        clients.forEach((client) => {
          clientsMap[client.id] = client;
        });
      }
    }

    // Obtener proyectos
    const projectsMap: Record<string, { id: string; name: string }> = {};
    if (projectIds.length > 0) {
      const { data: projects } = await supabase
        .from("projects")
        .select("id, name")
        .in("id", projectIds);

      if (projects) {
        projects.forEach((project) => {
          projectsMap[project.id] = project;
        });
      }
    }

    // Obtener presupuestos relacionados
    const estimatesMap: Record<string, { id: string; estimate_number: string; title: string }> = {};
    if (estimateIds.length > 0) {
      const { data: estimates } = await supabase
        .from("estimates")
        .select("id, estimate_number, title")
        .in("id", estimateIds);

      if (estimates) {
        estimates.forEach((estimate) => {
          estimatesMap[estimate.id] = estimate;
        });
      }
    }

    // Obtener items de facturas
    const invoiceIds = invoices.map((inv) => inv.id);
    const { data: items } = await supabase
      .from("invoice_items")
      .select("*")
      .in("invoice_id", invoiceIds)
      .order("invoice_id", { ascending: true })
      .order("line_number", { ascending: true });

    const itemsMap: Record<string, InvoiceItem[]> = {};
    if (items) {
      items.forEach((item) => {
        if (!itemsMap[item.invoice_id]) {
          itemsMap[item.invoice_id] = [];
        }
        itemsMap[item.invoice_id].push({
          id: item.id,
          invoice_id: item.invoice_id,
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
        });
      });
    }

    // Mapear datos
    return invoices.map((invoice: any) => ({
      id: invoice.id,
      user_id: invoice.user_id,
      company_id: invoice.company_id || null,
      client_id: invoice.client_id || null,
      project_id: invoice.project_id || null,
      estimate_id: invoice.estimate_id || null,
      invoice_number: invoice.invoice_number,
      series: invoice.series || "FAC",
      title: invoice.title,
      description: invoice.description || null,
      issue_date: invoice.issue_date,
      due_date: invoice.due_date || null,
      status: invoice.status as InvoiceStatus,
      subtotal: parseFloat(invoice.subtotal || 0),
      tax_rate: parseFloat(invoice.tax_rate || 21),
      tax_amount: parseFloat(invoice.tax_amount || 0),
      total: parseFloat(invoice.total || 0),
      paid_amount: parseFloat(invoice.paid_amount || 0),
      payment_date: invoice.payment_date || null,
      payment_method: invoice.payment_method || null,
      notes: invoice.notes || null,
      terms: invoice.terms || null,
      created_at: invoice.created_at,
      updated_at: invoice.updated_at || null,
      client: invoice.client_id ? clientsMap[invoice.client_id] || null : null,
      project: invoice.project_id ? projectsMap[invoice.project_id] || null : null,
      estimate: invoice.estimate_id ? estimatesMap[invoice.estimate_id] || null : null,
      items: itemsMap[invoice.id] || [],
    }));
  } catch (err) {
    console.error("Unexpected error in getInvoices:", err);
    return [];
  }
}

/**
 * Obtiene una factura por ID
 */
export async function getInvoiceById(id: string): Promise<InvoiceWithRelations | null> {
  const supabase = await createClient();

  try {
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", id)
      .single();

    if (invoiceError || !invoice) {
      console.error("Error fetching invoice:", invoiceError);
      return null;
    }

    // Obtener items de la factura
    const { data: items, error: itemsError } = await supabase
      .from("invoice_items")
      .select("*")
      .eq("invoice_id", id)
      .order("line_number", { ascending: true });

    if (itemsError) {
      console.error("Error fetching invoice items:", itemsError);
    }

    // Obtener cliente si existe
    let client = null;
    if (invoice.client_id) {
      const { data: clientData } = await supabase
        .from("clients")
        .select("id, name, email")
        .eq("id", invoice.client_id)
        .single();

      if (clientData) {
        client = clientData;
      }
    }

    // Obtener proyecto si existe
    let project = null;
    if (invoice.project_id) {
      const { data: projectData } = await supabase
        .from("projects")
        .select("id, name")
        .eq("id", invoice.project_id)
        .single();

      if (projectData) {
        project = projectData;
      }
    }

    // Obtener presupuesto relacionado si existe
    let estimate = null;
    if (invoice.estimate_id) {
      const { data: estimateData } = await supabase
        .from("estimates")
        .select("id, estimate_number, title")
        .eq("id", invoice.estimate_id)
        .single();

      if (estimateData) {
        estimate = estimateData;
      }
    }

    return {
      id: invoice.id,
      user_id: invoice.user_id,
      company_id: invoice.company_id || null,
      client_id: invoice.client_id || null,
      project_id: invoice.project_id || null,
      estimate_id: invoice.estimate_id || null,
      invoice_number: invoice.invoice_number,
      series: invoice.series || "FAC",
      title: invoice.title,
      description: invoice.description || null,
      issue_date: invoice.issue_date,
      due_date: invoice.due_date || null,
      status: invoice.status as InvoiceStatus,
      subtotal: parseFloat(invoice.subtotal || 0),
      tax_rate: parseFloat(invoice.tax_rate || 21),
      tax_amount: parseFloat(invoice.tax_amount || 0),
      total: parseFloat(invoice.total || 0),
      paid_amount: parseFloat(invoice.paid_amount || 0),
      payment_date: invoice.payment_date || null,
      payment_method: invoice.payment_method || null,
      notes: invoice.notes || null,
      terms: invoice.terms || null,
      created_at: invoice.created_at,
      updated_at: invoice.updated_at || null,
      client,
      project,
      estimate,
      items:
        items?.map((item: any) => ({
          id: item.id,
          invoice_id: item.invoice_id,
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
        })) || [],
    };
  } catch (err) {
    console.error("Unexpected error in getInvoiceById:", err);
    return null;
  }
}

/**
 * Obtiene las facturas de un proyecto específico
 */
export async function getInvoicesByProjectId(projectId: string): Promise<InvoiceWithRelations[]> {
  const supabase = await createClient();

  try {
    const { data: invoices, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("project_id", projectId)
      .order("issue_date", { ascending: false });

    if (error || !invoices) {
      console.error("Error fetching invoices by project:", error);
      return [];
    }

    // Obtener items y relaciones (similar a getInvoices)
    // Por simplicidad, aquí podemos reutilizar la lógica anterior
    return await getInvoices();
  } catch (err) {
    console.error("Unexpected error in getInvoicesByProjectId:", err);
    return [];
  }
}

