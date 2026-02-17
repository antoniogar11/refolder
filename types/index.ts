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
  created_at: string;
};

// Site Visits

export type SiteVisitStatus = "pendiente" | "presupuestado" | "vinculado";

export type SiteVisitZoneWork = {
  id: string;
  zone_id: string;
  work_type: string;
  notes: string | null;
  created_at: string;
};

export type SiteVisitPhoto = {
  id: string;
  zone_id: string;
  photo_url: string;
  caption: string | null;
  created_at: string;
};

export type SiteVisitZone = {
  id: string;
  site_visit_id: string;
  name: string;
  largo: number | null;
  ancho: number | null;
  alto: number | null;
  notes: string | null;
  sort_order: number;
  created_at: string;
  works?: SiteVisitZoneWork[];
  photos?: SiteVisitPhoto[];
};

export type SiteVisit = {
  id: string;
  user_id: string;
  client_id: string | null;
  estimate_id: string | null;
  project_id: string | null;
  address: string;
  visit_date: string;
  status: SiteVisitStatus;
  general_notes: string | null;
  created_at: string;
  updated_at: string;
  client?: Pick<Client, "id" | "name"> | null;
  estimate?: Pick<Estimate, "id" | "name"> | null;
  project?: Pick<Project, "id" | "name"> | null;
  zones?: SiteVisitZone[];
};

export type WorkType = {
  id: string;
  user_id: string | null;
  name: string;
  is_default: boolean;
  created_at: string;
};

