import { createClient } from "@/lib/supabase/server";
import type { Estimate } from "@/types";

const PAGE_SIZE = 20;

type GetEstimatesParams = {
  query?: string;
  status?: string;
  projectId?: string;
  page?: number;
};

export async function getEstimates(
  params: GetEstimatesParams = {},
): Promise<{ estimates: Estimate[]; total: number }> {
  const { query, status, projectId, page = 1 } = params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { estimates: [], total: 0 };

  let queryBuilder = supabase
    .from("estimates")
    .select("*, project:projects(id, name, client:clients(id, name))", {
      count: "exact",
    })
    .eq("user_id", user.id);

  if (query) {
    queryBuilder = queryBuilder.or(
      `name.ilike.%${query}%,description.ilike.%${query}%`,
    );
  }

  if (status) {
    queryBuilder = queryBuilder.eq("status", status);
  }

  if (projectId) {
    queryBuilder = queryBuilder.eq("project_id", projectId);
  }

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error, count } = await queryBuilder
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Error fetching estimates", error);
    return { estimates: [], total: 0 };
  }

  return { estimates: (data as Estimate[]) ?? [], total: count ?? 0 };
}

export async function getEstimateById(id: string): Promise<Estimate | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("estimates")
    .select("*, project:projects(id, name, client:clients(id, name))")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("Error fetching estimate", error);
    return null;
  }

  return data as Estimate;
}
