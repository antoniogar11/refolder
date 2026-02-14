"use client";

import { useActionState } from "react";

import { registerAction } from "@/app/auth/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError, FormMessage, SubmitButton } from "@/components/shared/entity-form";
import { initialFormState } from "@/lib/forms/form-state";

export function RegisterForm() {
  const [state, formAction] = useActionState(registerAction, initialFormState);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="Tu nombre"
          required
        />
        <FieldError messages={state.errors?.name} />
      </div>

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

      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          required
        />
        <FieldError messages={state.errors?.password} />
      </div>

      <FormMessage status={state.status} message={state.message} />
      <SubmitButton label="Crear Cuenta" pendingLabel="Creando cuenta..." />
    </form>
  );
}
