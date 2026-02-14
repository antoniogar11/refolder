-- ============================================================
-- FIX_SCHEMA.sql
-- Corrige el esquema de la BBDD para que coincida con el codigo
-- ============================================================

-- ============================================================
-- 1. PROJECTS: renombrar columnas para coincidir con el codigo
-- ============================================================
-- Codigo espera: estimated_end_date (DB tiene: end_date solo)
-- Codigo espera: total_budget (DB tiene: budget)

ALTER TABLE public.projects RENAME COLUMN budget TO total_budget;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS estimated_end_date date;

-- ============================================================
-- 2. ESTIMATES: renombrar/añadir columnas
-- ============================================================
-- Codigo espera: name (DB tiene: title)
-- Codigo espera: total_amount (DB tiene: total)
-- Codigo espera: valid_until (DB tiene: validity_date)

ALTER TABLE public.estimates RENAME COLUMN title TO name;
ALTER TABLE public.estimates RENAME COLUMN total TO total_amount;
ALTER TABLE public.estimates RENAME COLUMN validity_date TO valid_until;

-- Eliminar columnas que el codigo NO usa (del schema antiguo)
ALTER TABLE public.estimates DROP COLUMN IF EXISTS estimate_number;
ALTER TABLE public.estimates DROP COLUMN IF EXISTS issue_date;
ALTER TABLE public.estimates DROP COLUMN IF EXISTS subtotal;
ALTER TABLE public.estimates DROP COLUMN IF EXISTS tax_rate;
ALTER TABLE public.estimates DROP COLUMN IF EXISTS tax_amount;
ALTER TABLE public.estimates DROP COLUMN IF EXISTS terms;

-- ============================================================
-- 3. ESTIMATE_ITEMS: recrear con campos en español
-- ============================================================
-- DB actual: description, quantity, unit_price, line_number, tax_rate, tax_amount, total
-- Codigo espera: categoria, descripcion, unidad, cantidad, precio_unitario, subtotal, orden

-- Primero eliminar triggers que referencian columnas viejas
DROP TRIGGER IF EXISTS update_estimate_item_totals ON public.estimate_items;
DROP TRIGGER IF EXISTS update_estimate_totals_trigger ON public.estimate_items;
DROP FUNCTION IF EXISTS update_estimate_totals() CASCADE;

-- Borrar la tabla vieja y recrearla
DROP TABLE IF EXISTS public.estimate_items CASCADE;

CREATE TABLE public.estimate_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  estimate_id UUID NOT NULL REFERENCES public.estimates(id) ON DELETE CASCADE,
  categoria TEXT NOT NULL DEFAULT '',
  descripcion TEXT NOT NULL,
  unidad TEXT NOT NULL DEFAULT 'ud',
  cantidad NUMERIC(12, 2) NOT NULL DEFAULT 1,
  precio_unitario NUMERIC(12, 2) NOT NULL DEFAULT 0,
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
  orden INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.estimate_items ENABLE ROW LEVEL SECURITY;

-- RLS: solo el dueño del estimate puede ver/crear/modificar/borrar items
DROP POLICY IF EXISTS "Users can view estimate items" ON public.estimate_items;
DROP POLICY IF EXISTS "Users can insert estimate items" ON public.estimate_items;
DROP POLICY IF EXISTS "Users can update estimate items" ON public.estimate_items;
DROP POLICY IF EXISTS "Users can delete estimate items" ON public.estimate_items;

CREATE POLICY "Users can view estimate items" ON public.estimate_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.estimates WHERE estimates.id = estimate_items.estimate_id AND estimates.user_id = auth.uid())
  );

CREATE POLICY "Users can insert estimate items" ON public.estimate_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.estimates WHERE estimates.id = estimate_items.estimate_id AND estimates.user_id = auth.uid())
  );

CREATE POLICY "Users can update estimate items" ON public.estimate_items
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.estimates WHERE estimates.id = estimate_items.estimate_id AND estimates.user_id = auth.uid())
  );

CREATE POLICY "Users can delete estimate items" ON public.estimate_items
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.estimates WHERE estimates.id = estimate_items.estimate_id AND estimates.user_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS estimate_items_estimate_id_idx ON public.estimate_items(estimate_id);

-- ============================================================
-- 4. USER_ROLES: crear tabla (referenciada en lib/auth/roles.ts)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- 5. ELIMINAR TABLAS DE CODIGO MUERTO
-- ============================================================
DROP TABLE IF EXISTS public.time_entries CASCADE;
DROP TABLE IF EXISTS public.invoice_items CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.finance_transactions CASCADE;
DROP TABLE IF EXISTS public.company_members CASCADE;
DROP TABLE IF EXISTS public.companies CASCADE;
DROP TABLE IF EXISTS public.suppliers CASCADE;

-- ============================================================
-- 6. LIMPIAR FUNCIONES HUERFANAS
-- ============================================================
DROP FUNCTION IF EXISTS calculate_duration_minutes() CASCADE;
DROP FUNCTION IF EXISTS can_manage_time_entry(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS generate_invoice_number() CASCADE;
DROP FUNCTION IF EXISTS get_user_company(uuid) CASCADE;
DROP FUNCTION IF EXISTS is_company_admin(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS is_company_admin_check(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS is_company_member_or_owner(uuid, uuid) CASCADE;

-- ============================================================
-- 7. VERIFICACION FINAL
-- ============================================================
-- Este SELECT deberia devolver las 5 tablas que usa la app
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
