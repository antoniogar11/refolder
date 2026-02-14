import { createClient } from "@/lib/supabase/server";
import type { EstimateItem } from "@/types";

export async function getEstimateItems(estimateId: string): Promise<EstimateItem[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("estimate_items")
    .select("*")
    .eq("estimate_id", estimateId)
    .order("orden", { ascending: true });

  if (error) {
    console.error("Error fetching estimate items", error);
    return [];
  }

  return data ?? [];
}

export async function createEstimateItems(
  estimateId: string,
  items: Omit<EstimateItem, "id" | "estimate_id" | "created_at">[]
): Promise<boolean> {
  const supabase = await createClient();

  const rows = items.map((item, index) => ({
    estimate_id: estimateId,
    categoria: item.categoria,
    descripcion: item.descripcion,
    unidad: item.unidad,
    cantidad: item.cantidad,
    precio_unitario: item.precio_unitario,
    subtotal: item.subtotal,
    orden: item.orden ?? index,
  }));

  const { error } = await supabase.from("estimate_items").insert(rows);

  if (error) {
    console.error("Error creating estimate items", error);
    return false;
  }

  return true;
}

export async function deleteEstimateItemsByEstimateId(estimateId: string): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("estimate_items")
    .delete()
    .eq("estimate_id", estimateId);

  if (error) {
    console.error("Error deleting estimate items", error);
    return false;
  }
  return true;
}
