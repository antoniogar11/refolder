import { throwQueryError } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";
import type { SiteVisit, SiteVisitZone, WorkType } from "@/types";

const PAGE_SIZE = 10;

type GetSiteVisitsParams = {
  query?: string;
  status?: string;
  page?: number;
};

export async function getSiteVisits(
  params: GetSiteVisitsParams = {},
): Promise<{ visits: SiteVisit[]; total: number }> {
  const { query, status, page = 1 } = params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { visits: [], total: 0 };

  let queryBuilder = supabase
    .from("site_visits")
    .select("*, client:clients(id, name)", { count: "exact" })
    .eq("user_id", user.id);

  if (query) {
    queryBuilder = queryBuilder.or(
      `address.ilike.%${query}%,general_notes.ilike.%${query}%`,
    );
  }

  if (status) {
    queryBuilder = queryBuilder.eq("status", status);
  }

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error, count } = await queryBuilder
    .order("visit_date", { ascending: false })
    .range(from, to);

  if (error) throwQueryError("getSiteVisits", error);

  return {
    visits: (data ?? []).map((row) => ({
      ...row,
      client: Array.isArray(row.client) ? row.client[0] ?? null : row.client ?? null,
    })) as SiteVisit[],
    total: count ?? 0,
  };
}

export async function getSiteVisitById(id: string): Promise<SiteVisit | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch the visit with client, estimate and project relations
  const { data: visit, error } = await supabase
    .from("site_visits")
    .select("*, client:clients(id, name), estimate:estimates!site_visits_estimate_id_fkey(id, name), project:projects!site_visits_project_id_fkey(id, name)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) throwQueryError("getSiteVisitById", error);
  if (!visit) return null;

  // Fetch zones with works
  const { data: zones } = await supabase
    .from("site_visit_zones")
    .select("*, works:site_visit_zone_works(*)")
    .eq("site_visit_id", id)
    .order("sort_order");

  const normalizedVisit: SiteVisit = {
    ...visit,
    client: Array.isArray(visit.client) ? visit.client[0] ?? null : visit.client ?? null,
    estimate: Array.isArray(visit.estimate) ? visit.estimate[0] ?? null : visit.estimate ?? null,
    project: Array.isArray(visit.project) ? visit.project[0] ?? null : visit.project ?? null,
    zones: (zones ?? []) as SiteVisitZone[],
  };
  return normalizedVisit;
}

export async function getWorkTypes(): Promise<WorkType[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("work_types")
    .select("*")
    .or(`user_id.is.null,user_id.eq.${user.id}`)
    .order("is_default", { ascending: false })
    .order("name");

  if (error) throwQueryError("getWorkTypes", error);

  return (data as WorkType[]) ?? [];
}
