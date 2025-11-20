-- ============================================
-- SCRIPT PARA CREAR TABLAS DE PRESUPUESTOS
-- Este script es seguro de ejecutar múltiples veces
-- ============================================

-- Habilitar extensión pgcrypto (necesaria para gen_random_uuid)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- PASO 1: VERIFICAR/CREAR TABLAS DEPENDIENTES
-- ============================================
-- Asegurar que clients existe
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

-- Asegurar que projects existe
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

-- Añadir columnas que puedan faltar si la tabla ya existía
DO $$ 
BEGIN
  -- Añadir client_id a projects si no existe
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'projects') THEN
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'projects' 
      AND column_name = 'client_id'
    ) THEN
      ALTER TABLE public.projects ADD COLUMN client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

-- Habilitar RLS para tablas dependientes
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'clients') THEN
    ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'projects') THEN
    ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Crear índices básicos para tablas dependientes si no existen
CREATE INDEX IF NOT EXISTS clients_user_id_idx ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS projects_user_id_idx ON public.projects(user_id);

-- Crear índice de client_id solo si la columna existe
DO $$ 
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'projects' 
    AND column_name = 'client_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS projects_client_id_idx ON public.projects(client_id);
  END IF;
END $$;

-- ============================================
-- PASO 2: TABLA DE PRESUPUESTOS (ESTIMATES)
-- ============================================
-- Eliminar la tabla si existe para evitar problemas con estructura incorrecta
DROP TABLE IF EXISTS public.estimate_items CASCADE;
DROP TABLE IF EXISTS public.estimates CASCADE;

-- Crear la tabla estimates con todas las columnas necesarias
CREATE TABLE public.estimates (
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
-- PASO 3: TABLA DE LÍNEAS DE PRESUPUESTO
-- ============================================
CREATE TABLE public.estimate_items (
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

-- Habilitar RLS
ALTER TABLE public.estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimate_items ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PASO 4: POLÍTICAS RLS PARA ESTIMATES
-- ============================================
-- Eliminar políticas existentes antes de crear nuevas
DROP POLICY IF EXISTS "Users can view their own estimates" ON public.estimates;
DROP POLICY IF EXISTS "Users can insert their own estimates" ON public.estimates;
DROP POLICY IF EXISTS "Users can update their own estimates" ON public.estimates;
DROP POLICY IF EXISTS "Users can delete their own estimates" ON public.estimates;

-- Crear políticas para estimates
CREATE POLICY "Users can view their own estimates"
  ON public.estimates
  FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert their own estimates"
  ON public.estimates
  FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own estimates"
  ON public.estimates
  FOR UPDATE
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own estimates"
  ON public.estimates
  FOR DELETE
  USING ((SELECT auth.uid()) = user_id);

-- ============================================
-- PASO 5: POLÍTICAS RLS PARA ESTIMATE_ITEMS
-- ============================================
-- Eliminar políticas existentes antes de crear nuevas
DROP POLICY IF EXISTS "Users can view their own estimate items" ON public.estimate_items;
DROP POLICY IF EXISTS "Users can insert their own estimate items" ON public.estimate_items;
DROP POLICY IF EXISTS "Users can update their own estimate items" ON public.estimate_items;
DROP POLICY IF EXISTS "Users can delete their own estimate items" ON public.estimate_items;

-- Crear políticas para estimate_items
CREATE POLICY "Users can view their own estimate items"
  ON public.estimate_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.estimates
      WHERE estimates.id = estimate_items.estimate_id
      AND estimates.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can insert their own estimate items"
  ON public.estimate_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.estimates
      WHERE estimates.id = estimate_items.estimate_id
      AND estimates.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can update their own estimate items"
  ON public.estimate_items
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.estimates
      WHERE estimates.id = estimate_items.estimate_id
      AND estimates.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.estimates
      WHERE estimates.id = estimate_items.estimate_id
      AND estimates.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can delete their own estimate items"
  ON public.estimate_items
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.estimates
      WHERE estimates.id = estimate_items.estimate_id
      AND estimates.user_id = (SELECT auth.uid())
    )
  );

-- ============================================
-- PASO 6: ÍNDICES
-- ============================================
-- Crear índices solo si las tablas y columnas existen
CREATE INDEX IF NOT EXISTS estimates_user_id_idx ON public.estimates(user_id);
CREATE INDEX IF NOT EXISTS estimates_status_idx ON public.estimates(status);
CREATE INDEX IF NOT EXISTS estimates_estimate_number_idx ON public.estimates(estimate_number);
CREATE INDEX IF NOT EXISTS estimate_items_estimate_id_idx ON public.estimate_items(estimate_id);

-- Crear índices de foreign keys
CREATE INDEX IF NOT EXISTS estimates_client_id_idx ON public.estimates(client_id);
CREATE INDEX IF NOT EXISTS estimates_project_id_idx ON public.estimates(project_id);

-- ============================================
-- PASO 7: FUNCIONES Y TRIGGERS
-- ============================================

-- Función para calcular totales del presupuesto
CREATE OR REPLACE FUNCTION public.update_estimate_totals()
RETURNS TRIGGER AS $$
DECLARE
  v_subtotal NUMERIC(10, 2);
  v_tax_amount NUMERIC(10, 2);
  v_total NUMERIC(10, 2);
  v_tax_rate NUMERIC(5, 2);
BEGIN
  -- Calcular subtotales, impuestos y total de la línea
  NEW.subtotal := NEW.quantity * NEW.unit_price;
  NEW.tax_amount := NEW.subtotal * (COALESCE(NEW.tax_rate, 21.00) / 100);
  NEW.total := NEW.subtotal + NEW.tax_amount;

  -- Calcular totales del presupuesto
  SELECT 
    COALESCE(SUM(subtotal), 0),
    COALESCE(SUM(tax_amount), 0),
    COALESCE(SUM(total), 0),
    MAX(tax_rate)
  INTO v_subtotal, v_tax_amount, v_total, v_tax_rate
  FROM public.estimate_items
  WHERE estimate_id = NEW.estimate_id;

  -- Actualizar el presupuesto
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

-- Eliminar triggers existentes antes de crear nuevos
DROP TRIGGER IF EXISTS update_estimate_totals_trigger ON public.estimate_items;

-- Crear trigger para actualizar totales cuando se inserta o actualiza un item
CREATE TRIGGER update_estimate_totals_trigger
  BEFORE INSERT OR UPDATE ON public.estimate_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_estimate_totals();

-- Función para actualizar totales cuando se elimina un item
CREATE OR REPLACE FUNCTION public.update_estimate_totals_on_delete()
RETURNS TRIGGER AS $$
DECLARE
  v_subtotal NUMERIC(10, 2);
  v_tax_amount NUMERIC(10, 2);
  v_total NUMERIC(10, 2);
  v_tax_rate NUMERIC(5, 2);
BEGIN
  -- Calcular totales del presupuesto después de eliminar
  SELECT 
    COALESCE(SUM(subtotal), 0),
    COALESCE(SUM(tax_amount), 0),
    COALESCE(SUM(total), 0),
    MAX(tax_rate)
  INTO v_subtotal, v_tax_amount, v_total, v_tax_rate
  FROM public.estimate_items
  WHERE estimate_id = OLD.estimate_id;

  -- Actualizar el presupuesto
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

-- Eliminar trigger existente antes de crear nuevo
DROP TRIGGER IF EXISTS update_estimate_totals_on_delete_trigger ON public.estimate_items;

-- Crear trigger para actualizar totales al eliminar
CREATE TRIGGER update_estimate_totals_on_delete_trigger
  AFTER DELETE ON public.estimate_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_estimate_totals_on_delete();

-- ============================================
-- PASO 8: FUNCIÓN PARA GENERAR NÚMERO DE PRESUPUESTO
-- ============================================
CREATE OR REPLACE FUNCTION public.generate_estimate_number(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  v_year TEXT;
  v_count INTEGER;
  v_number TEXT;
BEGIN
  v_year := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  -- Contar presupuestos del usuario del año actual
  SELECT COALESCE(COUNT(*), 0) + 1
  INTO v_count
  FROM public.estimates
  WHERE user_id = user_uuid
  AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE);
  
  -- Formato: EST-YYYY-XXX
  v_number := 'EST-' || v_year || '-' || LPAD(v_count::TEXT, 3, '0');
  
  RETURN v_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Revocar permisos de ejecución públicos para funciones SECURITY DEFINER
REVOKE EXECUTE ON FUNCTION public.generate_estimate_number(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.generate_estimate_number(UUID) TO authenticated;

-- ✅ Listo! Las tablas de presupuestos están creadas correctamente.
