import { createAdminClient } from "@/lib/supabase/admin";
import type { Estimate, EstimateItem, Company } from "@/types";

type SharedEstimateData = {
  estimate: Estimate;
  items: EstimateItem[];
  company: Company | null;
};

/**
 * Fetches a shared estimate by its share token.
 * Uses the admin client to bypass RLS (public access, no auth).
 * Returns null if the token is invalid or estimate is not shared.
 */
export async function getSharedEstimate(
  shareToken: string,
): Promise<SharedEstimateData | null> {
  const supabase = createAdminClient();

  // Fetch estimate by share_token
  const { data: estimate, error: estimateError } = await supabase
    .from("estimates")
    .select(
      "*, project:projects!estimates_project_id_fkey(id, name, address, client:clients(id, name, address, city, province, postal_code, tax_id)), client:clients!estimates_client_id_fkey(id, name, address, city, province, postal_code, tax_id)",
    )
    .eq("share_token", shareToken)
    .single();

  if (estimateError || !estimate) {
    return null;
  }

  // Fetch items
  const { data: items } = await supabase
    .from("estimate_items")
    .select("*")
    .eq("estimate_id", estimate.id)
    .order("orden", { ascending: true });

  // Fetch company data (from the estimate owner)
  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("owner_id", estimate.user_id)
    .single();

  return {
    estimate: estimate as Estimate,
    items: (items as EstimateItem[]) ?? [],
    company: (company as Company) ?? null,
  };
}
