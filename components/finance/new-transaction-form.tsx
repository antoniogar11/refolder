"use client";

import { useActionState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { createTransactionAction } from "@/app/dashboard/finanzas/actions";

export function NewTransactionForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(
    async (_: unknown, formData: FormData) => {
      const result = await createTransactionAction({ status: "idle" as const }, formData);
      if (result.status === "success") {
        formRef.current?.reset();
      }
      return result;
    },
    { status: "idle" as const },
  );

  const today = new Date().toISOString().split("T")[0];

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1">
          <Label htmlFor="type">Tipo *</Label>
          <NativeSelect id="type" name="type" defaultValue="expense">
            <option value="income">Ingreso</option>
            <option value="expense">Gasto</option>
          </NativeSelect>
        </div>
        <div className="space-y-1">
          <Label htmlFor="category">Categoría *</Label>
          <NativeSelect id="category" name="category" defaultValue="material">
            <option value="material">Material</option>
            <option value="mano_de_obra">Mano de obra</option>
            <option value="subcontrata">Subcontrata</option>
            <option value="transporte">Transporte</option>
            <option value="herramientas">Herramientas</option>
            <option value="cobro_cliente">Cobro de cliente</option>
            <option value="alquiler">Alquiler</option>
            <option value="seguros">Seguros</option>
            <option value="impuestos">Impuestos</option>
            <option value="otro">Otro</option>
          </NativeSelect>
        </div>
        <div className="space-y-1">
          <Label htmlFor="amount">Importe (€) *</Label>
          <Input id="amount" name="amount" type="number" step="0.01" min="0.01" required placeholder="0.00" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="transaction_date">Fecha *</Label>
          <Input id="transaction_date" name="transaction_date" type="date" required defaultValue={today} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="description">Descripción *</Label>
          <Input id="description" name="description" required placeholder="Descripción del movimiento" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="payment_method">Método de pago</Label>
          <NativeSelect id="payment_method" name="payment_method" defaultValue="">
            <option value="">Sin especificar</option>
            <option value="cash">Efectivo</option>
            <option value="bank_transfer">Transferencia</option>
            <option value="card">Tarjeta</option>
            <option value="check">Cheque</option>
          </NativeSelect>
        </div>
      </div>

      <input type="hidden" name="reference" value="" />
      <input type="hidden" name="notes" value="" />
      <input type="hidden" name="project_id" value="" />
      <input type="hidden" name="client_id" value="" />

      {state?.status === "success" && (
        <p className="text-sm text-emerald-600">{state.message}</p>
      )}
      {state?.status === "error" && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Guardando..." : "Registrar Movimiento"}
      </Button>
    </form>
  );
}
