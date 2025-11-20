"use client";

import { useState } from "react";
import { useActionState } from "react";
import { addCompanyMemberAction } from "@/app/dashboard/empresa/actions";
import { Button } from "@/components/ui/button";

type AddMemberFormProps = {
  companyId: string;
};

export function AddMemberForm({ companyId }: AddMemberFormProps) {
  const [showForm, setShowForm] = useState(false);
  const addAction = addCompanyMemberAction.bind(null, companyId);
  const [state, formAction] = useActionState(addAction, { status: "idle" as const, message: undefined } as { status: "idle" | "success" | "error"; message?: string });

  if (!showForm) {
    return (
      <Button onClick={() => setShowForm(true)} variant="outline">
        + Añadir Miembro
      </Button>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email del usuario
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="usuario@ejemplo.com"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="role" className="text-sm font-medium">
          Rol
        </label>
        <select
          id="role"
          name="role"
          required
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="admin">Administrador</option>
          <option value="worker">Trabajador</option>
        </select>
      </div>

      <div className="flex gap-2">
        <Button type="submit">Añadir</Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setShowForm(false);
          }}
        >
          Cancelar
        </Button>
      </div>

      {state.status === "success" && (
        <p className="text-sm text-green-600 dark:text-green-400">{state.message}</p>
      )}
      {state.status === "error" && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.message}</p>
      )}
    </form>
  );
}

