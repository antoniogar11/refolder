-- Insertar 3 clientes de ejemplo
-- Este script usa el primer usuario de tu proyecto
-- Si quieres usar otro usuario, reemplaza el user_id

INSERT INTO public.clients (
  user_id,
  name,
  email,
  phone,
  address,
  city,
  province,
  postal_code,
  tax_id,
  notes
) VALUES
  (
    (SELECT id FROM auth.users LIMIT 1),
    'Juan Pérez García',
    'juan.perez@ejemplo.com',
    '+34 600 123 456',
    'Calle Mayor 15, 3º B',
    'Madrid',
    'Madrid',
    '28001',
    '12345678A',
    'Cliente preferente. Le gusta recibir presupuestos detallados por email.'
  ),
  (
    (SELECT id FROM auth.users LIMIT 1),
    'María López Sánchez',
    'maria.lopez@ejemplo.com',
    '+34 611 234 567',
    'Avenida de la Constitución 42',
    'Barcelona',
    'Barcelona',
    '08001',
    'B87654321',
    'Empresa de construcción. Necesita facturas con CIF.'
  ),
  (
    (SELECT id FROM auth.users LIMIT 1),
    'Carlos Martínez Ruiz',
    'carlos.martinez@ejemplo.com',
    '+34 622 345 678',
    'Plaza del Sol 8, 1º',
    'Valencia',
    'Valencia',
    '46001',
    '45678912B',
    'Particular. Prefiere contacto por teléfono. Disponible por las tardes.'
  );

