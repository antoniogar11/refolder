import { createClient } from "@/lib/supabase/server";
import type { Project } from "@/types";

const PAGE_SIZE = 20;

type GetProjectsParams = {
  query?: string;
  status?: string;
  page?: number;
};

export async function getProjects(
  params: GetProjectsParams = {},
): Promise<{ projects: Project[]; total: number }> {
  const { query, status, page = 1 } = params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { projects: [], total: 0 };

  let queryBuilder = supabase
    .from("projects")
    .select("*, client:clients(id, name)", { count: "exact" })
    .eq("user_id", user.id);

  if (query) {
    queryBuilder = queryBuilder.or(
      `name.ilike.%${query}%,address.ilike.%${query}%,description.ilike.%${query}%`,
    );
  }

  if (status) {
    queryBuilder = queryBuilder.eq("status", status);
  }

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error, count } = await queryBuilder
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Error fetching projects", error);
    return { projects: [], total: 0 };
  }

  return { projects: (data as Project[]) ?? [], total: count ?? 0 };
}

export async function getProjectById(id: string): Promise<Project | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("projects")
    .select("*, client:clients(id, name)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("Error fetching project", error);
    return null;
  }

  return data as Project;
}

export async function getAllProjects(): Promise<Pick<Project, "id" | "name">[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("projects")
    .select("id, name")
    .eq("user_id", user.id)
    .order("name");

  if (error) {
    console.error("Error fetching projects", error);
    return [];
  }

  return data ?? [];
}
