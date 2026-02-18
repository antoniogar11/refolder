"use client";

import { useActionState } from "react";

import { resetPasswordAction } from "@/app/auth/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError, FormMessage, SubmitButton } from "@/components/shared/entity-form";
import { initialFormState } from "@/lib/forms/form-state";

export function ResetPasswordForm() {
  const [state, formAction] = useActionState(resetPasswordAction, initialFormState);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="tu@email.com"
          required
        />
        <FieldError messages={state.errors?.email} />
      </div>

      <FormMessage status={state.status} message={state.message} />
      <SubmitButton label="Enviar enlace" pendingLabel="Enviando..." />
    </form>
  );
}
