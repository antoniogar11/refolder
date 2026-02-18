"use client";

import { useActionState } from "react";

import { updatePasswordAction } from "@/app/auth/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError, FormMessage, SubmitButton } from "@/components/shared/entity-form";
import { initialFormState } from "@/lib/forms/form-state";

export function UpdatePasswordForm() {
  const [state, formAction] = useActionState(updatePasswordAction, initialFormState);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="password">Nueva contraseña</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="Mínimo 6 caracteres"
          required
          minLength={6}
        />
        <FieldError messages={state.errors?.password} />
      </div>

      <FormMessage status={state.status} message={state.message} />
      <SubmitButton label="Actualizar contraseña" pendingLabel="Actualizando..." />
    </form>
  );
}
