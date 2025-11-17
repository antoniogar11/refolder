"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { createClientAction } from "@/app/dashboard/clientes/actions";
import { Button } from "@/components/ui/button";
import { initialClientFormState } from "@/lib/forms/client-form-state";

const inputClasses =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const textareaClasses =
  "flex min-h-[96px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

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
      {pending ? "Guardando..." : "Guardar Cliente"}
    </Button>
  );
}

export function NewClientForm() {
  const [state, formAction] = useActionState(createClientAction, initialClientFormState);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Nombre *
        </label>
        <input id="name" name="name" type="text" required className={inputClasses} placeholder="Ej. Juan Pérez" />
        <FieldError messages={state.errors?.name} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input id="email" name="email" type="email" className={inputClasses} placeholder="juan@ejemplo.com" />
          <FieldError messages={state.errors?.email} />
        </div>
        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium">
            Teléfono
          </label>
          <input id="phone" name="phone" type="text" className={inputClasses} placeholder="+34 600 000 000" />
          <FieldError messages={state.errors?.phone} />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="address" className="text-sm font-medium">
          Dirección
        </label>
        <input id="address" name="address" type="text" className={inputClasses} placeholder="Calle y número" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label htmlFor="postal_code" className="text-sm font-medium">
            Código Postal
          </label>
          <input
            id="postal_code"
            name="postal_code"
            type="text"
            className={inputClasses}
            placeholder="28001"
            maxLength={5}
          />
          <FieldError messages={state.errors?.postal_code} />
        </div>
        <div className="space-y-2">
          <label htmlFor="city" className="text-sm font-medium">
            Población
          </label>
          <input id="city" name="city" type="text" className={inputClasses} placeholder="Madrid" />
        </div>
        <div className="space-y-2">
          <label htmlFor="province" className="text-sm font-medium">
            Provincia
          </label>
          <input id="province" name="province" type="text" className={inputClasses} placeholder="Madrid" />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="tax_id" className="text-sm font-medium">
          CIF / NIF
        </label>
        <input
          id="tax_id"
          name="tax_id"
          type="text"
          className={inputClasses}
          placeholder="12345678A o B12345678"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="notes" className="text-sm font-medium">
          Notas
        </label>
        <textarea id="notes" name="notes" className={textareaClasses} placeholder="Información adicional" />
      </div>

      <FormMessage status={state.status} message={state.message} />
      <SubmitButton />
    </form>
  );
}

