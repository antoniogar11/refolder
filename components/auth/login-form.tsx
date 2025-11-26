"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { KeyboardEvent } from "react";

import { loginAction } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { initialAuthState, type AuthFormState } from "@/lib/auth/types";
import { GoogleButton } from "@/components/auth/google-button";

const inputStyles =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Procesando..." : children}
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

function FormMessage({ state }: { state: AuthFormState }) {
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

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialAuthState);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, nextFieldId: string | null) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (nextFieldId) {
        const nextField = document.getElementById(nextFieldId);
        if (nextField) {
          nextField.focus();
        }
      } else {
        // Si no hay siguiente campo, enviar el formulario
        const form = e.currentTarget.form;
        if (form) {
          form.requestSubmit();
        }
      }
    }
  };

  return (
    <div className="space-y-4">
      <GoogleButton />
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            O continúa con email
          </span>
        </div>
      </div>
      <form action={formAction} className="space-y-4" noValidate>
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
          onKeyDown={(e) => handleKeyDown(e, "password")}
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
          autoComplete="current-password"
          placeholder="••••••••"
          className={inputStyles}
          required
          onKeyDown={(e) => handleKeyDown(e, null)}
        />
        <FieldError messages={state.errors?.password} />
      </div>

        <FormMessage state={state} />
        <SubmitButton>Iniciar Sesión</SubmitButton>
      </form>
    </div>
  );
}

