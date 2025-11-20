"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { EstimateFormState } from "@/lib/forms/estimate-form-state";
import { initialEstimateFormState } from "@/lib/forms/estimate-form-state";
import type { EstimateStatus } from "@/lib/data/estimates";

type EstimatePayload = {
  client_id: string | null;
  project_id: string | null;
  title: string;
  description: string | null;
  issue_date: string;
  validity_date: string | null;
  status: EstimateStatus;
  tax_rate: number;
  notes: string | null;
  terms: string | null;
};

type EstimateItemPayload = {
  line_number: number;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  notes: string | null;
};

function validateEstimate(formData: FormData): { data?: EstimatePayload; errors?: Record<string, string[]> } {
  const errors: Record<string, string[]> = {};

  const title = (formData.get("title") as string | null)?.trim() ?? "";
  const clientId = (formData.get("client_id") as string | null)?.trim() ?? "";
  const projectId = (formData.get("project_id") as string | null)?.trim() ?? "";
  const description = (formData.get("description") as string | null)?.trim() ?? "";
  const issueDate = (formData.get("issue_date") as string | null)?.trim() ?? "";
  const validityDate = (formData.get("validity_date") as string | null)?.trim() ?? "";
  const status = (formData.get("status") as string | null)?.trim() ?? "draft";
  const taxRateRaw = (formData.get("tax_rate") as string | null)?.trim() ?? "21";
  const notes = (formData.get("notes") as string | null)?.trim() ?? "";
  const terms = (formData.get("terms") as string | null)?.trim() ?? "";

  if (!title) {
    errors.title = ["El título es obligatorio."];
  }

  if (!issueDate) {
    errors.issue_date = ["La fecha de emisión es obligatoria."];
  }

  if (validityDate && issueDate) {
    const issue = new Date(issueDate);
    const validity = new Date(validityDate);
    if (validity < issue) {
      errors.validity_date = ["La fecha de validez debe ser posterior a la fecha de emisión."];
    }
  }

  if (status && !["draft", "sent", "accepted", "rejected", "expired"].includes(status)) {
    errors.status = ["Estado inválido."];
  }

  const taxRate = parseFloat(taxRateRaw);
  if (isNaN(taxRate) || taxRate < 0 || taxRate > 100) {
    errors.tax_rate = ["El IVA debe ser un número entre 0 y 100."];
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  return {
    data: {
      client_id: clientId || null,
      project_id: projectId || null,
      title,
      description: description || null,
      issue_date: issueDate || new Date().toISOString().split("T")[0],
      validity_date: validityDate || null,
      status: status as EstimateStatus,
      tax_rate: taxRate,
      notes: notes || null,
      terms: terms || null,
    },
  };
}

export async function createEstimateAction(_: EstimateFormState, formData: FormData): Promise<EstimateFormState> {
  try {
    const validation = validateEstimate(formData);

    if (!validation.data) {
      return {
        status: "error",
        errors: validation.errors,
        message: "Por favor, corrige los errores en el formulario.",
      };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        status: "error",
        message: "Usuario no autenticado.",
      };
    }

    // Generar número de presupuesto
    const { data: estimateNumber, error: numberError } = await supabase.rpc("generate_estimate_number", {
      user_uuid: user.id,
    });

    if (numberError || !estimateNumber) {
      return {
        status: "error",
        message: "Error al generar el número de presupuesto.",
      };
    }

    // Crear el presupuesto
    const { data: estimate, error: estimateError } = await supabase
      .from("estimates")
      .insert({
        user_id: user.id,
        client_id: validation.data.client_id,
        project_id: validation.data.project_id,
        estimate_number: estimateNumber,
        title: validation.data.title,
        description: validation.data.description,
        issue_date: validation.data.issue_date,
        validity_date: validation.data.validity_date,
        status: validation.data.status,
        tax_rate: validation.data.tax_rate,
        notes: validation.data.notes,
        terms: validation.data.terms,
        subtotal: 0,
        tax_amount: 0,
        total: 0,
      })
      .select()
      .single();

    if (estimateError || !estimate) {
      console.error("Error creating estimate:", estimateError);
      return {
        status: "error",
        message: estimateError?.message || "Error al crear el presupuesto.",
      };
    }

    // Procesar items del presupuesto (si vienen en el formData)
    const itemsJson = formData.get("items") as string | null;
    if (itemsJson && validation.data) {
      try {
        const items: EstimateItemPayload[] = JSON.parse(itemsJson);
        const defaultTaxRate = validation.data.tax_rate;
        
        if (items.length > 0) {
          const estimateItems = items.map((item, index) => ({
            estimate_id: estimate.id,
            line_number: index + 1,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            tax_rate: item.tax_rate || defaultTaxRate,
            notes: item.notes || null,
            subtotal: item.quantity * item.unit_price,
            tax_amount: (item.quantity * item.unit_price) * ((item.tax_rate || defaultTaxRate) / 100),
            total: (item.quantity * item.unit_price) * (1 + (item.tax_rate || defaultTaxRate) / 100),
          }));

          const { error: itemsError } = await supabase
            .from("estimate_items")
            .insert(estimateItems);

          if (itemsError) {
            console.error("Error creating estimate items:", itemsError);
            // No fallar, pero registrar el error
          }
        }
      } catch (parseError) {
        console.error("Error parsing items:", parseError);
        // Continuar sin items si hay error de parsing
      }
    }

    revalidatePath("/dashboard/presupuestos");
    revalidatePath("/dashboard/obras");

    return {
      status: "success",
      message: "Presupuesto creado correctamente.",
    };
  } catch (error) {
    console.error("Unexpected error in createEstimateAction:", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Error inesperado al crear el presupuesto.",
    };
  }
}

export async function updateEstimateAction(
  estimateId: string,
  _: EstimateFormState,
  formData: FormData
): Promise<EstimateFormState> {
  try {
    const validation = validateEstimate(formData);

    if (!validation.data) {
      return {
        status: "error",
        errors: validation.errors,
        message: "Por favor, corrige los errores en el formulario.",
      };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        status: "error",
        message: "Usuario no autenticado.",
      };
    }

    // Verificar que el presupuesto pertenece al usuario
    const { data: existingEstimate, error: checkError } = await supabase
      .from("estimates")
      .select("id")
      .eq("id", estimateId)
      .eq("user_id", user.id)
      .single();

    if (checkError || !existingEstimate) {
      return {
        status: "error",
        message: "Presupuesto no encontrado o no tienes permisos.",
      };
    }

    // Actualizar el presupuesto
    const { error: updateError } = await supabase
      .from("estimates")
      .update({
        client_id: validation.data.client_id,
        project_id: validation.data.project_id,
        title: validation.data.title,
        description: validation.data.description,
        issue_date: validation.data.issue_date,
        validity_date: validation.data.validity_date,
        status: validation.data.status,
        tax_rate: validation.data.tax_rate,
        notes: validation.data.notes,
        terms: validation.data.terms,
        updated_at: new Date().toISOString(),
      })
      .eq("id", estimateId)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Error updating estimate:", updateError);
      return {
        status: "error",
        message: updateError.message || "Error al actualizar el presupuesto.",
      };
    }

    // Procesar items si vienen en el formData
    const itemsJson = formData.get("items") as string | null;
    if (itemsJson && validation.data) {
      try {
        const items: EstimateItemPayload[] = JSON.parse(itemsJson);
        const defaultTaxRate = validation.data.tax_rate;
        
        // Eliminar items existentes
        await supabase.from("estimate_items").delete().eq("estimate_id", estimateId);

        // Insertar nuevos items
        if (items.length > 0) {
          const estimateItems = items.map((item, index) => ({
            estimate_id: estimateId,
            line_number: index + 1,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            tax_rate: item.tax_rate || defaultTaxRate,
            notes: item.notes || null,
            subtotal: item.quantity * item.unit_price,
            tax_amount: (item.quantity * item.unit_price) * ((item.tax_rate || defaultTaxRate) / 100),
            total: (item.quantity * item.unit_price) * (1 + (item.tax_rate || defaultTaxRate) / 100),
          }));

          const { error: itemsError } = await supabase
            .from("estimate_items")
            .insert(estimateItems);

          if (itemsError) {
            console.error("Error updating estimate items:", itemsError);
          }
        }
      } catch (parseError) {
        console.error("Error parsing items:", parseError);
      }
    }

    revalidatePath("/dashboard/presupuestos");
    revalidatePath(`/dashboard/presupuestos/${estimateId}`);

    return {
      status: "success",
      message: "Presupuesto actualizado correctamente.",
    };
  } catch (error) {
    console.error("Unexpected error in updateEstimateAction:", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Error inesperado al actualizar el presupuesto.",
    };
  }
}

export async function deleteEstimateAction(estimateId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Usuario no autenticado." };
    }

    // Verificar que el presupuesto pertenece al usuario
    const { data: existingEstimate, error: checkError } = await supabase
      .from("estimates")
      .select("id")
      .eq("id", estimateId)
      .eq("user_id", user.id)
      .single();

    if (checkError || !existingEstimate) {
      return { success: false, error: "Presupuesto no encontrado o no tienes permisos." };
    }

    // Eliminar el presupuesto (los items se eliminan en cascada)
    const { error: deleteError } = await supabase
      .from("estimates")
      .delete()
      .eq("id", estimateId)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Error deleting estimate:", deleteError);
      return { success: false, error: deleteError.message || "Error al eliminar el presupuesto." };
    }

    revalidatePath("/dashboard/presupuestos");

    return { success: true };
  } catch (error) {
    console.error("Unexpected error in deleteEstimateAction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error inesperado al eliminar el presupuesto.",
    };
  }
}

export async function updateEstimateStatusAction(
  estimateId: string,
  status: EstimateStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Usuario no autenticado." };
    }

    const { error: updateError } = await supabase
      .from("estimates")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", estimateId)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Error updating estimate status:", updateError);
      return { success: false, error: updateError.message || "Error al actualizar el estado." };
    }

    revalidatePath("/dashboard/presupuestos");
    revalidatePath(`/dashboard/presupuestos/${estimateId}`);

    return { success: true };
  } catch (error) {
    console.error("Unexpected error in updateEstimateStatusAction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error inesperado al actualizar el estado.",
    };
  }
}

