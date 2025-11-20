-- ============================================
-- SCRIPT PASO A PASO - EJECUTA ESTE
-- ============================================
-- Este script verifica y crea las tablas en el orden correcto

-- PASO 1: Verificar si clients existe, si no, crearla
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

-- Habilitar RLS para clients
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'clients') THEN
    ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Eliminar políticas existentes de clients
DROP POLICY IF EXISTS "Users can view their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can insert their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can update their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can delete their own clients" ON public.clients;

-- Crear políticas para clients
CREATE POLICY "Users can view their own clients" ON public.clients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own clients" ON public.clients FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own clients" ON public.clients FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own clients" ON public.clients FOR DELETE USING (auth.uid() = user_id);

-- Crear índices para clients
CREATE INDEX IF NOT EXISTS clients_user_id_idx ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS clients_name_idx ON public.clients(name);
CREATE INDEX IF NOT EXISTS clients_email_idx ON public.clients(email);

-- PASO 2: Ahora que clients existe, crear finance_transactions
-- Primero eliminar la tabla si existe y tiene problemas
DROP TABLE IF EXISTS public.finance_transactions CASCADE;

-- Crear tabla finance_transactions
CREATE TABLE public.finance_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  description TEXT,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT CHECK (payment_method IN ('cash', 'bank_transfer', 'card', 'check', 'other')),
  reference TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Habilitar RLS para finance_transactions
ALTER TABLE public.finance_transactions ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes de finance_transactions
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.finance_transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.finance_transactions;
DROP POLICY IF EXISTS "Users can update their own transactions" ON public.finance_transactions;
DROP POLICY IF EXISTS "Users can delete their own transactions" ON public.finance_transactions;

-- Crear políticas para finance_transactions
CREATE POLICY "Users can view their own transactions" ON public.finance_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own transactions" ON public.finance_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own transactions" ON public.finance_transactions FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own transactions" ON public.finance_transactions FOR DELETE USING (auth.uid() = user_id);

-- Crear índices para finance_transactions
CREATE INDEX IF NOT EXISTS finance_transactions_user_id_idx ON public.finance_transactions(user_id);
CREATE INDEX IF NOT EXISTS finance_transactions_project_id_idx ON public.finance_transactions(project_id);
CREATE INDEX IF NOT EXISTS finance_transactions_client_id_idx ON public.finance_transactions(client_id);
CREATE INDEX IF NOT EXISTS finance_transactions_type_idx ON public.finance_transactions(type);
CREATE INDEX IF NOT EXISTS finance_transactions_category_idx ON public.finance_transactions(category);
CREATE INDEX IF NOT EXISTS finance_transactions_transaction_date_idx ON public.finance_transactions(transaction_date);

-- ✅ Listo! Las tablas deberían estar creadas correctamente ahora.

