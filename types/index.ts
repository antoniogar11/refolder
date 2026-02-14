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
  created_at: string;
  updated_at: string;
  client?: Pick<Client, "id" | "name">;
};

export type EstimateStatus = "draft" | "sent" | "accepted" | "rejected";

export type Estimate = {
  id: string;
  user_id: string;
  project_id: string;
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
