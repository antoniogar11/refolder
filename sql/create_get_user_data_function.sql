-- ============================================
-- FUNCIÓN RPC PARA OBTENER DATOS DE USUARIOS
-- Esta función permite obtener email y nombre desde auth.users
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

-- Esta función requiere SECURITY DEFINER para poder leer desde auth.users
-- Solo devuelve datos públicos (email, name) que cualquier usuario puede ver

