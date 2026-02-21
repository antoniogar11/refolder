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
  iva_porcentaje: number;
  status: EstimateStatus;
  valid_until: string | null;
  notes: string | null;
  margen_global: number | null;
  share_token: string | null;
  shared_at: string | null;
  created_at: string;
  updated_at: string;
  project?: Pick<Project, "id" | "name" | "address"> & {
    client?: Pick<Client, "id" | "name" | "email" | "phone" | "address" | "city" | "province" | "postal_code" | "tax_id">;
  };
  client?: Pick<Client, "id" | "name" | "email" | "phone" | "address" | "city" | "province" | "postal_code" | "tax_id">;
  items?: EstimateItem[];
};

export type EstimateItem = {
  id: string;
  estimate_id: string;
  categoria: string;
  descripcion: string;
  unidad: string;
  cantidad: number;
  precio_coste: number | null;
  margen: number;
  precio_unitario: number;
  subtotal: number;
  iva_porcentaje: number;
  orden: number;
  created_at: string;
};

export type CostCategory =
  | "material"
  | "mano_de_obra"
  | "subcontrata"
  | "transporte"
  | "otros"
  | "pago_cliente"
  | "certificacion";

export type MovementType = "gasto" | "ingreso";

export type ProjectCost = {
  id: string;
  project_id: string;
  user_id: string;
  descripcion: string;
  categoria: CostCategory;
  importe: number;
  fecha: string;
  notas: string | null;
  tipo: MovementType;
  created_at: string;
};

export type WorkerRate = {
  id: string;
  user_id: string;
  nombre: string;
  tarifa_hora: number;
  created_at: string;
};

// Project Tasks

export type TaskStatus = "pendiente" | "en_progreso" | "completada";

export type ProjectTask = {
  id: string;
  project_id: string;
  user_id: string;
  nombre: string;
  descripcion: string | null;
  estado: TaskStatus;
  orden: number;
  created_at: string;
};

export type ProjectHour = {
  id: string;
  project_id: string;
  user_id: string;
  descripcion: string;
  categoria_trabajador: string;
  tarifa_hora: number;
  horas: number;
  coste_total: number;
  fecha: string;
  notas: string | null;
  task_id?: string | null;
  task?: Pick<ProjectTask, "id" | "nombre"> | null;
  created_at: string;
};

// Work Types

export type WorkType = {
  id: string;
  user_id: string | null;
  name: string;
  is_default: boolean;
  created_at: string;
};

// Precios de referencia BCCA

export type PrecioReferencia = {
  id: string;
  codigo: string;
  descripcion: string;
  unidad: string;
  precio: number;
  categoria: string;
  created_at: string;
};

// Precios personalizados del usuario (aprendizaje)

export type UserPrecio = {
  id: string;
  user_id: string;
  categoria: string;
  descripcion: string;
  unidad: string;
  precio_coste: number;
  veces_usado: number;
  created_at: string;
  updated_at: string;
};

