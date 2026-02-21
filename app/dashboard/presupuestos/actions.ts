"use server";

import { revalidatePath } from "next/cache";

import type { FormState } from "@/lib/forms/form-state";
import { zodErrorsToFormState } from "@/lib/forms/form-state";
import { parseFormData } from "@/lib/forms/parse";
import { createClient } from "@/lib/supabase/server";
import { roundCurrency, computeSellingPrice } from "@/lib/utils";
import { estimateSchema } from "@/lib/validations/estimate";
import { saveUserPricesFromPartidas } from "@/lib/data/user-precios";

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
  items: { categoria: string; descripcion: string; unidad: string; cantidad: number; precio_coste: number; margen: number; precio_unitario: number; subtotal: number; orden: number }[],
  totalAmount: number,
  margenGlobal: number = 20,
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
      p_items: items,
      p_margen_global: margenGlobal,
    },
  );

  if (rpcError) {
    console.error("Error creating estimate (RPC)", rpcError);

    // Fallback: creación no-atómica si la función RPC no existe aún
    if (rpcError.message?.includes("function") && rpcError.message?.includes("does not exist")) {
      return createEstimateWithItemsFallback(supabase, user.id, projectId, clientId, name, description, items, totalAmount, margenGlobal);
    }

    return { success: false, message: `No se pudo crear el presupuesto: ${rpcError.message}` };
  }

  const result = rpcResult as { success: boolean; message: string; estimateId: string };

  // Capturar precios del usuario en background (no bloquea el guardado)
  if (result.success && items.length > 0) {
    saveUserPricesFromPartidas(user.id, items).catch((err) =>
      console.error("Error saving user prices:", err),
    );
  }

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
  items: { categoria: string; descripcion: string; unidad: string; cantidad: number; precio_coste: number; margen: number; precio_unitario: number; subtotal: number; orden: number }[],
  totalAmount: number,
  margenGlobal: number = 20,
): Promise<{ success: boolean; message: string; estimateId?: string }> {
  const insertData: Record<string, unknown> = {
    user_id: userId,
    name,
    description,
    total_amount: totalAmount,
    status: "draft",
    margen_global: margenGlobal,
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
      precio_coste: item.precio_coste,
      margen: item.margen,
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

  // Capturar precios del usuario en background
  if (items.length > 0) {
    saveUserPricesFromPartidas(userId, items).catch((err) =>
      console.error("Error saving user prices (fallback):", err),
    );
  }

  revalidatePath("/dashboard/presupuestos");
  if (projectId) {
    revalidatePath(`/dashboard/proyectos/${projectId}`);
  }
  return { success: true, message: "Presupuesto creado correctamente.", estimateId: estimate.id };
}

export async function updateEstimateItemAction(
  itemId: string,
  data: { cantidad?: number; precio_unitario?: number; precio_coste?: number; margen?: number; descripcion?: string; categoria?: string; unidad?: string },
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "No estás autenticado." };

  // Si se actualiza precio_coste o margen, recalcular precio_unitario y subtotal
  const updateData: Record<string, unknown> = { ...data };
  if (data.precio_coste !== undefined || data.margen !== undefined) {
    const coste = data.precio_coste ?? 0;
    const margen = data.margen ?? 0;
    updateData.precio_unitario = computeSellingPrice(coste, margen);
  }

  // Recalculate subtotal when cantidad or precio_unitario change
  if (data.cantidad !== undefined || data.precio_unitario !== undefined || data.precio_coste !== undefined || data.margen !== undefined) {
    const cantidad = (data.cantidad ?? 0);
    const precioUnitario = (updateData.precio_unitario as number) ?? (data.precio_unitario ?? 0);
    updateData.subtotal = roundCurrency(cantidad * precioUnitario);
  }

  // Verificar que el item pertenece a un presupuesto del usuario
  const { data: ownership } = await supabase
    .from("estimate_items")
    .select("id, estimate:estimates!inner(user_id)")
    .eq("id", itemId)
    .single();

  if (!ownership || (ownership.estimate as unknown as { user_id: string }).user_id !== user.id) {
    return { success: false, message: "No tienes permiso para editar esta partida." };
  }

  const { error } = await supabase
    .from("estimate_items")
    .update(updateData)
    .eq("id", itemId);

  if (error) {
    console.error("Error updating estimate item", error);
    return { success: false, message: error.message };
  }

  // Si se editó el precio_coste, capturar en user_precios
  if (data.precio_coste !== undefined && data.precio_coste > 0) {
    // Obtener datos completos del item para guardar
    const { data: fullItem } = await supabase
      .from("estimate_items")
      .select("categoria, descripcion, unidad, precio_coste")
      .eq("id", itemId)
      .single();

    if (fullItem && fullItem.precio_coste) {
      saveUserPricesFromPartidas(user.id, [{
        categoria: fullItem.categoria,
        descripcion: fullItem.descripcion,
        unidad: fullItem.unidad,
        precio_coste: Number(fullItem.precio_coste),
      }]).catch((err) => console.error("Error saving user price on edit:", err));
    }
  }

  return { success: true, message: "Partida actualizada." };
}

export async function addEstimateItemAction(
  estimateId: string,
  item: { categoria: string; descripcion: string; unidad: string; cantidad: number; precio_coste: number; margen: number; precio_unitario: number; orden: number },
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

  // Capturar precio de la nueva partida en user_precios
  if (item.precio_coste > 0) {
    saveUserPricesFromPartidas(user.id, [{
      categoria: item.categoria,
      descripcion: item.descripcion,
      unidad: item.unidad,
      precio_coste: item.precio_coste,
    }]).catch((err) => console.error("Error saving user price on add:", err));
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

  // Verificar que el item pertenece a un presupuesto del usuario
  const { data: ownership } = await supabase
    .from("estimate_items")
    .select("id, estimate:estimates!inner(user_id)")
    .eq("id", itemId)
    .single();

  if (!ownership || (ownership.estimate as unknown as { user_id: string }).user_id !== user.id) {
    return { success: false, message: "No tienes permiso para eliminar esta partida." };
  }

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

export async function updateEstimateIvaAction(
  estimateId: string,
  ivaPorcentaje: number,
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "No estás autenticado." };

  const { error } = await supabase
    .from("estimates")
    .update({ iva_porcentaje: ivaPorcentaje, updated_at: new Date().toISOString() })
    .eq("id", estimateId)
    .eq("user_id", user.id);

  if (error) return { success: false, message: error.message };
  return { success: true, message: "IVA actualizado." };
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

export async function generateShareTokenAction(
  estimateId: string,
): Promise<{ success: boolean; message: string; shareToken?: string; shareUrl?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "No estás autenticado." };

  // Check if already has a share token
  const { data: existing } = await supabase
    .from("estimates")
    .select("share_token")
    .eq("id", estimateId)
    .eq("user_id", user.id)
    .single();

  if (!existing) {
    return { success: false, message: "Presupuesto no encontrado." };
  }

  if (existing.share_token) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return {
      success: true,
      message: "El presupuesto ya tiene un enlace de compartir.",
      shareToken: existing.share_token,
      shareUrl: `${appUrl}/presupuesto/${existing.share_token}`,
    };
  }

  // Generate a new share token
  const shareToken = crypto.randomUUID();
  const { error } = await supabase
    .from("estimates")
    .update({
      share_token: shareToken,
      shared_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", estimateId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error generating share token", error);
    return { success: false, message: error.message };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const shareUrl = `${appUrl}/presupuesto/${shareToken}`;

  revalidatePath(`/dashboard/presupuestos/${estimateId}`);
  return { success: true, message: "Enlace generado correctamente.", shareToken, shareUrl };
}

export async function sendEstimateEmailAction(
  estimateId: string,
  recipientEmail: string,
  recipientName: string,
  message?: string,
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "No estás autenticado." };

  // Fetch estimate
  const { data: estimate } = await supabase
    .from("estimates")
    .select("id, name, share_token, total_amount")
    .eq("id", estimateId)
    .eq("user_id", user.id)
    .single();

  if (!estimate) {
    return { success: false, message: "Presupuesto no encontrado." };
  }

  // Generate share token if it doesn't exist
  let shareToken = estimate.share_token;
  if (!shareToken) {
    shareToken = crypto.randomUUID();
    await supabase
      .from("estimates")
      .update({
        share_token: shareToken,
        shared_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", estimateId)
      .eq("user_id", user.id);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const shareUrl = `${appUrl}/presupuesto/${shareToken}`;

  // Fetch company for sender name
  const { data: company } = await supabase
    .from("companies")
    .select("name, email")
    .eq("owner_id", user.id)
    .single();

  const senderName = company?.name || "Refolder";

  // Send email via Resend
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    return { success: false, message: "El servicio de email no está configurado. Configura RESEND_API_KEY en las variables de entorno." };
  }

  const emailHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%); padding: 30px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 22px;">Presupuesto de ${senderName}</h1>
      </div>
      <div style="background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-top: none;">
        <p style="color: #334155; font-size: 16px; margin-top: 0;">Hola ${recipientName},</p>
        ${message ? `<p style="color: #475569; font-size: 14px;">${message}</p>` : ""}
        <p style="color: #475569; font-size: 14px;">Te enviamos el presupuesto <strong>&ldquo;${estimate.name}&rdquo;</strong> para tu revisión.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${shareUrl}" style="background: #d97706; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">Ver presupuesto</a>
        </div>
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">Si el botón no funciona, copia y pega este enlace:<br/><a href="${shareUrl}" style="color: #2563eb;">${shareUrl}</a></p>
      </div>
      <div style="padding: 15px; text-align: center; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px; background: white;">
        <p style="color: #94a3b8; font-size: 11px; margin: 0;">Enviado con Refolder</p>
      </div>
    </div>
  `;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: `${senderName} <presupuestos@${process.env.RESEND_DOMAIN || "refolder.es"}>`,
        to: [recipientEmail],
        subject: `Presupuesto: ${estimate.name}`,
        html: emailHtml,
      }),
    });

    if (!res.ok) {
      const errorData = await res.text();
      console.error("Resend API error:", errorData);
      return { success: false, message: "Error al enviar el email. Inténtalo de nuevo." };
    }

    // Update status to sent
    await supabase
      .from("estimates")
      .update({ status: "sent", updated_at: new Date().toISOString() })
      .eq("id", estimateId)
      .eq("user_id", user.id);

    revalidatePath(`/dashboard/presupuestos/${estimateId}`);
    revalidatePath("/dashboard/presupuestos");
    return { success: true, message: `Email enviado a ${recipientEmail}.` };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, message: "Error de conexión al enviar el email." };
  }
}

export async function updateGlobalMarginAction(
  estimateId: string,
  margenGlobal: number,
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "No estás autenticado." };

  // 1. Actualizar margen_global en el presupuesto
  const { error: estimateError } = await supabase
    .from("estimates")
    .update({ margen_global: margenGlobal, updated_at: new Date().toISOString() })
    .eq("id", estimateId)
    .eq("user_id", user.id);

  if (estimateError) {
    console.error("Error updating global margin", estimateError);
    return { success: false, message: estimateError.message };
  }

  // 2. Obtener todos los items del presupuesto
  const { data: items, error: itemsError } = await supabase
    .from("estimate_items")
    .select("id, precio_coste, cantidad")
    .eq("estimate_id", estimateId);

  if (itemsError) {
    console.error("Error fetching items for margin update", itemsError);
    return { success: false, message: itemsError.message };
  }

  // 3. Calcular nuevos valores y actualizar todos los items en paralelo
  let newTotal = 0;
  const updates = (items ?? []).map((item) => {
    const coste = Number(item.precio_coste) || 0;
    const newPrecioUnitario = computeSellingPrice(coste, margenGlobal);
    const newSubtotal = roundCurrency(Number(item.cantidad) * newPrecioUnitario);
    newTotal += newSubtotal;
    return supabase
      .from("estimate_items")
      .update({ margen: margenGlobal, precio_unitario: newPrecioUnitario, subtotal: newSubtotal })
      .eq("id", item.id);
  });
  await Promise.all(updates);

  // 4. Actualizar el total del presupuesto
  const totalWithIva = roundCurrency(newTotal + roundCurrency(newTotal * 0.21));
  await supabase
    .from("estimates")
    .update({ total_amount: totalWithIva, updated_at: new Date().toISOString() })
    .eq("id", estimateId)
    .eq("user_id", user.id);

  revalidatePath(`/dashboard/presupuestos/${estimateId}`);
  return { success: true, message: `Margen global actualizado a ${margenGlobal}%.` };
}
