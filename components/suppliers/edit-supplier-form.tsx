"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { FieldError, FormMessage, SubmitButton } from "@/components/shared/entity-form";
import type { FormState } from "@/lib/forms/form-state";
import { initialFormState } from "@/lib/forms/form-state";
import type { Supplier } from "@/types";

type EditSupplierFormProps = {
  supplier: Supplier;
  updateAction: (supplierId: string, _: FormState, formData: FormData) => Promise<FormState>;
};

export function EditSupplierForm({ supplier, updateAction }: EditSupplierFormProps) {
  const router = useRouter();
  const boundAction = updateAction.bind(null, supplier.id);
  const [state, formAction] = useActionState(boundAction, initialFormState);

  if (state.status === "success") {
    router.push("/dashboard/proveedores");
    router.refresh();
  }

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre *</Label>
          <Input
            id="name"
            name="name"
            required
            placeholder="Nombre del proveedor"
            defaultValue={supplier.name}
          />
          <FieldError messages={state.errors?.name} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Tipo *</Label>
          <NativeSelect id="type" name="type" defaultValue={supplier.type}>
            <option value="material">Material</option>
            <option value="labor">Mano de obra</option>
            <option value="service">Servicio</option>
            <option value="other">Otro</option>
          </NativeSelect>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact_name">Persona de contacto</Label>
          <Input
            id="contact_name"
            name="contact_name"
            placeholder="Nombre del contacto"
            defaultValue={supplier.contact_name || ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tax_id">CIF / NIF</Label>
          <Input
            id="tax_id"
            name="tax_id"
            placeholder="B12345678"
            defaultValue={supplier.tax_id || ""}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="proveedor@email.com"
            defaultValue={supplier.email || ""}
          />
          <FieldError messages={state.errors?.email} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            name="phone"
            placeholder="612 345 678"
            defaultValue={supplier.phone || ""}
          />
          <FieldError messages={state.errors?.phone} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Dirección</Label>
        <Input
          id="address"
          name="address"
          placeholder="Calle y número"
          defaultValue={supplier.address || ""}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="city">Ciudad</Label>
        <Input
          id="city"
          name="city"
          placeholder="Ciudad"
          defaultValue={supplier.city || ""}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Información adicional"
          defaultValue={supplier.notes || ""}
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
