import { throwQueryError } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";
import type { ProjectTask } from "@/types";

export async function getTasksByProjectId(projectId: string): Promise<ProjectTask[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("project_tasks")
    .select("*")
    .eq("project_id", projectId)
    .eq("user_id", user.id)
    .order("orden", { ascending: true });

  if (error) throwQueryError("getTasksByProjectId", error);

  return data ?? [];
}
