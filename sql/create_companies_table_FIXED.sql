-- ============================================
-- SCRIPT CORREGIDO - Sin recursión infinita en políticas RLS
-- ============================================

-- PASO 1: Crear tabla companies
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(owner_id)
);

-- PASO 2: Crear tabla company_members (antes de las políticas que la referencian)
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

-- PASO 3: Habilitar RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;

-- PASO 4: Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Users can view their own company" ON public.companies;
DROP POLICY IF EXISTS "Users can create their own company" ON public.companies;
DROP POLICY IF EXISTS "Owners can update their company" ON public.companies;
DROP POLICY IF EXISTS "Owners can delete their company" ON public.companies;

DROP POLICY IF EXISTS "Members can view company members" ON public.company_members;
DROP POLICY IF EXISTS "Admins can add members" ON public.company_members;
DROP POLICY IF EXISTS "Admins can update members" ON public.company_members;
DROP POLICY IF EXISTS "Admins can delete members" ON public.company_members;

-- PASO 5: Crear funciones helper (SECURITY DEFINER evita recursión)
-- IMPORTANTE: Estas funciones se ejecutan con permisos elevados,
-- evitando pasar por RLS y previniendo recursión infinita

-- Función para verificar si es miembro o dueño
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

-- Función para verificar si es admin (dueño o admin miembro)
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

-- PASO 6: Crear políticas para companies
CREATE POLICY "Users can view their own company"
  ON public.companies
  FOR SELECT
  USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.company_members
      WHERE company_id = companies.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own company"
  ON public.companies
  FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update their company"
  ON public.companies
  FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can delete their company"
  ON public.companies
  FOR DELETE
  USING (owner_id = auth.uid());

-- PASO 7: Crear políticas para company_members (SIN RECURSIÓN)
-- IMPORTANTE: Usamos función SECURITY DEFINER para evitar recursión infinita
CREATE POLICY "Members can view company members"
  ON public.company_members
  FOR SELECT
  USING (
    -- Usar función helper SECURITY DEFINER que puede leer company_members
    -- sin pasar por RLS, evitando recursión infinita
    public.is_company_member_or_owner(company_members.company_id, auth.uid())
  );

CREATE POLICY "Admins can add members"
  ON public.company_members
  FOR INSERT
  WITH CHECK (
    public.is_company_admin_check(company_members.company_id, auth.uid())
  );

CREATE POLICY "Admins can update members"
  ON public.company_members
  FOR UPDATE
  USING (
    public.is_company_admin_check(company_members.company_id, auth.uid())
  )
  WITH CHECK (
    public.is_company_admin_check(company_members.company_id, auth.uid())
  );

CREATE POLICY "Admins can delete members"
  ON public.company_members
  FOR DELETE
  USING (
    public.is_company_admin_check(company_members.company_id, auth.uid())
  );

-- PASO 8: Crear índices
CREATE INDEX IF NOT EXISTS companies_owner_id_idx ON public.companies(owner_id);
CREATE INDEX IF NOT EXISTS companies_name_idx ON public.companies(name);
CREATE INDEX IF NOT EXISTS company_members_company_id_idx ON public.company_members(company_id);
CREATE INDEX IF NOT EXISTS company_members_user_id_idx ON public.company_members(user_id);
CREATE INDEX IF NOT EXISTS company_members_role_idx ON public.company_members(role);

-- PASO 9: Crear funciones helper adicionales
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

-- ✅ Listo! Las políticas ya no causarán recursión infinita.
