"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ZoneInput = {
  name: string;
  largo?: number | null;
  ancho?: number | null;
  alto?: number | null;
  notes?: string | null;
  works: { work_type: string; notes?: string | null }[];
};

type CreateSiteVisitInput = {
  client_id?: string | null;
  address: string;
  visit_date: string;
  general_notes?: string | null;
  zones: ZoneInput[];
};

export async function createSiteVisitAction(
  data: CreateSiteVisitInput,
): Promise<{ success: boolean; message: string; visitId?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "No autenticado." };
  }

  if (!data.address.trim()) {
    return { success: false, message: "La direccion es obligatoria." };
  }

  // 1. Insert site_visit
  const { data: visit, error: visitError } = await supabase
    .from("site_visits")
    .insert({
      user_id: user.id,
      client_id: data.client_id || null,
      address: data.address.trim(),
      visit_date: data.visit_date,
      general_notes: data.general_notes?.trim() || null,
    })
    .select("id")
    .single();

  if (visitError || !visit) {
    console.error("Error creating site visit:", visitError);
    return { success: false, message: "Error al crear la visita." };
  }

  // 2. Insert zones and their works
  for (let i = 0; i < data.zones.length; i++) {
    const zone = data.zones[i];

    const { data: zoneData, error: zoneError } = await supabase
      .from("site_visit_zones")
      .insert({
        site_visit_id: visit.id,
        name: zone.name.trim(),
        largo: zone.largo || null,
        ancho: zone.ancho || null,
        alto: zone.alto || null,
        notes: zone.notes?.trim() || null,
        sort_order: i,
      })
      .select("id")
      .single();

    if (zoneError || !zoneData) {
      console.error("Error creating zone:", zoneError);
      continue;
    }

    // 3. Insert works for this zone
    if (zone.works.length > 0) {
      const worksToInsert = zone.works.map((w) => ({
        zone_id: zoneData.id,
        work_type: w.work_type,
        notes: w.notes?.trim() || null,
      }));

      const { error: worksError } = await supabase
        .from("site_visit_zone_works")
        .insert(worksToInsert);

      if (worksError) {
        console.error("Error creating zone works:", worksError);
      }
    }
  }

  revalidatePath("/dashboard/visitas");

  return {
    success: true,
    message: "Visita creada correctamente.",
    visitId: visit.id,
  };
}

export async function updateSiteVisitAction(
  visitId: string,
  data: CreateSiteVisitInput,
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "No autenticado." };
  }

  // Update visit header
  const { error: updateError } = await supabase
    .from("site_visits")
    .update({
      client_id: data.client_id || null,
      address: data.address.trim(),
      visit_date: data.visit_date,
      general_notes: data.general_notes?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", visitId)
    .eq("user_id", user.id);

  if (updateError) {
    console.error("Error updating site visit:", updateError);
    return { success: false, message: "Error al actualizar la visita." };
  }

  // Delete existing zones (cascade deletes works and photos)
  await supabase
    .from("site_visit_zones")
    .delete()
    .eq("site_visit_id", visitId);

  // Re-insert zones and works
  for (let i = 0; i < data.zones.length; i++) {
    const zone = data.zones[i];

    const { data: zoneData, error: zoneError } = await supabase
      .from("site_visit_zones")
      .insert({
        site_visit_id: visitId,
        name: zone.name.trim(),
        largo: zone.largo || null,
        ancho: zone.ancho || null,
        alto: zone.alto || null,
        notes: zone.notes?.trim() || null,
        sort_order: i,
      })
      .select("id")
      .single();

    if (zoneError || !zoneData) continue;

    if (zone.works.length > 0) {
      await supabase
        .from("site_visit_zone_works")
        .insert(
          zone.works.map((w) => ({
            zone_id: zoneData.id,
            work_type: w.work_type,
            notes: w.notes?.trim() || null,
          })),
        );
    }
  }

  revalidatePath("/dashboard/visitas");
  revalidatePath(`/dashboard/visitas/${visitId}`);

  return { success: true, message: "Visita actualizada correctamente." };
}

export async function deleteSiteVisitAction(
  visitId: string,
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "No autenticado." };
  }

  const { error } = await supabase
    .from("site_visits")
    .delete()
    .eq("id", visitId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting site visit:", error);
    return { success: false, message: "Error al eliminar la visita." };
  }

  revalidatePath("/dashboard/visitas");

  return { success: true, message: "Visita eliminada correctamente." };
}

export async function linkEstimateToVisitAction(
  visitId: string,
  estimateId: string,
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "No autenticado." };
  }

  const { error } = await supabase
    .from("site_visits")
    .update({
      estimate_id: estimateId,
      status: "presupuestado",
      updated_at: new Date().toISOString(),
    })
    .eq("id", visitId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error linking estimate to visit:", error);
    return { success: false, message: "Error al vincular el presupuesto." };
  }

  revalidatePath("/dashboard/visitas");
  revalidatePath(`/dashboard/visitas/${visitId}`);

  return { success: true, message: "Presupuesto vinculado a la visita." };
}
