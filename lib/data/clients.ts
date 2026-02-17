import { throwQueryError } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";
import type { Client } from "@/types";

export type { Client };

const PAGE_SIZE = 20;

type GetClientsParams = {
  query?: string;
  page?: number;
};

export async function getClients(
  params: GetClientsParams = {},
): Promise<{ clients: Client[]; total: number }> {
  const { query, page = 1 } = params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { clients: [], total: 0 };

  let queryBuilder = supabase
    .from("clients")
    .select("*", { count: "exact" })
    .eq("user_id", user.id);

  if (query) {
    queryBuilder = queryBuilder.or(
      `name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%,city.ilike.%${query}%,tax_id.ilike.%${query}%`,
    );
  }

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error, count } = await queryBuilder
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throwQueryError("getClients", error);

  return { clients: data ?? [], total: count ?? 0 };
}

export async function getClientById(id: string): Promise<Client | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) throwQueryError("getClientById", error);

  return data;
}

export async function getAllClients(): Promise<Pick<Client, "id" | "name">[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("clients")
    .select("id, name")
    .eq("user_id", user.id)
    .order("name");

  if (error) throwQueryError("getAllClients", error);

  return data ?? [];
}
