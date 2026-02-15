"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createWorkerRateAction(
  data: { nombre: string; tarifa_hora: string },
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "No estás autenticado." };

  const tarifa_hora = parseFloat(data.tarifa_hora);
  if (isNaN(tarifa_hora) || tarifa_hora <= 0) {
    return { success: false, message: "La tarifa debe ser un número positivo." };
  }

  const { error } = await supabase.from("worker_rates").insert({
    user_id: user.id,
    nombre: data.nombre,
    tarifa_hora,
  });

  if (error) {
    console.error("Error creating worker rate", error);
    return { success: false, message: `No se pudo guardar: ${error.message}` };
  }

  revalidatePath("/dashboard/proyectos");
  return { success: true, message: "Tarifa guardada correctamente." };
}

export async function deleteWorkerRateAction(
  rateId: string,
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "No estás autenticado." };

  const { error } = await supabase
    .from("worker_rates")
    .delete()
    .eq("id", rateId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting worker rate", error);
    return { success: false, message: `No se pudo eliminar: ${error.message}` };
  }

  revalidatePath("/dashboard/proyectos");
  return { success: true, message: "Tarifa eliminada." };
}
