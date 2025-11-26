-- Crear tabla companies (empresas)
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(owner_id) -- Un usuario solo puede ser dueño de una empresa
);

-- Habilitar RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver su propia empresa
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

-- Política: Los usuarios pueden crear su propia empresa
CREATE POLICY "Users can create their own company"
  ON public.companies
  FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- Política: Solo el dueño puede actualizar la empresa
CREATE POLICY "Owners can update their company"
  ON public.companies
  FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Política: Solo el dueño puede eliminar la empresa
CREATE POLICY "Owners can delete their company"
  ON public.companies
  FOR DELETE
  USING (owner_id = auth.uid());

-- Crear índices
CREATE INDEX IF NOT EXISTS companies_owner_id_idx ON public.companies(owner_id);
CREATE INDEX IF NOT EXISTS companies_name_idx ON public.companies(name);

-- Crear tabla company_members (miembros de la empresa: admins y trabajadores)
CREATE TABLE IF NOT EXISTS public.company_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'worker')),
  permissions JSONB DEFAULT '{}'::jsonb, -- Permisos personalizados para trabajadores
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(company_id, user_id) -- Un usuario solo puede estar una vez en cada empresa
);

-- Habilitar RLS
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;

-- Política: Los miembros pueden ver los miembros de su empresa
CREATE POLICY "Members can view company members"
  ON public.company_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.company_members cm
      WHERE cm.company_id = company_members.company_id 
      AND cm.user_id = auth.uid()
    )
  );

-- Política: Solo admins y el dueño pueden añadir miembros
CREATE POLICY "Admins can add members"
  ON public.company_members
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.companies
      WHERE id = company_members.company_id AND owner_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.company_members
      WHERE company_id = company_members.company_id 
      AND user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Política: Solo admins y el dueño pueden actualizar miembros
CREATE POLICY "Admins can update members"
  ON public.company_members
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.companies
      WHERE id = company_members.company_id AND owner_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.company_members
      WHERE company_id = company_members.company_id 
      AND user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Política: Solo admins y el dueño pueden eliminar miembros
CREATE POLICY "Admins can delete members"
  ON public.company_members
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.companies
      WHERE id = company_members.company_id AND owner_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.company_members
      WHERE company_id = company_members.company_id 
      AND user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Crear índices
CREATE INDEX IF NOT EXISTS company_members_company_id_idx ON public.company_members(company_id);
CREATE INDEX IF NOT EXISTS company_members_user_id_idx ON public.company_members(user_id);
CREATE INDEX IF NOT EXISTS company_members_role_idx ON public.company_members(role);

-- Función helper para obtener la empresa del usuario
CREATE OR REPLACE FUNCTION public.get_user_company(user_uuid UUID)
RETURNS UUID AS $$
  SELECT company_id FROM public.companies WHERE owner_id = user_uuid
  UNION
  SELECT company_id FROM public.company_members WHERE user_id = user_uuid
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Función helper para verificar si un usuario es admin de una empresa
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


