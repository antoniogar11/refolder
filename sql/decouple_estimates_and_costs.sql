-- ============================================================
-- decouple_estimates_and_costs.sql
-- Fase 1: Desacoplar presupuestos de obras y añadir control de costes
-- ============================================================

-- ============================================================
-- 1. PROJECTS: añadir estimate_id para vincular un presupuesto
-- ============================================================
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS estimate_id UUID REFERENCES public.estimates(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS projects_estimate_id_idx ON public.projects(estimate_id);

-- ============================================================
-- 2. ESTIMATES: asegurar que project_id es nullable (ya lo es)
--    y que client_id existe con FK (ya existe)
--    Solo reforzamos los índices
-- ============================================================
CREATE INDEX IF NOT EXISTS estimates_client_id_idx ON public.estimates(client_id);
CREATE INDEX IF NOT EXISTS estimates_user_id_idx ON public.estimates(user_id);
CREATE INDEX IF NOT EXISTS estimates_project_id_idx ON public.estimates(project_id);

-- Actualizar RLS de estimates: el presupuesto pertenece al user_id directamente
-- (no depende de la relación con projects)
DROP POLICY IF EXISTS "Users can view their own estimates" ON public.estimates;
DROP POLICY IF EXISTS "Users can insert their own estimates" ON public.estimates;
DROP POLICY IF EXISTS "Users can update their own estimates" ON public.estimates;
DROP POLICY IF EXISTS "Users can delete their own estimates" ON public.estimates;

CREATE POLICY "Users can view their own estimates" ON public.estimates
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own estimates" ON public.estimates
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own estimates" ON public.estimates
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own estimates" ON public.estimates
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- 3. PROJECT_COSTS: nueva tabla para costes reales de proyecto
-- ============================================================
CREATE TABLE IF NOT EXISTS public.project_costs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  descripcion TEXT NOT NULL,
  categoria TEXT NOT NULL DEFAULT 'otros'
    CHECK (categoria IN ('material', 'mano_de_obra', 'subcontrata', 'transporte', 'otros')),
  importe NUMERIC(12, 2) NOT NULL CHECK (importe > 0),
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.project_costs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own costs" ON public.project_costs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own costs" ON public.project_costs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own costs" ON public.project_costs
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own costs" ON public.project_costs
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS project_costs_project_id_idx ON public.project_costs(project_id);
CREATE INDEX IF NOT EXISTS project_costs_user_id_idx ON public.project_costs(user_id);
CREATE INDEX IF NOT EXISTS project_costs_fecha_idx ON public.project_costs(fecha);
CREATE INDEX IF NOT EXISTS project_costs_categoria_idx ON public.project_costs(categoria);

-- ============================================================
-- 4. VERIFICACION
-- ============================================================
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
