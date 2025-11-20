/**
 * Script para ejecutar el SQL de setup automáticamente en Supabase
 * 
 * Para obtener la SERVICE_ROLE_KEY:
 * 1. Ve a https://supabase.com/dashboard/project/rnuosfoxruutkmfzwvzr/settings/api
 * 2. Copia la "service_role" key (NO la anon key)
 * 3. Ejecuta: SERVICE_ROLE_KEY=tu_key node scripts/setup-database.js
 */

const https = require('https');

const SUPABASE_URL = 'https://rnuosfoxruutkmfzwvzr.supabase.co';
const SERVICE_ROLE_KEY = process.env.SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('❌ Error: Necesitas proporcionar la SERVICE_ROLE_KEY');
  console.log('\nPara obtenerla:');
  console.log('1. Ve a: https://supabase.com/dashboard/project/rnuosfoxruutkmfzwvzr/settings/api');
  console.log('2. Copia la "service_role" key (la secreta, NO la anon key)');
  console.log('3. Ejecuta: SERVICE_ROLE_KEY=tu_key node scripts/setup-database.js\n');
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

function executeSQL() {
  return new Promise((resolve, reject) => {
    const url = new URL(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`);
    
    const postData = JSON.stringify({
      query: SQL_SCRIPT
    });

    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Intentar ejecutar usando la API de Supabase directamente
async function run() {
  console.log('🚀 Intentando ejecutar el script SQL en Supabase...\n');
  
  try {
    // Primero intentar con la API REST directa
    const result = await executeSQL();
    console.log('✅ ¡Script ejecutado exitosamente!');
    console.log(result);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n⚠️  La API REST no está disponible. Usando método alternativo...\n');
    console.log('Por favor, ejecuta el SQL manualmente en Supabase SQL Editor.');
    console.log('O proporciona la SERVICE_ROLE_KEY para intentar otro método.\n');
  }
}

run();

