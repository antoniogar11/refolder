/**
 * Script para ejecutar el SQL de setup automáticamente en Supabase
 * 
 * INSTRUCCIONES:
 * 1. Ve a: https://supabase.com/dashboard/project/rnuosfoxruutkmfzwvzr/settings/api
 * 2. Copia la "service_role" key (la secreta, NO la anon key)
 * 3. Ejecuta: SERVICE_ROLE_KEY=tu_key npm run setup-db
 */

// Usar fetch nativo de Node.js 18+

const SUPABASE_URL = 'https://rnuosfoxruutkmfzwvzr.supabase.co';
const SERVICE_ROLE_KEY = process.env.SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('❌ Error: Necesitas proporcionar la SERVICE_ROLE_KEY');
  console.log('\n📋 Para obtenerla:');
  console.log('1. Ve a: https://supabase.com/dashboard/project/rnuosfoxruutkmfzwvzr/settings/api');
  console.log('2. Copia la "service_role" key (la secreta, NO la anon key)');
  console.log('3. Ejecuta: SERVICE_ROLE_KEY=tu_key npm run setup-db\n');
  process.exit(1);
}

const SQL_SCRIPT = `
-- 1. Crear tabla clients
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

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can insert their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can update their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can delete their own clients" ON public.clients;

CREATE POLICY "Users can view their own clients" ON public.clients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own clients" ON public.clients FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own clients" ON public.clients FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own clients" ON public.clients FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS clients_user_id_idx ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS clients_name_idx ON public.clients(name);
CREATE INDEX IF NOT EXISTS clients_email_idx ON public.clients(email);

-- 2. Crear tabla finance_transactions
CREATE TABLE IF NOT EXISTS public.finance_transactions (
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

ALTER TABLE public.finance_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own transactions" ON public.finance_transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.finance_transactions;
DROP POLICY IF EXISTS "Users can update their own transactions" ON public.finance_transactions;
DROP POLICY IF EXISTS "Users can delete their own transactions" ON public.finance_transactions;

CREATE POLICY "Users can view their own transactions" ON public.finance_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own transactions" ON public.finance_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own transactions" ON public.finance_transactions FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own transactions" ON public.finance_transactions FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS finance_transactions_user_id_idx ON public.finance_transactions(user_id);
CREATE INDEX IF NOT EXISTS finance_transactions_project_id_idx ON public.finance_transactions(project_id);
CREATE INDEX IF NOT EXISTS finance_transactions_client_id_idx ON public.finance_transactions(client_id);
CREATE INDEX IF NOT EXISTS finance_transactions_type_idx ON public.finance_transactions(type);
CREATE INDEX IF NOT EXISTS finance_transactions_category_idx ON public.finance_transactions(category);
CREATE INDEX IF NOT EXISTS finance_transactions_transaction_date_idx ON public.finance_transactions(transaction_date);
`;

async function executeSQL() {
  console.log('🚀 Intentando ejecutar SQL en Supabase...\n');
  
  try {
    // Intentar usar la API de Supabase Management (si está disponible)
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ query: SQL_SCRIPT }),
    });

    if (response.ok) {
      const result = await response.text();
      console.log('✅ ¡Script ejecutado exitosamente!');
      console.log(result);
      return true;
    } else {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
  } catch (error) {
    console.error('❌ Error al ejecutar SQL:', error.message);
    console.log('\n⚠️  La API REST no permite ejecutar SQL directamente por seguridad.');
    console.log('💡 Necesitas ejecutar el SQL manualmente en Supabase SQL Editor.\n');
    console.log('📝 El SQL está guardado en: sql/QUICK_SETUP.sql\n');
    return false;
  }
}

executeSQL();
