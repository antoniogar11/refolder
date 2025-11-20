"use server";

import { revalidatePath } from "next/cache";

import type { FinanceFormState } from "@/lib/forms/finance-form-state";
import { initialFinanceFormState } from "@/lib/forms/finance-form-state";
import { createClient } from "@/lib/supabase/server";

type FinanceTransactionPayload = {
  project_id: string | null;
  client_id: string | null;
  type: "income" | "expense";
  category: string;
  description: string | null;
  amount: number;
  transaction_date: string;
  payment_method: "cash" | "bank_transfer" | "card" | "check" | "other" | null;
  reference: string | null;
  notes: string | null;
};

function validateFinanceTransaction(
  formData: FormData,
): { data?: FinanceTransactionPayload; errors?: Record<string, string[]> } {
  const errors: Record<string, string[]> = {};

  const type = (formData.get("type") as string | null)?.trim() ?? "";
  const category = (formData.get("category") as string | null)?.trim() ?? "";
  const description = (formData.get("description") as string | null)?.trim() ?? "";
  const amountRaw = (formData.get("amount") as string | null)?.trim() ?? "";
  const transactionDate = (formData.get("transaction_date") as string | null)?.trim() ?? "";
  const paymentMethod = (formData.get("payment_method") as string | null)?.trim() ?? "";
  const reference = (formData.get("reference") as string | null)?.trim() ?? "";
  const notes = (formData.get("notes") as string | null)?.trim() ?? "";
  const projectId = (formData.get("project_id") as string | null)?.trim() ?? "";
  const clientId = (formData.get("client_id") as string | null)?.trim() ?? "";

  if (!type || !["income", "expense"].includes(type)) {
    errors.type = ["El tipo es obligatorio (ingreso o gasto)."];
  }

  if (!category) {
    errors.category = ["La categoría es obligatoria."];
  }

  if (!amountRaw) {
    errors.amount = ["El monto es obligatorio."];
  } else {
    const amount = parseFloat(amountRaw);
    if (isNaN(amount) || amount <= 0) {
      errors.amount = ["El monto debe ser un número válido mayor a 0."];
    }
  }

  if (!transactionDate) {
    errors.transaction_date = ["La fecha es obligatoria."];
  }

  if (paymentMethod && !["cash", "bank_transfer", "card", "check", "other"].includes(paymentMethod)) {
    errors.payment_method = ["Método de pago inválido."];
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  return {
    data: {
      project_id: projectId || null,
      client_id: clientId || null,
      type: type as "income" | "expense",
      category,
      description: description || null,
      amount: parseFloat(amountRaw),
      transaction_date: transactionDate,
      payment_method: (paymentMethod as FinanceTransactionPayload["payment_method"]) || null,
      reference: reference || null,
      notes: notes || null,
    },
  };
}

export async function createFinanceTransactionAction(
  _: FinanceFormState,
  formData: FormData,
): Promise<FinanceFormState> {
  const validation = validateFinanceTransaction(formData);

  if (validation.errors) {
    return {
      status: "error",
      message: "Revisa los campos.",
      errors: validation.errors,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      status: "error",
      message: "No estás autenticado. Por favor, inicia sesión.",
    };
  }

  const { error } = await supabase.from("finance_transactions").insert({
    ...validation.data!,
    user_id: user.id,
  });

  if (error) {
    console.error("Error creating finance transaction", error);
    return {
      status: "error",
      message: `No se pudo crear la transacción: ${error.message}`,
    };
  }

  revalidatePath("/dashboard/finanzas");
  
  // Si la transacción está asociada a un proyecto, revalidar también esa ruta
  if (validation.data!.project_id) {
    revalidatePath(`/dashboard/obras/${validation.data!.project_id}`);
  }

  return {
    status: "success",
    message: "Transacción creada correctamente.",
  };
}

export async function updateFinanceTransactionAction(
  transactionId: string,
  _: FinanceFormState,
  formData: FormData,
): Promise<FinanceFormState> {
  const validation = validateFinanceTransaction(formData);

  if (validation.errors) {
    return {
      status: "error",
      message: "Revisa los campos.",
      errors: validation.errors,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      status: "error",
      message: "No estás autenticado. Por favor, inicia sesión.",
    };
  }

  const { error } = await supabase
    .from("finance_transactions")
    .update({
      ...validation.data!,
      updated_at: new Date().toISOString(),
    })
    .eq("id", transactionId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error updating finance transaction", error);
    return {
      status: "error",
      message: `No se pudo actualizar la transacción: ${error.message}`,
    };
  }

  revalidatePath("/dashboard/finanzas");
  revalidatePath(`/dashboard/finanzas/${transactionId}`);
  
  // Si la transacción está asociada a un proyecto, revalidar también esa ruta
  if (validation.data!.project_id) {
    revalidatePath(`/dashboard/obras/${validation.data!.project_id}`);
  }

  return {
    status: "success",
    message: "Transacción actualizada correctamente.",
  };
}

export async function deleteFinanceTransactionAction(
  transactionId: string,
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "No estás autenticado. Por favor, inicia sesión.",
    };
  }

  // Obtener el proyecto_id antes de eliminar para revalidar su ruta
  const { data: transaction } = await supabase
    .from("finance_transactions")
    .select("project_id")
    .eq("id", transactionId)
    .eq("user_id", user.id)
    .single();

  const { error } = await supabase
    .from("finance_transactions")
    .delete()
    .eq("id", transactionId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting finance transaction", error);
    return {
      success: false,
      message: `No se pudo eliminar la transacción: ${error.message}`,
    };
  }

  revalidatePath("/dashboard/finanzas");
  
  // Si la transacción estaba asociada a un proyecto, revalidar también esa ruta
  if (transaction?.project_id) {
    revalidatePath(`/dashboard/obras/${transaction.project_id}`);
  }

  return {
    success: true,
    message: "Transacción eliminada correctamente.",
  };
}

