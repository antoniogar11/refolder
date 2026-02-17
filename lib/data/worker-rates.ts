import { throwQueryError } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";
import type { WorkerRate } from "@/types";

export async function getWorkerRates(): Promise<WorkerRate[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("worker_rates")
    .select("*")
    .eq("user_id", user.id)
    .order("nombre", { ascending: true });

  if (error) throwQueryError("getWorkerRates", error);

  return data ?? [];
}
