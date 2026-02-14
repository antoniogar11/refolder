import { createClient } from "@/lib/supabase/server";
import type { Supplier } from "@/types";

const PAGE_SIZE = 20;

type GetSuppliersParams = {
  query?: string;
  page?: number;
};

export async function getSuppliers(
  params: GetSuppliersParams = {},
): Promise<{ suppliers: Supplier[]; total: number }> {
  const { query, page = 1 } = params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { suppliers: [], total: 0 };

  let queryBuilder = supabase
    .from("suppliers")
    .select("*", { count: "exact" })
    .eq("user_id", user.id);

  if (query) {
    queryBuilder = queryBuilder.or(
      `name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%,contact_name.ilike.%${query}%`,
    );
  }

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error, count } = await queryBuilder
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Error fetching suppliers", error);
    return { suppliers: [], total: 0 };
  }

  return { suppliers: data ?? [], total: count ?? 0 };
}

export async function getSupplierById(id: string): Promise<Supplier | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("Error fetching supplier", error);
    return null;
  }

  return data;
}
