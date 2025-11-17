import { createClient } from "@/lib/supabase/server";

export type Client = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  postal_code: string | null;
  tax_id: string | null;
  notes: string | null;
  created_at: string;
};

export async function getClients(): Promise<Client[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .select("id, name, email, phone, address, city, province, postal_code, tax_id, notes, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching clients", error);
    return [];
  }

  return data ?? [];
}

export async function getClientById(id: string): Promise<Client | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("clients")
    .select("id, name, email, phone, address, city, province, postal_code, tax_id, notes, created_at")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("Error fetching client", error);
    return null;
  }

  return data;
}

