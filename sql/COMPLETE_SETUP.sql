-- ============================================
-- SCRIPT COMPLETO PARA SUPABASE
-- Copia y pega TODO este contenido en Supabase SQL Editor
-- ============================================

-- ============================================
-- PASO 1: TABLA CLIENTS (Clientes)
-- ============================================
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  province TEXT,
  postal_code TEXT,
  tax_id TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can insert their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can update their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can delete their own clients" ON public.clients;

CREATE POLICY "Users can view their own clients" ON public.clients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own clients" ON public.clients FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own clients" ON public.clients FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own clients" ON public.clients FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS clients_user_id_idx ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS clients_name_idx ON public.clients(name);
CREATE INDEX IF NOT EXISTS clients_email_idx ON public.clients(email);

-- ============================================
-- PASO 2: TABLA PROJECTS (Obras/Proyectos)
-- ============================================
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'completed', 'cancelled')),
  start_date DATE,
  end_date DATE,
  budget NUMERIC(10, 2),
  address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can insert their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;

CREATE POLICY "Users can view their own projects" ON public.projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own projects" ON public.projects FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own projects" ON public.projects FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS projects_user_id_idx ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS projects_client_id_idx ON public.projects(client_id);
CREATE INDEX IF NOT EXISTS projects_status_idx ON public.projects(status);

-- ============================================
-- PASO 3: TABLA TASKS (Tareas)
-- ============================================
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date DATE,
  assigned_to TEXT,
  estimated_hours NUMERIC(5, 2),
  actual_hours NUMERIC(5, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view tasks of their projects" ON public.tasks;
DROP POLICY IF EXISTS "Users can insert tasks in their projects" ON public.tasks;
DROP POLICY IF EXISTS "Users can update tasks of their projects" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete tasks of their projects" ON public.tasks;

CREATE POLICY "Users can view tasks of their projects" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert tasks in their projects" ON public.tasks FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = tasks.project_id
    AND projects.user_id = auth.uid()
  )
);
CREATE POLICY "Users can update tasks of their projects" ON public.tasks FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete tasks of their projects" ON public.tasks FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS tasks_project_id_idx ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS tasks_user_id_idx ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS tasks_status_idx ON public.tasks(status);
CREATE INDEX IF NOT EXISTS tasks_priority_idx ON public.tasks(priority);

-- ============================================
-- PASO 4: TABLA FINANCE_TRANSACTIONS (Finanzas)
-- ============================================
CREATE TABLE IF NOT EXISTS public.finance_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  description TEXT,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT CHECK (payment_method IN ('cash', 'bank_transfer', 'card', 'check', 'other')),
  reference TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.finance_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own transactions" ON public.finance_transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.finance_transactions;
DROP POLICY IF EXISTS "Users can update their own transactions" ON public.finance_transactions;
DROP POLICY IF EXISTS "Users can delete their own transactions" ON public.finance_transactions;

CREATE POLICY "Users can view their own transactions" ON public.finance_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own transactions" ON public.finance_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own transactions" ON public.finance_transactions FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own transactions" ON public.finance_transactions FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS finance_transactions_user_id_idx ON public.finance_transactions(user_id);
CREATE INDEX IF NOT EXISTS finance_transactions_project_id_idx ON public.finance_transactions(project_id);
CREATE INDEX IF NOT EXISTS finance_transactions_client_id_idx ON public.finance_transactions(client_id);
CREATE INDEX IF NOT EXISTS finance_transactions_type_idx ON public.finance_transactions(type);
CREATE INDEX IF NOT EXISTS finance_transactions_category_idx ON public.finance_transactions(category);
CREATE INDEX IF NOT EXISTS finance_transactions_transaction_date_idx ON public.finance_transactions(transaction_date);

-- ============================================
-- PASO 5: TABLA COMPANIES (Empresas) - SIN RECURSIÓN
-- ============================================
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(owner_id)
);

CREATE TABLE IF NOT EXISTS public.company_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'worker')),
  permissions JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(company_id, user_id)
);

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own company" ON public.companies;
DROP POLICY IF EXISTS "Users can create their own company" ON public.companies;
DROP POLICY IF EXISTS "Owners can update their company" ON public.companies;
DROP POLICY IF EXISTS "Owners can delete their company" ON public.companies;

DROP POLICY IF EXISTS "Members can view company members" ON public.company_members;
DROP POLICY IF EXISTS "Admins can add members" ON public.company_members;
DROP POLICY IF EXISTS "Admins can update members" ON public.company_members;
DROP POLICY IF EXISTS "Admins can delete members" ON public.company_members;

-- Funciones helper (SECURITY DEFINER evita recursión)
CREATE OR REPLACE FUNCTION public.is_company_member_or_owner(
  p_company_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Verificar si es dueño
  IF EXISTS (
    SELECT 1 FROM public.companies
    WHERE id = p_company_id AND owner_id = p_user_id
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Verificar si es miembro (usando SECURITY DEFINER, evita recursión)
  RETURN EXISTS (
    SELECT 1 FROM public.company_members
    WHERE company_id = p_company_id AND user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_company_admin_check(
  p_company_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Verificar si es dueño
  IF EXISTS (
    SELECT 1 FROM public.companies
    WHERE id = p_company_id AND owner_id = p_user_id
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Verificar si es admin miembro (usando SECURITY DEFINER, evita recursión)
  RETURN EXISTS (
    SELECT 1 FROM public.company_members
    WHERE company_id = p_company_id 
    AND user_id = p_user_id 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas para companies
CREATE POLICY "Users can view their own company" ON public.companies FOR SELECT USING (
  owner_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.company_members
    WHERE company_id = companies.id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create their own company" ON public.companies FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update their company" ON public.companies FOR UPDATE USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can delete their company" ON public.companies FOR DELETE USING (owner_id = auth.uid());

-- Políticas para company_members (SIN RECURSIÓN)
CREATE POLICY "Members can view company members" ON public.company_members FOR SELECT USING (
  public.is_company_member_or_owner(company_members.company_id, auth.uid())
);

CREATE POLICY "Admins can add members" ON public.company_members FOR INSERT WITH CHECK (
  public.is_company_admin_check(company_members.company_id, auth.uid())
);

CREATE POLICY "Admins can update members" ON public.company_members FOR UPDATE USING (
  public.is_company_admin_check(company_members.company_id, auth.uid())
) WITH CHECK (
  public.is_company_admin_check(company_members.company_id, auth.uid())
);

CREATE POLICY "Admins can delete members" ON public.company_members FOR DELETE USING (
  public.is_company_admin_check(company_members.company_id, auth.uid())
);

CREATE INDEX IF NOT EXISTS companies_owner_id_idx ON public.companies(owner_id);
CREATE INDEX IF NOT EXISTS companies_name_idx ON public.companies(name);
CREATE INDEX IF NOT EXISTS company_members_company_id_idx ON public.company_members(company_id);
CREATE INDEX IF NOT EXISTS company_members_user_id_idx ON public.company_members(user_id);
CREATE INDEX IF NOT EXISTS company_members_role_idx ON public.company_members(role);

-- Funciones helper adicionales
CREATE OR REPLACE FUNCTION public.get_user_company(user_uuid UUID)
RETURNS UUID AS $$
  SELECT id FROM public.companies WHERE owner_id = user_uuid
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_company_admin(user_uuid UUID, company_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.companies
    WHERE id = company_uuid AND owner_id = user_uuid
  ) OR EXISTS (
    SELECT 1 FROM public.company_members
    WHERE company_id = company_uuid 
    AND user_id = user_uuid 
    AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================
-- PASO 6: TABLA TIME_ENTRIES (Control Horario)
-- ============================================
CREATE TABLE IF NOT EXISTS public.time_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- Usuario que crea el registro
  assigned_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Trabajador para el que se registra el tiempo (NULL = el mismo usuario)
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  start_time TIME, -- Puede ser NULL si solo se proporcionan horas trabajadas
  end_time TIME,
  duration_minutes INTEGER, -- Duración calculada en minutos
  description TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Si la tabla ya existe, añadir columnas que puedan faltar
ALTER TABLE public.time_entries ADD COLUMN IF NOT EXISTS assigned_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Si start_time tiene NOT NULL, quitarlo para permitir NULL
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'time_entries' 
    AND column_name = 'start_time'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.time_entries ALTER COLUMN start_time DROP NOT NULL;
  END IF;
END $$;

ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own time entries or company entries" ON public.time_entries;
DROP POLICY IF EXISTS "Users can insert their own time entries or for workers" ON public.time_entries;
DROP POLICY IF EXISTS "Users can update their own time entries or company entries" ON public.time_entries;
DROP POLICY IF EXISTS "Users can delete their own time entries or company entries" ON public.time_entries;

-- Función helper para verificar si es admin de la empresa del trabajador asignado
CREATE OR REPLACE FUNCTION public.can_manage_time_entry(
  p_assigned_user_id UUID,
  p_creator_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_company_id UUID;
  v_creator_company_id UUID;
BEGIN
  -- Si el creador es el mismo que el asignado, permitir
  IF p_creator_user_id = p_assigned_user_id THEN
    RETURN TRUE;
  END IF;
  
  -- Empresa del trabajador asignado (como dueño o miembro)
  SELECT company_id INTO v_company_id
  FROM (
    SELECT id as company_id FROM public.companies WHERE owner_id = p_assigned_user_id
    UNION
    SELECT company_id FROM public.company_members WHERE user_id = p_assigned_user_id
  ) subq
  LIMIT 1;
  
  -- Empresa del creador (como dueño o miembro)
  SELECT company_id INTO v_creator_company_id
  FROM (
    SELECT id as company_id FROM public.companies WHERE owner_id = p_creator_user_id
    UNION
    SELECT company_id FROM public.company_members WHERE user_id = p_creator_user_id
  ) subq
  LIMIT 1;
  
  -- Si no están en la misma empresa, denegar
  IF v_company_id IS NULL OR v_creator_company_id IS NULL OR v_company_id != v_creator_company_id THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar si el creador es admin (dueño o admin miembro)
  RETURN public.is_company_admin_check(v_company_id, p_creator_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Política para que los usuarios vean sus propios registros o los de trabajadores de su empresa (si son admin)
CREATE POLICY "Users can view their own time entries or company entries"
  ON public.time_entries
  FOR SELECT
  USING (
    auth.uid() = user_id OR -- El usuario que creó el registro
    auth.uid() = COALESCE(assigned_user_id, user_id) OR -- El trabajador asignado
    public.can_manage_time_entry(COALESCE(assigned_user_id, user_id), user_id) -- Admin de la empresa
  );

-- Política para que los usuarios puedan insertar registros para sí mismos o para trabajadores (si son admin)
CREATE POLICY "Users can insert their own time entries or for workers"
  ON public.time_entries
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND (
      assigned_user_id IS NULL OR -- Registro para sí mismo
      assigned_user_id = user_id OR -- Registro para sí mismo (explícito)
      public.can_manage_time_entry(assigned_user_id, user_id) -- Admin creando para trabajador
    )
  );

-- Política para que los usuarios puedan actualizar sus propios registros o los de trabajadores (si son admin)
CREATE POLICY "Users can update their own time entries or company entries"
  ON public.time_entries
  FOR UPDATE
  USING (
    auth.uid() = user_id OR -- El usuario que creó el registro
    public.can_manage_time_entry(COALESCE(assigned_user_id, user_id), user_id) -- Admin de la empresa
  )
  WITH CHECK (
    auth.uid() = user_id AND (
      assigned_user_id IS NULL OR
      assigned_user_id = user_id OR
      public.can_manage_time_entry(COALESCE(assigned_user_id, user_id), user_id)
    )
  );

-- Política para que los usuarios puedan eliminar sus propios registros o los de trabajadores (si son admin)
CREATE POLICY "Users can delete their own time entries or company entries"
  ON public.time_entries
  FOR DELETE
  USING (
    auth.uid() = user_id OR -- El usuario que creó el registro
    public.can_manage_time_entry(COALESCE(assigned_user_id, user_id), user_id) -- Admin de la empresa
  );

CREATE INDEX IF NOT EXISTS time_entries_user_id_idx ON public.time_entries(user_id);
CREATE INDEX IF NOT EXISTS time_entries_assigned_user_id_idx ON public.time_entries(assigned_user_id);
CREATE INDEX IF NOT EXISTS time_entries_project_id_idx ON public.time_entries(project_id);
CREATE INDEX IF NOT EXISTS time_entries_task_id_idx ON public.time_entries(task_id);
CREATE INDEX IF NOT EXISTS time_entries_entry_date_idx ON public.time_entries(entry_date);

-- Función para calcular duración automáticamente
CREATE OR REPLACE FUNCTION public.calculate_duration_minutes(
  p_start_time TIME,
  p_end_time TIME
)
RETURNS INTEGER AS $$
BEGIN
  IF p_end_time IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Calcular diferencia en minutos
  RETURN EXTRACT(EPOCH FROM (p_end_time - p_start_time)) / 60;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger para calcular duración automáticamente
CREATE OR REPLACE FUNCTION public.update_time_entry_duration()
RETURNS TRIGGER AS $$
BEGIN
  -- Si ya se calculó duration_minutes (caso de solo horas trabajadas), no recalcular
  IF NEW.duration_minutes IS NOT NULL AND NEW.start_time IS NULL THEN
    -- Ya está calculado, solo actualizar updated_at
    NEW.updated_at := timezone('utc'::text, now());
    RETURN NEW;
  END IF;
  
  -- Calcular duración desde start_time y end_time si ambos están presentes
  IF NEW.end_time IS NOT NULL AND NEW.start_time IS NOT NULL THEN
    NEW.duration_minutes := public.calculate_duration_minutes(NEW.start_time, NEW.end_time);
  END IF;
  
  NEW.updated_at := timezone('utc'::text, now());
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS time_entry_duration_trigger ON public.time_entries;
CREATE TRIGGER time_entry_duration_trigger
  BEFORE INSERT OR UPDATE ON public.time_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_time_entry_duration();

-- ============================================
-- PASO 7: TABLA DE PRESUPUESTOS (ESTIMATES)
-- ============================================
CREATE TABLE IF NOT EXISTS public.estimates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  estimate_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  validity_date DATE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
  subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
  tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 21.00,
  tax_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total NUMERIC(10, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  terms TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- TABLA DE LÍNEAS DE PRESUPUESTO
-- ============================================
CREATE TABLE IF NOT EXISTS public.estimate_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  estimate_id UUID NOT NULL REFERENCES public.estimates(id) ON DELETE CASCADE,
  line_number INTEGER NOT NULL,
  description TEXT NOT NULL,
  quantity NUMERIC(10, 2) NOT NULL DEFAULT 1,
  unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  tax_rate NUMERIC(5, 2) DEFAULT 21.00,
  subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total NUMERIC(10, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimate_items ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para estimates
DROP POLICY IF EXISTS "Users can view their own estimates" ON public.estimates;
DROP POLICY IF EXISTS "Users can insert their own estimates" ON public.estimates;
DROP POLICY IF EXISTS "Users can update their own estimates" ON public.estimates;
DROP POLICY IF EXISTS "Users can delete their own estimates" ON public.estimates;

CREATE POLICY "Users can view their own estimates"
  ON public.estimates
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own estimates"
  ON public.estimates
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own estimates"
  ON public.estimates
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own estimates"
  ON public.estimates
  FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas RLS para estimate_items
DROP POLICY IF EXISTS "Users can view their own estimate items" ON public.estimate_items;
DROP POLICY IF EXISTS "Users can insert their own estimate items" ON public.estimate_items;
DROP POLICY IF EXISTS "Users can update their own estimate items" ON public.estimate_items;
DROP POLICY IF EXISTS "Users can delete their own estimate items" ON public.estimate_items;

CREATE POLICY "Users can view their own estimate items"
  ON public.estimate_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.estimates
      WHERE estimates.id = estimate_items.estimate_id
      AND estimates.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own estimate items"
  ON public.estimate_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.estimates
      WHERE estimates.id = estimate_items.estimate_id
      AND estimates.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own estimate items"
  ON public.estimate_items
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.estimates
      WHERE estimates.id = estimate_items.estimate_id
      AND estimates.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.estimates
      WHERE estimates.id = estimate_items.estimate_id
      AND estimates.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own estimate items"
  ON public.estimate_items
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.estimates
      WHERE estimates.id = estimate_items.estimate_id
      AND estimates.user_id = auth.uid()
    )
  );

-- Índices
CREATE INDEX IF NOT EXISTS estimates_user_id_idx ON public.estimates(user_id);
CREATE INDEX IF NOT EXISTS estimates_client_id_idx ON public.estimates(client_id);
CREATE INDEX IF NOT EXISTS estimates_project_id_idx ON public.estimates(project_id);
CREATE INDEX IF NOT EXISTS estimates_status_idx ON public.estimates(status);
CREATE INDEX IF NOT EXISTS estimates_estimate_number_idx ON public.estimates(estimate_number);
CREATE INDEX IF NOT EXISTS estimate_items_estimate_id_idx ON public.estimate_items(estimate_id);

-- Función para calcular totales del presupuesto
CREATE OR REPLACE FUNCTION public.update_estimate_totals()
RETURNS TRIGGER AS $$
DECLARE
  v_subtotal NUMERIC(10, 2);
  v_tax_amount NUMERIC(10, 2);
  v_total NUMERIC(10, 2);
  v_tax_rate NUMERIC(5, 2);
BEGIN
  NEW.subtotal := NEW.quantity * NEW.unit_price;
  NEW.tax_amount := NEW.subtotal * (COALESCE(NEW.tax_rate, 21.00) / 100);
  NEW.total := NEW.subtotal + NEW.tax_amount;

  SELECT 
    COALESCE(SUM(subtotal), 0),
    COALESCE(SUM(tax_amount), 0),
    COALESCE(SUM(total), 0),
    MAX(tax_rate)
  INTO v_subtotal, v_tax_amount, v_total, v_tax_rate
  FROM public.estimate_items
  WHERE estimate_id = NEW.estimate_id;

  UPDATE public.estimates
  SET 
    subtotal = v_subtotal,
    tax_rate = COALESCE(v_tax_rate, 21.00),
    tax_amount = v_tax_amount,
    total = v_total,
    updated_at = timezone('utc'::text, now())
  WHERE id = NEW.estimate_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_estimate_totals_trigger ON public.estimate_items;
CREATE TRIGGER update_estimate_totals_trigger
  BEFORE INSERT OR UPDATE ON public.estimate_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_estimate_totals();

-- Función para actualizar totales al eliminar items
CREATE OR REPLACE FUNCTION public.update_estimate_totals_on_delete()
RETURNS TRIGGER AS $$
DECLARE
  v_subtotal NUMERIC(10, 2);
  v_tax_amount NUMERIC(10, 2);
  v_total NUMERIC(10, 2);
  v_tax_rate NUMERIC(5, 2);
BEGIN
  SELECT 
    COALESCE(SUM(subtotal), 0),
    COALESCE(SUM(tax_amount), 0),
    COALESCE(SUM(total), 0),
    MAX(tax_rate)
  INTO v_subtotal, v_tax_amount, v_total, v_tax_rate
  FROM public.estimate_items
  WHERE estimate_id = OLD.estimate_id;

  UPDATE public.estimates
  SET 
    subtotal = v_subtotal,
    tax_rate = COALESCE(v_tax_rate, 21.00),
    tax_amount = v_tax_amount,
    total = v_total,
    updated_at = timezone('utc'::text, now())
  WHERE id = OLD.estimate_id;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_estimate_totals_on_delete_trigger ON public.estimate_items;
CREATE TRIGGER update_estimate_totals_on_delete_trigger
  AFTER DELETE ON public.estimate_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_estimate_totals_on_delete();

-- Función para generar número de presupuesto
CREATE OR REPLACE FUNCTION public.generate_estimate_number(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  v_year TEXT;
  v_count INTEGER;
  v_number TEXT;
BEGIN
  v_year := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  SELECT COALESCE(COUNT(*), 0) + 1
  INTO v_count
  FROM public.estimates
  WHERE user_id = user_uuid
  AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE);
  
  v_number := 'EST-' || v_year || '-' || LPAD(v_count::TEXT, 3, '0');
  
  RETURN v_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PASO 8: FUNCIÓN RPC PARA OBTENER DATOS DE USUARIOS
-- ============================================
CREATE OR REPLACE FUNCTION public.get_user_data(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  email TEXT,
  name TEXT,
  full_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id,
    au.email::TEXT,
    COALESCE(au.raw_user_meta_data->>'name', au.raw_user_meta_data->>'full_name')::TEXT as name,
    COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name')::TEXT as full_name
  FROM auth.users au
  WHERE au.id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ✅ Listo! Todas las tablas están creadas correctamente.
-- 
-- NOTA: Este script es seguro de ejecutar incluso si ya tienes algunas tablas creadas.
-- - Las tablas existentes no se modificarán (usa CREATE TABLE IF NOT EXISTS)
-- - Solo se añadirán columnas nuevas que falten (usa ADD COLUMN IF NOT EXISTS)
-- - Las políticas RLS se actualizarán si cambiaron (usa DROP POLICY IF EXISTS antes de crear)
-- - Las funciones se actualizarán (usa CREATE OR REPLACE FUNCTION)
--
-- El sistema ahora permite:
-- - Registrar tiempo para trabajadores específicos (solo admins)
-- - Registrar tiempo con horas directas o inicio/fin
-- - Control completo de permisos por empresa
-- - Mostrar nombres de trabajadores (si están en metadata del usuario)
-- - Gestión completa de presupuestos con líneas de presupuesto
-- - Generación automática de números de presupuesto
-- - Cálculo automático de totales (subtotal, IVA, total)

