"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createHourAction(
  projectId: string,
  data: {
    descripcion: string;
    categoria_trabajador: string;
    tarifa_hora: string;
    horas: string;
    fecha: string;
    notas: string;
    task_id?: string;
  },
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "No estás autenticado." };

  const tarifa_hora = parseFloat(data.tarifa_hora);
  const horas = parseFloat(data.horas);

  if (isNaN(tarifa_hora) || tarifa_hora <= 0) {
    return { success: false, message: "La tarifa debe ser un número positivo." };
  }
  if (isNaN(horas) || horas <= 0) {
    return { success: false, message: "Las horas deben ser un número positivo." };
  }

  const { error } = await supabase.from("project_hours").insert({
    project_id: projectId,
    user_id: user.id,
    descripcion: data.descripcion,
    categoria_trabajador: data.categoria_trabajador,
    tarifa_hora,
    horas,
    fecha: data.fecha,
    notas: data.notas || null,
    task_id: data.task_id || null,
  });

  if (error) {
    console.error("Error creating hour entry", error);
    return { success: false, message: `No se pudo guardar: ${error.message}` };
  }

  revalidatePath(`/dashboard/proyectos/${projectId}`);
  revalidatePath("/dashboard");
  return { success: true, message: "Horas registradas correctamente." };
}

export async function deleteHourAction(
  hourId: string,
  projectId: string,
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "No estás autenticado." };

  const { error } = await supabase
    .from("project_hours")
    .delete()
    .eq("id", hourId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting hour entry", error);
    return { success: false, message: `No se pudo eliminar: ${error.message}` };
  }

  revalidatePath(`/dashboard/proyectos/${projectId}`);
  return { success: true, message: "Registro de horas eliminado." };
}
