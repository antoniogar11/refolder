-- La funcion anterior solo borraba sin argumentos, hay que buscar con la signature correcta
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN 
    SELECT oid::regprocedure AS func_sig
    FROM pg_proc
    WHERE proname = 'generate_invoice_number'
      AND pronamespace = 'public'::regnamespace
  LOOP
    EXECUTE 'DROP FUNCTION ' || r.func_sig || ' CASCADE';
  END LOOP;
  
  FOR r IN 
    SELECT oid::regprocedure AS func_sig
    FROM pg_proc
    WHERE proname = 'calculate_duration_minutes'
      AND pronamespace = 'public'::regnamespace
  LOOP
    EXECUTE 'DROP FUNCTION ' || r.func_sig || ' CASCADE';
  END LOOP;
END $$;
