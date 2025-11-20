"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { InvoiceFormState } from "@/lib/forms/invoice-form-state";
import { initialInvoiceFormState } from "@/lib/forms/invoice-form-state";
import type { InvoiceStatus } from "@/lib/data/invoices";
import { getUserCompany } from "@/lib/data/companies";

type InvoicePayload = {
  client_id: string | null;
  project_id: string | null;
  estimate_id: string | null;
  title: string;
  description: string | null;
  issue_date: string;
  due_date: string | null;
  status: InvoiceStatus;
  series: string;
  tax_rate: number;
  notes: string | null;
  terms: string | null;
  payment_method: string | null;
};

type InvoiceItemPayload = {
  line_number: number;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  notes: string | null;
};

function validateInvoice(formData: FormData): { data?: InvoicePayload; errors?: Record<string, string[]> } {
  const errors: Record<string, string[]> = {};

  const title = (formData.get("title") as string | null)?.trim() ?? "";
  const clientId = (formData.get("client_id") as string | null)?.trim() ?? "";
  const projectId = (formData.get("project_id") as string | null)?.trim() ?? "";
  const estimateId = (formData.get("estimate_id") as string | null)?.trim() ?? "";
  const description = (formData.get("description") as string | null)?.trim() ?? "";
  const issueDate = (formData.get("issue_date") as string | null)?.trim() ?? "";
  const dueDate = (formData.get("due_date") as string | null)?.trim() ?? "";
  const status = (formData.get("status") as string | null)?.trim() ?? "draft";
  const series = (formData.get("series") as string | null)?.trim() ?? "FAC";
  const taxRateRaw = (formData.get("tax_rate") as string | null)?.trim() ?? "21";
  const notes = (formData.get("notes") as string | null)?.trim() ?? "";
  const terms = (formData.get("terms") as string | null)?.trim() ?? "";
  const paymentMethod = (formData.get("payment_method") as string | null)?.trim() ?? "";

  if (!title) {
    errors.title = ["El título es obligatorio."];
  }

  if (!issueDate) {
    errors.issue_date = ["La fecha de emisión es obligatoria."];
  }

  if (dueDate && issueDate) {
    const issue = new Date(issueDate);
    const due = new Date(dueDate);
    if (due < issue) {
      errors.due_date = ["La fecha de vencimiento debe ser posterior a la fecha de emisión."];
    }
  }

  if (status && !["draft", "sent", "paid", "overdue", "cancelled", "partial"].includes(status)) {
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
      estimate_id: estimateId || null,
      title,
      description: description || null,
      issue_date: issueDate || new Date().toISOString().split("T")[0],
      due_date: dueDate || null,
      status: status as InvoiceStatus,
      series: series || "FAC",
      tax_rate: taxRate,
      notes: notes || null,
      terms: terms || null,
      payment_method: paymentMethod || null,
    },
  };
}

/**
 * Crea una factura desde un presupuesto aceptado
 */
export async function createInvoiceFromEstimateAction(
  estimateId: string
): Promise<{ status: "success" | "error"; message?: string; invoiceId?: string }> {
  try {
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

    // Obtener el presupuesto
    const { data: estimate, error: estimateError } = await supabase
      .from("estimates")
      .select("*")
      .eq("id", estimateId)
      .eq("user_id", user.id)
      .single();

    if (estimateError || !estimate) {
      return {
        status: "error",
        message: "Presupuesto no encontrado.",
      };
    }

    // Verificar que el presupuesto esté aceptado
    if (estimate.status !== "accepted") {
      return {
        status: "error",
        message: "Solo se pueden generar facturas de presupuestos aceptados.",
      };
    }

    // Verificar que no exista ya una factura para este presupuesto
    const { data: existingInvoice } = await supabase
      .from("invoices")
      .select("id")
      .eq("estimate_id", estimateId)
      .maybeSingle();

    if (existingInvoice) {
      return {
        status: "error",
        message: "Ya existe una factura para este presupuesto.",
      };
    }

    // Obtener la empresa del usuario
    const company = await getUserCompany();

    // Generar número de factura
    const { data: invoiceNumber, error: numberError } = await supabase.rpc("generate_invoice_number", {
      user_uuid: user.id,
      invoice_series: "FAC",
    });

    if (numberError || !invoiceNumber) {
      return {
        status: "error",
        message: "Error al generar el número de factura.",
      };
    }

    // Calcular fecha de vencimiento (30 días después de emisión por defecto)
    const issueDate = new Date(estimate.issue_date);
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + 30);

    // Crear la factura
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .insert({
        user_id: user.id,
        company_id: company?.id || null,
        client_id: estimate.client_id,
        project_id: estimate.project_id,
        estimate_id: estimate.id,
        invoice_number: invoiceNumber,
        series: "FAC",
        title: estimate.title,
        description: estimate.description,
        issue_date: estimate.issue_date,
        due_date: dueDate.toISOString().split("T")[0],
        status: "draft",
        subtotal: parseFloat(estimate.subtotal || 0),
        tax_rate: parseFloat(estimate.tax_rate || 21),
        tax_amount: parseFloat(estimate.tax_amount || 0),
        total: parseFloat(estimate.total || 0),
        paid_amount: 0,
        notes: estimate.notes,
        terms: estimate.terms,
      })
      .select()
      .single();

    if (invoiceError || !invoice) {
      console.error("Error creating invoice:", invoiceError);
      return {
        status: "error",
        message: invoiceError?.message || "Error al crear la factura.",
      };
    }

    // Copiar items del presupuesto a la factura
    const { data: estimateItems } = await supabase
      .from("estimate_items")
      .select("*")
      .eq("estimate_id", estimateId)
      .order("line_number", { ascending: true });

    if (estimateItems && estimateItems.length > 0) {
      const invoiceItems = estimateItems.map((item) => ({
        invoice_id: invoice.id,
        line_number: item.line_number,
        description: item.description,
        quantity: parseFloat(item.quantity || 1),
        unit_price: parseFloat(item.unit_price || 0),
        tax_rate: parseFloat(item.tax_rate || 21),
        notes: item.notes || null,
        subtotal: parseFloat(item.subtotal || 0),
        tax_amount: parseFloat(item.tax_amount || 0),
        total: parseFloat(item.total || 0),
      }));

      const { error: itemsError } = await supabase.from("invoice_items").insert(invoiceItems);

      if (itemsError) {
        console.error("Error creating invoice items:", itemsError);
        // No fallar, pero registrar el error
      }
    }

    revalidatePath("/dashboard/facturas");
    revalidatePath("/dashboard/presupuestos");

    return {
      status: "success",
      message: "Factura creada correctamente desde el presupuesto.",
      invoiceId: invoice.id,
    };
  } catch (error) {
    console.error("Unexpected error in createInvoiceFromEstimateAction:", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Error inesperado al crear la factura.",
    };
  }
}

export async function createInvoiceAction(_: InvoiceFormState, formData: FormData): Promise<InvoiceFormState> {
  try {
    const validation = validateInvoice(formData);

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

    // Obtener la empresa del usuario
    const company = await getUserCompany();

    // Generar número de factura
    const { data: invoiceNumber, error: numberError } = await supabase.rpc("generate_invoice_number", {
      user_uuid: user.id,
      invoice_series: validation.data.series,
    });

    if (numberError || !invoiceNumber) {
      return {
        status: "error",
        message: "Error al generar el número de factura.",
      };
    }

    // Crear la factura
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .insert({
        user_id: user.id,
        company_id: company?.id || null,
        client_id: validation.data.client_id,
        project_id: validation.data.project_id,
        estimate_id: validation.data.estimate_id,
        invoice_number: invoiceNumber,
        series: validation.data.series,
        title: validation.data.title,
        description: validation.data.description,
        issue_date: validation.data.issue_date,
        due_date: validation.data.due_date,
        status: validation.data.status,
        tax_rate: validation.data.tax_rate,
        notes: validation.data.notes,
        terms: validation.data.terms,
        payment_method: validation.data.payment_method,
        subtotal: 0,
        tax_amount: 0,
        total: 0,
        paid_amount: 0,
      })
      .select()
      .single();

    if (invoiceError || !invoice) {
      console.error("Error creating invoice:", invoiceError);
      return {
        status: "error",
        message: invoiceError?.message || "Error al crear la factura.",
      };
    }

    // Procesar items de la factura
    const itemsJson = formData.get("items") as string | null;
    if (itemsJson && validation.data) {
      try {
        const items: InvoiceItemPayload[] = JSON.parse(itemsJson);
        const defaultTaxRate = validation.data.tax_rate;
        
        if (items.length > 0) {
          const invoiceItems = items.map((item, index) => ({
            invoice_id: invoice.id,
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
            .from("invoice_items")
            .insert(invoiceItems);

          if (itemsError) {
            console.error("Error creating invoice items:", itemsError);
          }
        }
      } catch (parseError) {
        console.error("Error parsing items:", parseError);
      }
    }

    revalidatePath("/dashboard/facturas");
    revalidatePath("/dashboard/presupuestos");

    return {
      status: "success",
      message: "Factura creada correctamente.",
    };
  } catch (error) {
    console.error("Unexpected error in createInvoiceAction:", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Error inesperado al crear la factura.",
    };
  }
}

export async function updateInvoiceAction(
  invoiceId: string,
  _: InvoiceFormState,
  formData: FormData
): Promise<InvoiceFormState> {
  try {
    const validation = validateInvoice(formData);

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

    // Verificar que la factura pertenece al usuario
    const { data: existingInvoice, error: checkError } = await supabase
      .from("invoices")
      .select("id, status")
      .eq("id", invoiceId)
      .eq("user_id", user.id)
      .single();

    if (checkError || !existingInvoice) {
      return {
        status: "error",
        message: "Factura no encontrada o no tienes permisos.",
      };
    }

    // No permitir editar facturas pagadas o anuladas
    if (existingInvoice.status === "paid" || existingInvoice.status === "cancelled") {
      return {
        status: "error",
        message: "No se puede editar una factura pagada o anulada.",
      };
    }

    // Actualizar la factura
    const { error: updateError } = await supabase
      .from("invoices")
      .update({
        client_id: validation.data.client_id,
        project_id: validation.data.project_id,
        title: validation.data.title,
        description: validation.data.description,
        issue_date: validation.data.issue_date,
        due_date: validation.data.due_date,
        status: validation.data.status,
        tax_rate: validation.data.tax_rate,
        notes: validation.data.notes,
        terms: validation.data.terms,
        payment_method: validation.data.payment_method,
        updated_at: new Date().toISOString(),
      })
      .eq("id", invoiceId);

    if (updateError) {
      console.error("Error updating invoice:", updateError);
      return {
        status: "error",
        message: updateError.message || "Error al actualizar la factura.",
      };
    }

    // Actualizar items (eliminar existentes y crear nuevos)
    const itemsJson = formData.get("items") as string | null;
    if (itemsJson && validation.data) {
      try {
        // Eliminar items existentes
        await supabase.from("invoice_items").delete().eq("invoice_id", invoiceId);

        // Crear nuevos items
        const items: InvoiceItemPayload[] = JSON.parse(itemsJson);
        const defaultTaxRate = validation.data.tax_rate;
        
        if (items.length > 0) {
          const invoiceItems = items.map((item, index) => ({
            invoice_id: invoiceId,
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
            .from("invoice_items")
            .insert(invoiceItems);

          if (itemsError) {
            console.error("Error updating invoice items:", itemsError);
          }
        }
      } catch (parseError) {
        console.error("Error parsing items:", parseError);
      }
    }

    revalidatePath("/dashboard/facturas");
    revalidatePath(`/dashboard/facturas/${invoiceId}`);

    return {
      status: "success",
      message: "Factura actualizada correctamente.",
    };
  } catch (error) {
    console.error("Unexpected error in updateInvoiceAction:", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Error inesperado al actualizar la factura.",
    };
  }
}

export async function deleteInvoiceAction(invoiceId: string): Promise<{ status: "success" | "error"; message?: string }> {
  try {
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

    // Verificar que la factura pertenece al usuario
    const { data: existingInvoice, error: checkError } = await supabase
      .from("invoices")
      .select("id, status")
      .eq("id", invoiceId)
      .eq("user_id", user.id)
      .single();

    if (checkError || !existingInvoice) {
      return {
        status: "error",
        message: "Factura no encontrada o no tienes permisos.",
      };
    }

    // No permitir eliminar facturas pagadas (solo anular)
    if (existingInvoice.status === "paid") {
      return {
        status: "error",
        message: "No se puede eliminar una factura pagada. Debes anularla en su lugar.",
      };
    }

    // Eliminar items primero (CASCADE debería hacerlo, pero por seguridad)
    await supabase.from("invoice_items").delete().eq("invoice_id", invoiceId);

    // Eliminar la factura
    const { error: deleteError } = await supabase.from("invoices").delete().eq("id", invoiceId);

    if (deleteError) {
      console.error("Error deleting invoice:", deleteError);
      return {
        status: "error",
        message: deleteError.message || "Error al eliminar la factura.",
      };
    }

    revalidatePath("/dashboard/facturas");

    return {
      status: "success",
      message: "Factura eliminada correctamente.",
    };
  } catch (error) {
    console.error("Unexpected error in deleteInvoiceAction:", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Error inesperado al eliminar la factura.",
    };
  }
}

/**
 * Actualiza el estado de una factura
 * Si se marca como pagada, crea un ingreso automático en finanzas
 */
export async function updateInvoiceStatusAction(
  invoiceId: string,
  status: InvoiceStatus,
  paymentDate?: string,
  paymentMethod?: string,
  paidAmount?: number
): Promise<{ status: "success" | "error"; message?: string }> {
  try {
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

    // Obtener la factura actual
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", invoiceId)
      .eq("user_id", user.id)
      .single();

    if (invoiceError || !invoice) {
      return {
        status: "error",
        message: "Factura no encontrada.",
      };
    }

    // Preparar datos de actualización
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    // Si se marca como pagada, actualizar campos de pago
    if (status === "paid") {
      updateData.payment_date = paymentDate || new Date().toISOString().split("T")[0];
      updateData.payment_method = paymentMethod || invoice.payment_method;
      updateData.paid_amount = paidAmount || parseFloat(invoice.total || 0);
      
      // Si la factura tiene un total definido y no hay paid_amount, usar el total
      if (!updateData.paid_amount && invoice.total) {
        updateData.paid_amount = parseFloat(invoice.total);
      }
    } else if (status === "partial") {
      updateData.paid_amount = paidAmount || parseFloat(invoice.paid_amount || 0);
      if (paymentDate) {
        updateData.payment_date = paymentDate;
      }
      if (paymentMethod) {
        updateData.payment_method = paymentMethod;
      }
    } else {
      // Si se cambia de pagada a otro estado, resetear campos de pago
      if (invoice.status === "paid") {
        updateData.paid_amount = 0;
        updateData.payment_date = null;
        updateData.payment_method = null;
      }
    }

    // Actualizar la factura
    const { error: updateError } = await supabase
      .from("invoices")
      .update(updateData)
      .eq("id", invoiceId);

    if (updateError) {
      console.error("Error updating invoice status:", updateError);
      return {
        status: "error",
        message: updateError.message || "Error al actualizar el estado de la factura.",
      };
    }

    // Si se marca como pagada y no existe ingreso, crear uno automático
    if (status === "paid" && !invoice.payment_date) {
      const finalPaidAmount = updateData.paid_amount || parseFloat(invoice.total || 0);
      
      // Verificar si ya existe un ingreso para esta factura
      const { data: existingTransaction } = await supabase
        .from("finance_transactions")
        .select("id")
        .eq("user_id", user.id)
        .eq("description", `Factura ${invoice.invoice_number}`)
        .maybeSingle();

      if (!existingTransaction && finalPaidAmount > 0) {
        // Crear ingreso automático en finanzas
        const { error: financeError } = await supabase
          .from("finance_transactions")
          .insert({
            user_id: user.id,
            company_id: invoice.company_id,
            project_id: invoice.project_id,
            client_id: invoice.client_id,
            type: "income",
            amount: finalPaidAmount,
            transaction_date: updateData.payment_date || new Date().toISOString().split("T")[0],
            description: `Factura ${invoice.invoice_number}`,
            payment_method: updateData.payment_method || "transfer",
            notes: `Ingreso automático de factura ${invoice.invoice_number}`,
          });

        if (financeError) {
          console.error("Error creating finance transaction:", financeError);
          // No fallar, solo loguear el error
        }
      }
    }

    // Si se cambia de pagada a otro estado, eliminar el ingreso automático si existe
    if (invoice.status === "paid" && status !== "paid") {
      const { error: deleteTransactionError } = await supabase
        .from("finance_transactions")
        .delete()
        .eq("user_id", user.id)
        .eq("description", `Factura ${invoice.invoice_number}`)
        .eq("type", "income");

      if (deleteTransactionError) {
        console.error("Error deleting finance transaction:", deleteTransactionError);
        // No fallar, solo loguear el error
      }
    }

    revalidatePath("/dashboard/facturas");
    revalidatePath(`/dashboard/facturas/${invoiceId}`);
    revalidatePath("/dashboard/finanzas");

    return {
      status: "success",
      message: "Estado de factura actualizado correctamente.",
    };
  } catch (error) {
    console.error("Unexpected error in updateInvoiceStatusAction:", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Error inesperado al actualizar el estado.",
    };
  }
}

