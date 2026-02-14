"use client";

import { useActionState } from "react";

import { createClientAction } from "@/app/dashboard/clientes/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FieldError, FormMessage, SubmitButton } from "@/components/shared/entity-form";
import { initialFormState } from "@/lib/forms/form-state";

export function NewClientForm() {
  const [state, formAction] = useActionState(createClientAction, initialFormState);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="name">Nombre *</Label>
        <Input id="name" name="name" type="text" required placeholder="Ej. Juan Pérez" />
        <FieldError messages={state.errors?.name} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="juan@ejemplo.com" />
          <FieldError messages={state.errors?.email} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input id="phone" name="phone" type="text" placeholder="+34 600 000 000" />
          <FieldError messages={state.errors?.phone} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Dirección</Label>
        <Input id="address" name="address" type="text" placeholder="Calle y número" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="postal_code">Código Postal</Label>
          <Input
            id="postal_code"
            name="postal_code"
            type="text"
            placeholder="28001"
            maxLength={5}
          />
          <FieldError messages={state.errors?.postal_code} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">Población</Label>
          <Input id="city" name="city" type="text" placeholder="Madrid" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="province">Provincia</Label>
          <Input id="province" name="province" type="text" placeholder="Madrid" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tax_id">CIF / NIF</Label>
        <Input
          id="tax_id"
          name="tax_id"
          type="text"
          placeholder="12345678A o B12345678"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notas</Label>
        <Textarea id="notes" name="notes" placeholder="Información adicional" />
      </div>

      <FormMessage status={state.status} message={state.message} />
      <SubmitButton label="Guardar Cliente" />
    </form>
  );
}
