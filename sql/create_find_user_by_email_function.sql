-- Función para buscar un usuario por email
-- Esta función permite a los admins buscar usuarios para añadirlos a su empresa
-- Requiere permisos de administrador de Supabase

CREATE OR REPLACE FUNCTION public.find_user_by_email(search_email TEXT)
RETURNS TABLE (
  id UUID,
  email TEXT,
  created_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar que el usuario que llama a la función es admin de una empresa
  IF NOT EXISTS (
    SELECT 1 FROM public.companies 
    WHERE owner_id = auth.uid()
    UNION
    SELECT 1 FROM public.company_members
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Solo los administradores pueden buscar usuarios';
  END IF;

  -- Buscar usuario en auth.users
  -- Nota: Esto requiere acceso a auth.users, que normalmente no está disponible
  -- En producción, considera usar la API de admin de Supabase desde el cliente
  -- o crear una función que use la SERVICE_ROLE_KEY
  
  -- Por ahora, retornamos una tabla vacía
  -- Esta función debe ser implementada usando la API de admin de Supabase
  RETURN QUERY
  SELECT NULL::UUID, NULL::TEXT, NULL::TIMESTAMPTZ
  WHERE FALSE;
END;
$$;

-- Alternativa: Crear una función que use una tabla de usuarios públicos
-- Si quieres que los usuarios puedan ser encontrados, considera crear una tabla
-- que se sincronice con auth.users usando triggers


