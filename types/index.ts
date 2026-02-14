export type Company = {
  id: string;
  owner_id: string;
  name: string;
  tax_id: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  postal_code: string | null;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  subtitle: string | null;
  created_at: string;
  updated_at: string;
};

export type Client = {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  postal_code: string | null;
  tax_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Supplier = {
  id: string;
  user_id: string;
  name: string;
  type: "material" | "labor" | "service" | "other";
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  tax_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ProjectStatus =
  | "planning"
  | "in_progress"
  | "paused"
  | "completed"
  | "cancelled";

export type Project = {
  id: string;
  user_id: string;
  client_id: string;
  name: string;
  description: string | null;
  address: string;
  status: ProjectStatus;
  start_date: string | null;
  estimated_end_date: string | null;
  end_date: string | null;
  total_budget: number | null;
  estimate_id: string | null;
  created_at: string;
  updated_at: string;
  client?: Pick<Client, "id" | "name">;
};

export type EstimateStatus = "draft" | "sent" | "accepted" | "rejected";

export type Estimate = {
  id: string;
  user_id: string;
  project_id: string | null;
  client_id: string | null;
  name: string;
  description: string | null;
  total_amount: number;
  status: EstimateStatus;
  valid_until: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  project?: Pick<Project, "id" | "name"> & {
    client?: Pick<Client, "id" | "name">;
  };
  client?: Pick<Client, "id" | "name">;
  items?: EstimateItem[];
};

export type EstimateItem = {
  id: string;
  estimate_id: string;
  categoria: string;
  descripcion: string;
  unidad: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  orden: number;
  created_at: string;
};

export type TransactionType = "income" | "expense";

export type FinanceTransaction = {
  id: string;
  user_id: string;
  project_id: string | null;
  client_id: string | null;
  type: TransactionType;
  category: string;
  description: string;
  amount: number;
  transaction_date: string;
  payment_method: string | null;
  reference: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  project?: Pick<Project, "id" | "name"> | null;
  client?: Pick<Client, "id" | "name"> | null;
};

export type CostCategory = "material" | "mano_de_obra" | "subcontrata" | "transporte" | "otros";

export type ProjectCost = {
  id: string;
  project_id: string;
  user_id: string;
  descripcion: string;
  categoria: CostCategory;
  importe: number;
  fecha: string;
  notas: string | null;
  created_at: string;
};
