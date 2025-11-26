"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { registerAction } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { initialAuthState } from "@/lib/auth/types";
import { GoogleButton } from "@/components/auth/google-button";

const inputStyles =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Creando cuenta..." : children}
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

function FormMessage({ status, message }: { status: string; message?: string }) {
  if (!message || status === "idle") return null;

  const styles =
    status === "error"
      ? "text-sm text-red-600 dark:text-red-400"
      : "text-sm text-green-600 dark:text-green-400";

  return (
    <p className={styles} role={status === "error" ? "alert" : undefined}>
      {message}
    </p>
  );
}

export function RegisterForm() {
  const [state, formAction] = useActionState(registerAction, initialAuthState);

  return (
    <div className="space-y-4">
      <GoogleButton />
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            O regístrate con email
          </span>
        </div>
      </div>
      <form action={formAction} className="space-y-4" noValidate>
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Nombre
          </label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="Tu nombre"
          className={inputStyles}
          required
        />
        <FieldError messages={state.errors?.name} />
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="tu@email.com"
          className={inputStyles}
          required
        />
        <FieldError messages={state.errors?.email} />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          className={inputStyles}
          required
        />
        <FieldError messages={state.errors?.password} />
      </div>

        <FormMessage status={state.status} message={state.message} />
        <SubmitButton>Crear Cuenta</SubmitButton>
      </form>
    </div>
  );
}

