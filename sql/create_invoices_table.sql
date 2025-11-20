-- ============================================
-- SCRIPT PARA CREAR TABLAS DE FACTURAS
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

-- Asegurar que estimates existe (para vincular facturas con presupuestos)
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
-- PASO 2: TABLA DE FACTURAS (INVOICES)
-- ============================================
-- Eliminar la tabla si existe para evitar problemas con estructura incorrecta
DROP TABLE IF EXISTS public.invoice_items CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;

-- Crear la tabla invoices con todas las columnas necesarias
CREATE TABLE public.invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  estimate_id UUID REFERENCES public.estimates(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL,
  series TEXT NOT NULL DEFAULT 'FAC',
  title TEXT NOT NULL,
  description TEXT,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled', 'partial')),
  subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
  tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 21.00,
  tax_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total NUMERIC(10, 2) NOT NULL DEFAULT 0,
  paid_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  payment_date DATE,
  payment_method TEXT,
  notes TEXT,
  terms TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- PASO 3: TABLA DE LÍNEAS DE FACTURA
-- ============================================
CREATE TABLE public.invoice_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
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
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PASO 4: POLÍTICAS RLS PARA INVOICES
-- ============================================
-- Eliminar políticas existentes antes de crear nuevas
DROP POLICY IF EXISTS "Users can view their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can insert their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can update their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can delete their own invoices" ON public.invoices;

-- Crear políticas para invoices (con soporte para empresas)
CREATE POLICY "Users can view their own invoices"
  ON public.invoices
  FOR SELECT
  USING (
    (SELECT auth.uid()) = user_id
    OR EXISTS (
      SELECT 1 FROM public.companies
      WHERE companies.id = invoices.company_id
      AND companies.owner_id = (SELECT auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM public.company_members
      WHERE company_members.company_id = invoices.company_id
      AND company_members.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can insert their own invoices"
  ON public.invoices
  FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own invoices"
  ON public.invoices
  FOR UPDATE
  USING (
    (SELECT auth.uid()) = user_id
    OR EXISTS (
      SELECT 1 FROM public.companies
      WHERE companies.id = invoices.company_id
      AND companies.owner_id = (SELECT auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM public.company_members
      WHERE company_members.company_id = invoices.company_id
      AND company_members.user_id = (SELECT auth.uid())
      AND (company_members.role = 'admin' OR company_members.permissions->>'invoices:write' = 'true')
    )
  )
  WITH CHECK (
    (SELECT auth.uid()) = user_id
    OR EXISTS (
      SELECT 1 FROM public.companies
      WHERE companies.id = invoices.company_id
      AND companies.owner_id = (SELECT auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM public.company_members
      WHERE company_members.company_id = invoices.company_id
      AND company_members.user_id = (SELECT auth.uid())
      AND (company_members.role = 'admin' OR company_members.permissions->>'invoices:write' = 'true')
    )
  );

CREATE POLICY "Users can delete their own invoices"
  ON public.invoices
  FOR DELETE
  USING (
    (SELECT auth.uid()) = user_id
    OR EXISTS (
      SELECT 1 FROM public.companies
      WHERE companies.id = invoices.company_id
      AND companies.owner_id = (SELECT auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM public.company_members
      WHERE company_members.company_id = invoices.company_id
      AND company_members.user_id = (SELECT auth.uid())
      AND (company_members.role = 'admin' OR company_members.permissions->>'invoices:delete' = 'true')
    )
  );

-- ============================================
-- PASO 5: POLÍTICAS RLS PARA INVOICE_ITEMS
-- ============================================
-- Eliminar políticas existentes antes de crear nuevas
DROP POLICY IF EXISTS "Users can view their own invoice items" ON public.invoice_items;
DROP POLICY IF EXISTS "Users can insert their own invoice items" ON public.invoice_items;
DROP POLICY IF EXISTS "Users can update their own invoice items" ON public.invoice_items;
DROP POLICY IF EXISTS "Users can delete their own invoice items" ON public.invoice_items;

-- Crear políticas para invoice_items
CREATE POLICY "Users can view their own invoice items"
  ON public.invoice_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND (
        invoices.user_id = (SELECT auth.uid())
        OR EXISTS (
          SELECT 1 FROM public.companies
          WHERE companies.id = invoices.company_id
          AND companies.owner_id = (SELECT auth.uid())
        )
        OR EXISTS (
          SELECT 1 FROM public.company_members
          WHERE company_members.company_id = invoices.company_id
          AND company_members.user_id = (SELECT auth.uid())
        )
      )
    )
  );

CREATE POLICY "Users can insert their own invoice items"
  ON public.invoice_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND invoices.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can update their own invoice items"
  ON public.invoice_items
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND (
        invoices.user_id = (SELECT auth.uid())
        OR EXISTS (
          SELECT 1 FROM public.companies
          WHERE companies.id = invoices.company_id
          AND companies.owner_id = (SELECT auth.uid())
        )
        OR EXISTS (
          SELECT 1 FROM public.company_members
          WHERE company_members.company_id = invoices.company_id
          AND company_members.user_id = (SELECT auth.uid())
          AND (company_members.role = 'admin' OR company_members.permissions->>'invoices:write' = 'true')
        )
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND (
        invoices.user_id = (SELECT auth.uid())
        OR EXISTS (
          SELECT 1 FROM public.companies
          WHERE companies.id = invoices.company_id
          AND companies.owner_id = (SELECT auth.uid())
        )
        OR EXISTS (
          SELECT 1 FROM public.company_members
          WHERE company_members.company_id = invoices.company_id
          AND company_members.user_id = (SELECT auth.uid())
          AND (company_members.role = 'admin' OR company_members.permissions->>'invoices:write' = 'true')
        )
      )
    )
  );

CREATE POLICY "Users can delete their own invoice items"
  ON public.invoice_items
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND (
        invoices.user_id = (SELECT auth.uid())
        OR EXISTS (
          SELECT 1 FROM public.companies
          WHERE companies.id = invoices.company_id
          AND companies.owner_id = (SELECT auth.uid())
        )
        OR EXISTS (
          SELECT 1 FROM public.company_members
          WHERE company_members.company_id = invoices.company_id
          AND company_members.user_id = (SELECT auth.uid())
          AND (company_members.role = 'admin' OR company_members.permissions->>'invoices:delete' = 'true')
        )
      )
    )
  );

-- ============================================
-- PASO 6: ÍNDICES
-- ============================================
CREATE INDEX IF NOT EXISTS invoices_user_id_idx ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS invoices_company_id_idx ON public.invoices(company_id);
CREATE INDEX IF NOT EXISTS invoices_status_idx ON public.invoices(status);
CREATE INDEX IF NOT EXISTS invoices_invoice_number_idx ON public.invoices(invoice_number);
CREATE INDEX IF NOT EXISTS invoices_series_idx ON public.invoices(series);
CREATE INDEX IF NOT EXISTS invoices_client_id_idx ON public.invoices(client_id);
CREATE INDEX IF NOT EXISTS invoices_project_id_idx ON public.invoices(project_id);
CREATE INDEX IF NOT EXISTS invoices_estimate_id_idx ON public.invoices(estimate_id);
CREATE INDEX IF NOT EXISTS invoice_items_invoice_id_idx ON public.invoice_items(invoice_id);

-- ============================================
-- PASO 7: FUNCIONES Y TRIGGERS
-- ============================================

-- Función para calcular totales de la factura
CREATE OR REPLACE FUNCTION public.update_invoice_totals()
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

  -- Calcular totales de la factura
  SELECT 
    COALESCE(SUM(subtotal), 0),
    COALESCE(SUM(tax_amount), 0),
    COALESCE(SUM(total), 0),
    MAX(tax_rate)
  INTO v_subtotal, v_tax_amount, v_total, v_tax_rate
  FROM public.invoice_items
  WHERE invoice_id = NEW.invoice_id;

  -- Actualizar la factura
  UPDATE public.invoices
  SET 
    subtotal = v_subtotal,
    tax_rate = COALESCE(v_tax_rate, 21.00),
    tax_amount = v_tax_amount,
    total = v_total,
    updated_at = timezone('utc'::text, now())
  WHERE id = NEW.invoice_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Eliminar triggers existentes antes de crear nuevos
DROP TRIGGER IF EXISTS update_invoice_totals_trigger ON public.invoice_items;

-- Crear trigger para actualizar totales cuando se inserta o actualiza un item
CREATE TRIGGER update_invoice_totals_trigger
  BEFORE INSERT OR UPDATE ON public.invoice_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_invoice_totals();

-- Función para actualizar totales cuando se elimina un item
CREATE OR REPLACE FUNCTION public.update_invoice_totals_on_delete()
RETURNS TRIGGER AS $$
DECLARE
  v_subtotal NUMERIC(10, 2);
  v_tax_amount NUMERIC(10, 2);
  v_total NUMERIC(10, 2);
  v_tax_rate NUMERIC(5, 2);
BEGIN
  -- Recalcular totales de la factura
  SELECT 
    COALESCE(SUM(subtotal), 0),
    COALESCE(SUM(tax_amount), 0),
    COALESCE(SUM(total), 0),
    MAX(tax_rate)
  INTO v_subtotal, v_tax_amount, v_total, v_tax_rate
  FROM public.invoice_items
  WHERE invoice_id = OLD.invoice_id;

  -- Actualizar la factura
  UPDATE public.invoices
  SET 
    subtotal = COALESCE(v_subtotal, 0),
    tax_rate = COALESCE(v_tax_rate, 21.00),
    tax_amount = COALESCE(v_tax_amount, 0),
    total = COALESCE(v_total, 0),
    updated_at = timezone('utc'::text, now())
  WHERE id = OLD.invoice_id;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Eliminar triggers existentes antes de crear nuevos
DROP TRIGGER IF EXISTS update_invoice_totals_on_delete_trigger ON public.invoice_items;

-- Crear trigger para actualizar totales cuando se elimina un item
CREATE TRIGGER update_invoice_totals_on_delete_trigger
  AFTER DELETE ON public.invoice_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_invoice_totals_on_delete();

-- Función para generar número de factura automático
CREATE OR REPLACE FUNCTION public.generate_invoice_number(
  user_uuid UUID,
  invoice_series TEXT DEFAULT 'FAC'
)
RETURNS TEXT AS $$
DECLARE
  v_year INTEGER;
  v_sequence INTEGER;
  v_invoice_number TEXT;
BEGIN
  -- Obtener año actual
  v_year := EXTRACT(YEAR FROM CURRENT_DATE);
  
  -- Obtener el último número de factura de esta serie para este usuario/año
  SELECT COALESCE(MAX(
    CAST(
      SUBSTRING(invoice_number FROM LENGTH(invoice_series) + 2 + 4 + 2 FOR 3)
      AS INTEGER
    )
  ), 0) + 1
  INTO v_sequence
  FROM public.invoices
  WHERE user_id = user_uuid
    AND series = invoice_series
    AND EXTRACT(YEAR FROM issue_date) = v_year;
  
  -- Generar número de factura: FAC-2025-001
  v_invoice_number := invoice_series || '-' || v_year || '-' || LPAD(v_sequence::TEXT, 3, '0');
  
  RETURN v_invoice_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Revocar permisos públicos de la función
REVOKE EXECUTE ON FUNCTION public.generate_invoice_number(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.generate_invoice_number(UUID, TEXT) TO authenticated;

-- Comentarios
COMMENT ON TABLE public.invoices IS 'Tabla de facturas';
COMMENT ON TABLE public.invoice_items IS 'Líneas de factura';
COMMENT ON COLUMN public.invoices.series IS 'Serie de facturación (FAC, REC, etc.)';
COMMENT ON COLUMN public.invoices.invoice_number IS 'Número de factura generado automáticamente (FAC-2025-001)';
COMMENT ON COLUMN public.invoices.status IS 'Estado: draft, sent, paid, overdue, cancelled, partial';
COMMENT ON COLUMN public.invoices.paid_amount IS 'Importe pagado (para pagos parciales)';
COMMENT ON COLUMN public.invoices.due_date IS 'Fecha de vencimiento';
COMMENT ON COLUMN public.invoices.payment_date IS 'Fecha de pago';
COMMENT ON COLUMN public.invoices.payment_method IS 'Método de pago';

