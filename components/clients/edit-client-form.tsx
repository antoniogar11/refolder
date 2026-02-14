"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";

import { updateClientAction } from "@/app/dashboard/clientes/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FieldError, FormMessage, SubmitButton } from "@/components/shared/entity-form";
import type { FormState } from "@/lib/forms/form-state";
import { initialFormState } from "@/lib/forms/form-state";
import type { Client } from "@/types";

type EditClientFormProps = {
  client: Client;
};

export function EditClientForm({ client }: EditClientFormProps) {
  const router = useRouter();
  const updateAction = updateClientAction.bind(null, client.id);
  const [state, formAction] = useActionState(updateAction, initialFormState);

  if (state.status === "success") {
    router.push("/dashboard/clientes");
    router.refresh();
  }

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="name">Nombre *</Label>
        <Input
          id="name"
          name="name"
          type="text"
          required
          placeholder="Ej. Juan Pérez"
          defaultValue={client.name}
        />
        <FieldError messages={state.errors?.name} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="juan@ejemplo.com"
            defaultValue={client.email || ""}
          />
          <FieldError messages={state.errors?.email} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            name="phone"
            type="text"
            placeholder="+34 600 000 000"
            defaultValue={client.phone || ""}
          />
          <FieldError messages={state.errors?.phone} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Dirección</Label>
        <Input
          id="address"
          name="address"
          type="text"
          placeholder="Calle y número"
          defaultValue={client.address || ""}
        />
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
            defaultValue={client.postal_code || ""}
          />
          <FieldError messages={state.errors?.postal_code} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">Población</Label>
          <Input
            id="city"
            name="city"
            type="text"
            placeholder="Madrid"
            defaultValue={client.city || ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="province">Provincia</Label>
          <Input
            id="province"
            name="province"
            type="text"
            placeholder="Madrid"
            defaultValue={client.province || ""}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tax_id">CIF / NIF</Label>
        <Input
          id="tax_id"
          name="tax_id"
          type="text"
          placeholder="12345678A o B12345678"
          defaultValue={client.tax_id || ""}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Información adicional"
          defaultValue={client.notes || ""}
        />
      </div>

      <FormMessage status={state.status} message={state.message} />
      <div className="flex gap-2">
        <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>
          Cancelar
        </Button>
        <SubmitButton label="Guardar Cambios" />
      </div>
    </form>
  );
}
