import { throwQueryError } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";
import type { WorkType } from "@/types";

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
