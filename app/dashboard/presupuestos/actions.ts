"use server";

import { revalidatePath } from "next/cache";

import type { FormState } from "@/lib/forms/form-state";
import { zodErrorsToFormState } from "@/lib/forms/form-state";
import { parseFormData } from "@/lib/forms/parse";
import { createClient } from "@/lib/supabase/server";
import { roundCurrency } from "@/lib/utils";
import { estimateSchema } from "@/lib/validations/estimate";

export async function createEstimateAction(
  _: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = estimateSchema.safeParse(parseFormData(formData));

  if (!parsed.success) {
    return zodErrorsToFormState(parsed.error.issues);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "No estás autenticado." };
  }

  const { error } = await supabase.from("estimates").insert({
    ...parsed.data,
    user_id: user.id,
  });

  if (error) {
    console.error("Error creating estimate", error);
    return { status: "error", message: `No se pudo crear el presupuesto: ${error.message}` };
  }

  revalidatePath("/dashboard/presupuestos");
  return { status: "success", message: "Presupuesto creado correctamente." };
}

export async function updateEstimateAction(
  estimateId: string,
  _: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = estimateSchema.safeParse(parseFormData(formData));

  if (!parsed.success) {
    return zodErrorsToFormState(parsed.error.issues);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "No estás autenticado." };
  }

  const { error } = await supabase
    .from("estimates")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", estimateId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error updating estimate", error);
    return { status: "error", message: `No se pudo actualizar el presupuesto: ${error.message}` };
  }

  revalidatePath("/dashboard/presupuestos");
  revalidatePath(`/dashboard/presupuestos/${estimateId}`);
  return { status: "success", message: "Presupuesto actualizado correctamente." };
}

export async function deleteEstimateAction(
  estimateId: string,
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "No estás autenticado." };
  }

  const { error } = await supabase
    .from("estimates")
    .delete()
    .eq("id", estimateId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting estimate", error);
    return { success: false, message: `No se pudo eliminar el presupuesto: ${error.message}` };
  }

  revalidatePath("/dashboard/presupuestos");
  return { success: true, message: "Presupuesto eliminado correctamente." };
}

export async function createEstimateWithItemsAction(
  projectId: string | null,
  clientId: string | null,
  name: string,
  description: string,
  items: { categoria: string; descripcion: string; unidad: string; cantidad: number; precio_unitario: number; subtotal: number; orden: number }[],
  totalAmount: number,
  idempotencyKey?: string,
): Promise<{ success: boolean; message: string; estimateId?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "No estás autenticado." };
  }

  // Intentar la creación atómica via RPC
  const { data: rpcResult, error: rpcError } = await supabase.rpc(
    "create_estimate_with_items",
    {
      p_user_id: user.id,
      p_name: name,
      p_description: description,
      p_total_amount: totalAmount,
      p_client_id: clientId || null,
      p_project_id: projectId || null,
      p_idempotency_key: idempotencyKey || null,
      p_items: JSON.stringify(items),
    },
  );

  if (rpcError) {
    console.error("Error creating estimate (RPC)", rpcError);

    // Fallback: creación no-atómica si la función RPC no existe aún
    if (rpcError.message?.includes("function") && rpcError.message?.includes("does not exist")) {
      return createEstimateWithItemsFallback(supabase, user.id, projectId, clientId, name, description, items, totalAmount);
    }

    return { success: false, message: `No se pudo crear el presupuesto: ${rpcError.message}` };
  }

  const result = rpcResult as { success: boolean; message: string; estimateId: string };

  revalidatePath("/dashboard/presupuestos");
  if (projectId) {
    revalidatePath(`/dashboard/proyectos/${projectId}`);
  }
  return { success: result.success, message: result.message, estimateId: result.estimateId };
}

// Fallback no-atómico para cuando la función RPC aún no se ha desplegado
async function createEstimateWithItemsFallback(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  projectId: string | null,
  clientId: string | null,
  name: string,
  description: string,
  items: { categoria: string; descripcion: string; unidad: string; cantidad: number; precio_unitario: number; subtotal: number; orden: number }[],
  totalAmount: number,
): Promise<{ success: boolean; message: string; estimateId?: string }> {
  const insertData: Record<string, unknown> = {
    user_id: userId,
    name,
    description,
    total_amount: totalAmount,
    status: "draft",
  };

  if (clientId) insertData.client_id = clientId;
  if (projectId) insertData.project_id = projectId;

  const { data: estimate, error: estimateError } = await supabase
    .from("estimates")
    .insert(insertData)
    .select("id")
    .single();

  if (estimateError || !estimate) {
    console.error("Error creating estimate (fallback)", estimateError);
    return { success: false, message: `No se pudo crear el presupuesto: ${estimateError?.message}` };
  }

  if (items.length > 0) {
    const rows = items.map((item, index) => ({
      estimate_id: estimate.id,
      categoria: item.categoria,
      descripcion: item.descripcion,
      unidad: item.unidad,
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario,
      subtotal: item.subtotal,
      orden: item.orden ?? index,
    }));

    const { error: itemsError } = await supabase.from("estimate_items").insert(rows);
    if (itemsError) {
      console.error("Error creating estimate items (fallback)", itemsError);
      await supabase.from("estimates").delete().eq("id", estimate.id);
      return { success: false, message: "Error al guardar las partidas del presupuesto." };
    }
  }

  revalidatePath("/dashboard/presupuestos");
  if (projectId) {
    revalidatePath(`/dashboard/proyectos/${projectId}`);
  }
  return { success: true, message: "Presupuesto creado correctamente.", estimateId: estimate.id };
}

export async function updateEstimateItemAction(
  itemId: string,
  data: { cantidad?: number; precio_unitario?: number; descripcion?: string; categoria?: string; unidad?: string },
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "No estás autenticado." };

  const subtotal = (data.cantidad ?? 0) * (data.precio_unitario ?? 0);
  const updateData = { ...data, subtotal: roundCurrency(subtotal) };

  const { error } = await supabase
    .from("estimate_items")
    .update(updateData)
    .eq("id", itemId);

  if (error) {
    console.error("Error updating estimate item", error);
    return { success: false, message: error.message };
  }

  return { success: true, message: "Partida actualizada." };
}

export async function addEstimateItemAction(
  estimateId: string,
  item: { categoria: string; descripcion: string; unidad: string; cantidad: number; precio_unitario: number; orden: number },
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "No estás autenticado." };

  const subtotal = roundCurrency(item.cantidad * item.precio_unitario);

  const { error } = await supabase.from("estimate_items").insert({
    estimate_id: estimateId,
    ...item,
    subtotal,
  });

  if (error) {
    console.error("Error adding estimate item", error);
    return { success: false, message: error.message };
  }

  revalidatePath(`/dashboard/presupuestos/${estimateId}`);
  return { success: true, message: "Partida añadida." };
}

export async function deleteEstimateItemAction(
  itemId: string,
  estimateId: string,
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "No estás autenticado." };

  const { error } = await supabase.from("estimate_items").delete().eq("id", itemId);

  if (error) {
    console.error("Error deleting estimate item", error);
    return { success: false, message: error.message };
  }

  revalidatePath(`/dashboard/presupuestos/${estimateId}`);
  return { success: true, message: "Partida eliminada." };
}

export async function updateEstimateStatusAction(
  estimateId: string,
  status: string,
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "No estás autenticado." };

  const { error } = await supabase
    .from("estimates")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", estimateId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error updating estimate status", error);
    return { success: false, message: error.message };
  }

  revalidatePath("/dashboard/presupuestos");
  revalidatePath(`/dashboard/presupuestos/${estimateId}`);
  return { success: true, message: "Estado actualizado." };
}

export async function updateEstimateTotalAction(
  estimateId: string,
  totalAmount: number,
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "No estás autenticado." };

  const { error } = await supabase
    .from("estimates")
    .update({ total_amount: totalAmount, updated_at: new Date().toISOString() })
    .eq("id", estimateId)
    .eq("user_id", user.id);

  if (error) return { success: false, message: error.message };
  return { success: true, message: "Total actualizado." };
}
