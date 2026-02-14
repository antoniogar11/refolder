"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FieldError, FormMessage, SubmitButton } from "@/components/shared/entity-form";
import { createSupplierAction, updateSupplierAction } from "@/app/dashboard/proveedores/actions";
import { initialFormState, type FormState } from "@/lib/forms/form-state";
import type { Supplier } from "@/types";

type SupplierFormProps = {
  supplier?: Supplier;
};

export function SupplierForm({ supplier }: SupplierFormProps) {
  const router = useRouter();
  const action = supplier
    ? updateSupplierAction.bind(null, supplier.id)
    : createSupplierAction;
  const [state, formAction] = useActionState(action, initialFormState);

  if (state.status === "success" && supplier) {
    router.push("/dashboard/proveedores");
    router.refresh();
  }

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="name">Nombre *</Label>
        <Input id="name" name="name" placeholder="Nombre del proveedor" defaultValue={supplier?.name ?? ""} />
        <FieldError messages={state.errors?.name} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Tipo *</Label>
        <select
          id="type"
          name="type"
          defaultValue={supplier?.type ?? "other"}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="material">Material</option>
          <option value="labor">Mano de obra</option>
          <option value="service">Servicio</option>
          <option value="other">Otro</option>
        </select>
        <FieldError messages={state.errors?.type} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact_name">Persona de contacto</Label>
          <Input id="contact_name" name="contact_name" placeholder="Nombre de contacto" defaultValue={supplier?.contact_name ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input id="phone" name="phone" placeholder="+34 600 000 000" defaultValue={supplier?.phone ?? ""} />
          <FieldError messages={state.errors?.phone} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="proveedor@ejemplo.com" defaultValue={supplier?.email ?? ""} />
          <FieldError messages={state.errors?.email} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tax_id">CIF / NIF</Label>
          <Input id="tax_id" name="tax_id" placeholder="B12345678" defaultValue={supplier?.tax_id ?? ""} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="address">Dirección</Label>
          <Input id="address" name="address" placeholder="Calle y número" defaultValue={supplier?.address ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">Población</Label>
          <Input id="city" name="city" placeholder="Madrid" defaultValue={supplier?.city ?? ""} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notas</Label>
        <Textarea id="notes" name="notes" placeholder="Información adicional" defaultValue={supplier?.notes ?? ""} />
      </div>

      <FormMessage status={state.status} message={state.message} />
      {supplier ? (
        <div className="flex gap-2">
          <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>
            Cancelar
          </Button>
          <SubmitButton label="Guardar Cambios" pendingLabel="Guardando..." />
        </div>
      ) : (
        <SubmitButton label="Guardar Proveedor" pendingLabel="Guardando..." />
      )}
    </form>
  );
}
