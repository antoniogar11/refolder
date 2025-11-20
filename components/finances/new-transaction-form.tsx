"use client";

import { useEffect } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";

import { createFinanceTransactionAction } from "@/app/dashboard/finanzas/actions";
import { Button } from "@/components/ui/button";
import { initialFinanceFormState } from "@/lib/forms/finance-form-state";

const inputClasses =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const textareaClasses =
  "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const selectClasses =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return (
    <p className="text-sm text-red-600 dark:text-red-400" role="alert">
      {messages.join(" ")}
    </p>
  );
}

function FormMessage({ status, message }: { status: "idle" | "success" | "error"; message?: string }) {
  if (!message || status === "idle") return null;

  const styles =
    status === "error"
      ? "text-sm text-red-600 dark:text-red-400"
      : "text-sm text-green-600 dark:text-green-400";

  return <p className={styles}>{message}</p>;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Guardando..." : "Crear Transacción"}
    </Button>
  );
}

type NewTransactionFormProps = {
  projects: Array<{ id: string; name: string }>;
  clients: Array<{ id: string; name: string }>;
  defaultType?: "income" | "expense";
  defaultProjectId?: string;
  defaultClientId?: string;
  onSuccess?: () => void;
};

const INCOME_CATEGORIES = [
  "Facturación",
  "Pago de Cliente",
  "Reembolso",
  "Otros Ingresos",
];

const EXPENSE_CATEGORIES = [
  "Materiales",
  "Mano de Obra",
  "Herramientas",
  "Transporte",
  "Alquiler",
  "Servicios",
  "Impuestos",
  "Otros Gastos",
];

export function NewTransactionForm({
  projects,
  clients,
  defaultType = "expense",
  defaultProjectId,
  defaultClientId,
  onSuccess,
}: NewTransactionFormProps) {
  const router = useRouter();
  const [state, formAction] = useActionState(createFinanceTransactionAction, initialFinanceFormState);

  useEffect(() => {
    if (state.status === "success") {
      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
      }
      const form = document.getElementById("new-transaction-form") as HTMLFormElement;
      if (form) {
        form.reset();
      }
    }
  }, [state.status, onSuccess, router]);

  return (
    <form id="new-transaction-form" action={formAction} className="space-y-4" noValidate>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="type" className="text-sm font-medium">
            Tipo *
          </label>
          <select id="type" name="type" required className={selectClasses} defaultValue={defaultType}>
            <option value="income">Ingreso</option>
            <option value="expense">Gasto</option>
          </select>
          <FieldError messages={state.errors?.type} />
        </div>
        <div className="space-y-2">
          <label htmlFor="amount" className="text-sm font-medium">
            Monto (€) *
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            required
            className={inputClasses}
            placeholder="0.00"
          />
          <FieldError messages={state.errors?.amount} />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="category" className="text-sm font-medium">
          Categoría *
        </label>
        <select id="category" name="category" required className={selectClasses}>
          <option value="">Seleccionar categoría</option>
          <optgroup label="Ingresos">
            {INCOME_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </optgroup>
          <optgroup label="Gastos">
            {EXPENSE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </optgroup>
        </select>
        <FieldError messages={state.errors?.category} />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Descripción
        </label>
        <textarea
          id="description"
          name="description"
          className={textareaClasses}
          placeholder="Descripción de la transacción..."
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="transaction_date" className="text-sm font-medium">
            Fecha *
          </label>
          <input
            id="transaction_date"
            name="transaction_date"
            type="date"
            required
            className={inputClasses}
            defaultValue={new Date().toISOString().split("T")[0]}
          />
          <FieldError messages={state.errors?.transaction_date} />
        </div>
        <div className="space-y-2">
          <label htmlFor="payment_method" className="text-sm font-medium">
            Método de Pago
          </label>
          <select id="payment_method" name="payment_method" className={selectClasses}>
            <option value="">Seleccionar método</option>
            <option value="cash">Efectivo</option>
            <option value="bank_transfer">Transferencia Bancaria</option>
            <option value="card">Tarjeta</option>
            <option value="check">Cheque</option>
            <option value="other">Otro</option>
          </select>
          <FieldError messages={state.errors?.payment_method} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="project_id" className="text-sm font-medium">
            Obra/Proyecto
          </label>
          <select
            id="project_id"
            name="project_id"
            className={selectClasses}
            defaultValue={defaultProjectId || ""}
          >
            <option value="">Sin obra asignada</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="client_id" className="text-sm font-medium">
            Cliente
          </label>
          <select
            id="client_id"
            name="client_id"
            className={selectClasses}
            defaultValue={defaultClientId || ""}
          >
            <option value="">Sin cliente asignado</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="reference" className="text-sm font-medium">
          Referencia
        </label>
        <input
          id="reference"
          name="reference"
          type="text"
          className={inputClasses}
          placeholder="Número de factura, referencia de pago, etc."
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="notes" className="text-sm font-medium">
          Notas
        </label>
        <textarea
          id="notes"
          name="notes"
          className={textareaClasses}
          placeholder="Notas adicionales sobre la transacción..."
        />
      </div>

      <FormMessage status={state.status} message={state.message} />
      <SubmitButton />
    </form>
  );
}

