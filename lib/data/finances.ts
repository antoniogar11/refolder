import { createClient } from "@/lib/supabase/server";

export type FinanceTransaction = {
  id: string;
  project_id: string | null;
  client_id: string | null;
  type: "income" | "expense";
  category: string;
  description: string | null;
  amount: number;
  transaction_date: string;
  payment_method: "cash" | "bank_transfer" | "card" | "check" | "other" | null;
  reference: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
};

export type FinanceTransactionWithRelations = FinanceTransaction & {
  project?: {
    id: string;
    name: string;
  } | null;
  client?: {
    id: string;
    name: string;
  } | null;
};

export async function getFinanceTransactions(): Promise<FinanceTransactionWithRelations[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from("finance_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching finance transactions:", {
        message: error.message,
        details: error.details,
        code: error.code,
      });
      return [];
    }

    if (!data) {
      return [];
    }

    // Obtener proyectos y clientes relacionados
    const projectIds = data.filter((t: any) => t.project_id).map((t: any) => t.project_id);
    const clientIds = data.filter((t: any) => t.client_id).map((t: any) => t.client_id);

    let projectsMap: Record<string, { id: string; name: string }> = {};
    let clientsMap: Record<string, { id: string; name: string }> = {};

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

    if (clientIds.length > 0) {
      const { data: clientsData } = await supabase
        .from("clients")
        .select("id, name")
        .in("id", clientIds)
        .eq("user_id", user.id);

      if (clientsData) {
        clientsMap = clientsData.reduce((acc: Record<string, { id: string; name: string }>, client) => {
          acc[client.id] = client;
          return acc;
        }, {});
      }
    }

    return data.map((transaction: any) => ({
      id: transaction.id,
      project_id: transaction.project_id || null,
      client_id: transaction.client_id || null,
      type: transaction.type || "expense",
      category: transaction.category || "",
      description: transaction.description || null,
      amount: transaction.amount ? parseFloat(transaction.amount) : 0,
      transaction_date: transaction.transaction_date || new Date().toISOString().split("T")[0],
      payment_method: transaction.payment_method || null,
      reference: transaction.reference || null,
      notes: transaction.notes || null,
      created_at: transaction.created_at || new Date().toISOString(),
      updated_at: transaction.updated_at || null,
      project: transaction.project_id ? projectsMap[transaction.project_id] || null : null,
      client: transaction.client_id ? clientsMap[transaction.client_id] || null : null,
    }));
  } catch (err) {
    console.error("Unexpected error in getFinanceTransactions:", err);
    return [];
  }
}

export async function getFinanceTransactionById(id: string): Promise<FinanceTransactionWithRelations | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from("finance_transactions")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Error fetching finance transaction:", error);
      return null;
    }

    if (!data) {
      return null;
    }

    // Obtener proyecto y cliente si existen
    let project = null;
    let client = null;

    if (data.project_id) {
      const { data: projectData } = await supabase
        .from("projects")
        .select("id, name")
        .eq("id", data.project_id)
        .eq("user_id", user.id)
        .single();

      if (projectData) {
        project = projectData;
      }
    }

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
      id: data.id,
      project_id: data.project_id || null,
      client_id: data.client_id || null,
      type: data.type || "expense",
      category: data.category || "",
      description: data.description || null,
      amount: data.amount ? parseFloat(data.amount) : 0,
      transaction_date: data.transaction_date || new Date().toISOString().split("T")[0],
      payment_method: data.payment_method || null,
      reference: data.reference || null,
      notes: data.notes || null,
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || null,
      project,
      client,
    };
  } catch (err) {
    console.error("Unexpected error in getFinanceTransactionById:", err);
    return null;
  }
}

export async function getFinanceSummary() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { totalIncome: 0, totalExpenses: 0, balance: 0 };
    }

    const { data, error } = await supabase
      .from("finance_transactions")
      .select("type, amount")
      .eq("user_id", user.id);

    if (error || !data) {
      return { totalIncome: 0, totalExpenses: 0, balance: 0 };
    }

    const totalIncome = data
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + parseFloat(t.amount || "0"), 0);

    const totalExpenses = data
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + parseFloat(t.amount || "0"), 0);

    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
    };
  } catch (err) {
    console.error("Unexpected error in getFinanceSummary:", err);
    return { totalIncome: 0, totalExpenses: 0, balance: 0 };
  }
}

export async function getFinanceTransactionsByProjectId(
  projectId: string,
): Promise<FinanceTransactionWithRelations[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from("finance_transactions")
      .select("*")
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching project finance transactions:", {
        message: error.message,
        details: error.details,
        code: error.code,
        hint: error.hint,
      });
      
      // Si el error es que la tabla no existe, lanzar un error más descriptivo
      if (error.code === "42P01" || error.message.includes("does not exist")) {
        throw new Error(
          "La tabla de transacciones financieras no existe. Por favor, ejecuta el script SQL: sql/create_finance_transactions_table.sql"
        );
      }
      
      // Para otros errores, también lanzar para que se muestre al usuario
      throw new Error(
        `Error al cargar las transacciones financieras: ${error.message}`
      );
    }

    if (!data) {
      return [];
    }

    // Obtener cliente si existe
    const clientIds = data.filter((t: any) => t.client_id).map((t: any) => t.client_id);
    let clientsMap: Record<string, { id: string; name: string }> = {};

    if (clientIds.length > 0) {
      const { data: clientsData } = await supabase
        .from("clients")
        .select("id, name")
        .in("id", clientIds)
        .eq("user_id", user.id);

      if (clientsData) {
        clientsMap = clientsData.reduce((acc: Record<string, { id: string; name: string }>, client) => {
          acc[client.id] = client;
          return acc;
        }, {});
      }
    }

    return data.map((transaction: any) => ({
      id: transaction.id,
      project_id: transaction.project_id || null,
      client_id: transaction.client_id || null,
      type: transaction.type || "expense",
      category: transaction.category || "",
      description: transaction.description || null,
      amount: transaction.amount ? parseFloat(transaction.amount) : 0,
      transaction_date: transaction.transaction_date || new Date().toISOString().split("T")[0],
      payment_method: transaction.payment_method || null,
      reference: transaction.reference || null,
      notes: transaction.notes || null,
      created_at: transaction.created_at || new Date().toISOString(),
      updated_at: transaction.updated_at || null,
      project: null, // Ya estamos filtrando por proyecto
      client: transaction.client_id ? clientsMap[transaction.client_id] || null : null,
    }));
  } catch (err) {
    console.error("Unexpected error in getFinanceTransactionsByProjectId:", err);
    
    // Si ya es un Error con mensaje, relanzarlo
    if (err instanceof Error) {
      throw err;
    }
    
    // Para errores desconocidos
    throw new Error(
      "Error inesperado al cargar las transacciones financieras del proyecto"
    );
  }
}

export async function getProjectFinanceSummary(projectId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { totalIncome: 0, totalExpenses: 0, balance: 0 };
    }

    const { data, error } = await supabase
      .from("finance_transactions")
      .select("type, amount")
      .eq("project_id", projectId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching project finance summary:", {
        message: error.message,
        details: error.details,
        code: error.code,
        hint: error.hint,
      });
      
      // Si el error es que la tabla no existe, lanzar un error más descriptivo
      if (error.code === "42P01" || error.message.includes("does not exist")) {
        throw new Error(
          "La tabla de transacciones financieras no existe. Por favor, ejecuta el script SQL: sql/create_finance_transactions_table.sql"
        );
      }
      
      throw new Error(
        `Error al cargar el resumen financiero: ${error.message}`
      );
    }

    if (!data) {
      return { totalIncome: 0, totalExpenses: 0, balance: 0 };
    }

    const totalIncome = data
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + parseFloat(t.amount || "0"), 0);

    const totalExpenses = data
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + parseFloat(t.amount || "0"), 0);

    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
    };
  } catch (err) {
    console.error("Unexpected error in getProjectFinanceSummary:", err);
    
    // Si ya es un Error con mensaje, relanzarlo
    if (err instanceof Error) {
      throw err;
    }
    
    // Para errores desconocidos
    throw new Error(
      "Error inesperado al cargar el resumen financiero del proyecto"
    );
  }
}

/**
 * Obtiene transacciones financieras filtradas por periodo y proyecto
 */
export async function getFilteredFinanceTransactions(
  startDate?: string,
  endDate?: string,
  projectId?: string
): Promise<FinanceTransactionWithRelations[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    let query = supabase
      .from("finance_transactions")
      .select("*")
      .eq("user_id", user.id);

    if (startDate) {
      query = query.gte("transaction_date", startDate);
    }

    if (endDate) {
      query = query.lte("transaction_date", endDate);
    }

    if (projectId) {
      query = query.eq("project_id", projectId);
    }

    const { data, error } = await query
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching filtered finance transactions:", error);
      return [];
    }

    if (!data) {
      return [];
    }

    // Obtener proyectos y clientes relacionados
    const projectIds = data.filter((t: any) => t.project_id).map((t: any) => t.project_id);
    const clientIds = data.filter((t: any) => t.client_id).map((t: any) => t.client_id);

    let projectsMap: Record<string, { id: string; name: string }> = {};
    let clientsMap: Record<string, { id: string; name: string }> = {};

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

    if (clientIds.length > 0) {
      const { data: clientsData } = await supabase
        .from("clients")
        .select("id, name")
        .in("id", clientIds)
        .eq("user_id", user.id);

      if (clientsData) {
        clientsMap = clientsData.reduce((acc: Record<string, { id: string; name: string }>, client) => {
          acc[client.id] = client;
          return acc;
        }, {});
      }
    }

    return data.map((transaction: any) => ({
      id: transaction.id,
      project_id: transaction.project_id || null,
      client_id: transaction.client_id || null,
      type: transaction.type,
      category: transaction.category,
      description: transaction.description || null,
      amount: transaction.amount,
      transaction_date: transaction.transaction_date,
      payment_method: transaction.payment_method || null,
      reference: transaction.reference || null,
      notes: transaction.notes || null,
      created_at: transaction.created_at,
      updated_at: transaction.updated_at || null,
      project: transaction.project_id ? projectsMap[transaction.project_id] || null : null,
      client: transaction.client_id ? clientsMap[transaction.client_id] || null : null,
    }));
  } catch (err) {
    console.error("Unexpected error in getFilteredFinanceTransactions:", err);
    return [];
  }
}

