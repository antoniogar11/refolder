import { throwQueryError } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";
import type { Company } from "@/types";

export async function getCompanyByUserId(): Promise<Company | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("owner_id", user.id)
    .single();

  if (error) throwQueryError("getCompanyByUserId", error);

  return data;
}

export async function getOrCreateCompany(): Promise<Company | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Try to get existing company
  const { data: existing } = await supabase
    .from("companies")
    .select("*")
    .eq("owner_id", user.id)
    .single();

  if (existing) return existing;

  // Create new company
  const userName = user.user_metadata?.full_name || "Mi Empresa";
  const { data: created, error } = await supabase
    .from("companies")
    .insert({
      owner_id: user.id,
      name: userName,
    })
    .select("*")
    .single();

  if (error) throwQueryError("getOrCreateCompany", error);

  return created;
}
