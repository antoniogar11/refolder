"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { updateCompanyAction } from "@/app/dashboard/empresa/actions";
import type { Company } from "@/lib/data/companies";

const inputStyles =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Guardando..." : children}
    </Button>
  );
}

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;

  return (
    <p className="text-sm text-red-600 dark:text-red-400" role="alert">
      {messages.join(" ")}
    </p>
  );
}

function FormMessage({ state }: { state: { status: string; message?: string; errors?: Record<string, string[]> } }) {
  if (state.status === "idle" || !state.message) return null;

  const styles =
    state.status === "error"
      ? "text-sm text-red-600 dark:text-red-400"
      : "text-sm text-green-600 dark:text-green-400";

  return (
    <p className={styles} role={state.status === "error" ? "alert" : undefined}>
      {state.message}
    </p>
  );
}

type EditCompanyFormProps = {
  company: Company;
};

export function EditCompanyForm({ company }: EditCompanyFormProps) {
  const [state, formAction] = useActionState(updateCompanyAction, { 
    status: "idle" as const,
    errors: undefined 
  });

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="companyId" value={company.id} />
      
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Nombre de la Empresa *
        </label>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={company.name}
          className={inputStyles}
          required
        />
        <FieldError messages={state.errors?.name} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="tax_id" className="text-sm font-medium">
            CIF/NIF
          </label>
          <input
            id="tax_id"
            name="tax_id"
            type="text"
            defaultValue={company.tax_id || ""}
            placeholder="B12345678"
            className={inputStyles}
          />
          <FieldError messages={state.errors?.tax_id} />
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium">
            Teléfono
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={company.phone || ""}
            placeholder="+34 123 456 789"
            className={inputStyles}
          />
          <FieldError messages={state.errors?.phone} />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email de Contacto
        </label>
        <input
          id="email"
          name="email"
          type="email"
          defaultValue={company.email || ""}
          placeholder="contacto@empresa.com"
          className={inputStyles}
        />
        <FieldError messages={state.errors?.email} />
      </div>

      <div className="space-y-2">
        <label htmlFor="address" className="text-sm font-medium">
          Dirección
        </label>
        <input
          id="address"
          name="address"
          type="text"
          defaultValue={company.address || ""}
          placeholder="Calle, número"
          className={inputStyles}
        />
        <FieldError messages={state.errors?.address} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label htmlFor="city" className="text-sm font-medium">
            Ciudad
          </label>
          <input
            id="city"
            name="city"
            type="text"
            defaultValue={company.city || ""}
            placeholder="Madrid"
            className={inputStyles}
          />
          <FieldError messages={state.errors?.city} />
        </div>

        <div className="space-y-2">
          <label htmlFor="province" className="text-sm font-medium">
            Provincia
          </label>
          <input
            id="province"
            name="province"
            type="text"
            defaultValue={company.province || ""}
            placeholder="Madrid"
            className={inputStyles}
          />
          <FieldError messages={state.errors?.province} />
        </div>

        <div className="space-y-2">
          <label htmlFor="postal_code" className="text-sm font-medium">
            Código Postal
          </label>
          <input
            id="postal_code"
            name="postal_code"
            type="text"
            defaultValue={company.postal_code || ""}
            placeholder="28001"
            className={inputStyles}
          />
          <FieldError messages={state.errors?.postal_code} />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="logo_url" className="text-sm font-medium">
          URL del Logo (opcional)
        </label>
        <input
          id="logo_url"
          name="logo_url"
          type="url"
          defaultValue={company.logo_url || ""}
          placeholder="https://ejemplo.com/logo.png"
          className={inputStyles}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          URL de la imagen del logo que aparecerá en facturas y presupuestos
        </p>
        <FieldError messages={state.errors?.logo_url} />
      </div>

      <FormMessage state={state} />
      <SubmitButton>Guardar Datos de la Empresa</SubmitButton>
    </form>
  );
}

