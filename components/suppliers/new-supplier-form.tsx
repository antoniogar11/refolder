"use client";

import { useActionState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { createSupplierAction } from "@/app/dashboard/proveedores/actions";

export function NewSupplierForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(
    async (_: unknown, formData: FormData) => {
      const result = await createSupplierAction({ status: "idle" as const }, formData);
      if (result.status === "success") {
        formRef.current?.reset();
      }
      return result;
    },
    { status: "idle" as const },
  );

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-1">
          <Label htmlFor="name">Nombre *</Label>
          <Input id="name" name="name" required placeholder="Nombre del proveedor" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="type">Tipo *</Label>
          <NativeSelect id="type" name="type" defaultValue="other">
            <option value="material">Material</option>
            <option value="labor">Mano de obra</option>
            <option value="service">Servicio</option>
            <option value="other">Otro</option>
          </NativeSelect>
        </div>
        <div className="space-y-1">
          <Label htmlFor="contact_name">Persona de contacto</Label>
          <Input id="contact_name" name="contact_name" placeholder="Nombre contacto" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="phone">Teléfono</Label>
          <Input id="phone" name="phone" placeholder="612 345 678" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="proveedor@email.com" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="city">Ciudad</Label>
          <Input id="city" name="city" placeholder="Ciudad" />
        </div>
      </div>

      <input type="hidden" name="address" value="" />
      <input type="hidden" name="tax_id" value="" />
      <input type="hidden" name="notes" value="" />

      {state?.status === "success" && (
        <p className="text-sm text-emerald-600">{state.message}</p>
      )}
      {state?.status === "error" && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Guardando..." : "Guardar Proveedor"}
      </Button>
    </form>
  );
}
