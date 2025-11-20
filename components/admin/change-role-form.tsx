"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import { updateUserRoleAction } from "@/app/dashboard/admin/roles/actions";
import { Button } from "@/components/ui/button";
import { getAvailableRoles, getRoleInfo, type UserRole } from "@/lib/auth/roles-client";

type ChangeRoleFormProps = {
  userId: string;
  currentRole: UserRole;
  userName: string;
};

export function ChangeRoleForm({ userId, currentRole, userName }: ChangeRoleFormProps) {
  const [showForm, setShowForm] = useState(false);
  const updateAction = updateUserRoleAction.bind(null, userId);
  const [state, formAction] = useActionState(updateAction, { status: "idle" as const, message: undefined } as { status: "idle" | "success" | "error"; message?: string });

  const roles = getAvailableRoles();

  // Cerrar el formulario cuando se actualiza exitosamente
  useEffect(() => {
    if (state.status === "success") {
      setTimeout(() => {
        setShowForm(false);
      }, 1500);
    }
  }, [state.status]);

  if (!showForm) {
    return (
      <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
        Cambiar Rol
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      <form action={formAction} className="space-y-2">
        <select
          name="role"
          defaultValue={currentRole}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          {roles.map((role) => {
            const roleInfo = getRoleInfo(role);
            return (
              <option key={role} value={role}>
                {roleInfo.label} ({role})
              </option>
            );
          })}
        </select>
        <div className="flex gap-2">
          <Button type="submit" size="sm">
            Guardar
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setShowForm(false);
            }}
          >
            Cancelar
          </Button>
        </div>
      </form>
      {state.status === "success" && (
        <p className="text-sm text-green-600 dark:text-green-400">{state.message}</p>
      )}
      {state.status === "error" && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.message}</p>
      )}
    </div>
  );
}

