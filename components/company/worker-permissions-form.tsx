"use client";

import { useState } from "react";
import { useActionState } from "react";
import { updateWorkerPermissionsAction } from "@/app/dashboard/empresa/actions";
import { Button } from "@/components/ui/button";
import type { CompanyMemberWithUser } from "@/lib/data/companies";

type WorkerPermissionsFormProps = {
  member: CompanyMemberWithUser;
  isAdmin: boolean;
  companyId: string;
};

const AVAILABLE_PERMISSIONS = [
  { key: "projects:read", label: "Ver proyectos" },
  { key: "projects:write", label: "Crear/editar proyectos" },
  { key: "projects:delete", label: "Eliminar proyectos" },
  { key: "clients:read", label: "Ver clientes" },
  { key: "clients:write", label: "Crear/editar clientes" },
  { key: "clients:delete", label: "Eliminar clientes" },
  { key: "finances:read", label: "Ver finanzas" },
  { key: "finances:write", label: "Crear/editar finanzas" },
  { key: "finances:delete", label: "Eliminar finanzas" },
  { key: "tasks:read", label: "Ver tareas" },
  { key: "tasks:write", label: "Crear/editar tareas" },
  { key: "tasks:delete", label: "Eliminar tareas" },
  { key: "time-tracking:read", label: "Ver control horario" },
  { key: "time-tracking:write", label: "Crear/editar registros horarios" },
  { key: "time-tracking:delete", label: "Eliminar registros horarios" },
  { key: "estimates:read", label: "Ver presupuestos" },
  { key: "estimates:write", label: "Crear/editar presupuestos" },
  { key: "estimates:delete", label: "Eliminar presupuestos" },
  { key: "invoices:read", label: "Ver facturas" },
  { key: "invoices:write", label: "Crear/editar facturas" },
  { key: "invoices:delete", label: "Eliminar facturas" },
];

export function WorkerPermissionsForm({ member, isAdmin, companyId }: WorkerPermissionsFormProps) {
  const [showForm, setShowForm] = useState(false);
  const [permissions, setPermissions] = useState<Record<string, boolean>>(member.permissions || {});
  const updateAction = updateWorkerPermissionsAction.bind(null, companyId, member.user_id);
  const [state, formAction] = useActionState(updateAction, { status: "idle" as const, message: undefined } as { status: "idle" | "success" | "error"; message?: string });

  if (member.role !== "worker") {
    return null;
  }

  const handlePermissionChange = (key: string, value: boolean) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  if (!showForm) {
    const activePermissions = Object.entries(permissions).filter(([_, value]) => value).length;
    return (
      <div className="flex items-center gap-2">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {activePermissions > 0
            ? `${activePermissions} permiso${activePermissions !== 1 ? "s" : ""} activo${activePermissions !== 1 ? "s" : ""}`
            : "Sin permisos asignados"}
        </p>
        {isAdmin && (
          <Button variant="ghost" size="sm" onClick={() => setShowForm(true)}>
            Gestionar Permisos
          </Button>
        )}
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
      <div>
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Permisos del Trabajador</h4>
        <div className="space-y-2">
          {AVAILABLE_PERMISSIONS.map((permission) => (
            <label key={permission.key} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={permissions[permission.key] || false}
                onChange={(e) => handlePermissionChange(permission.key, e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{permission.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Enviar TODOS los permisos como campos ocultos (incluso los desactivados) */}
      {AVAILABLE_PERMISSIONS.map((permission) => {
        const isChecked = permissions[permission.key] === true;
        return (
          <input
            key={permission.key}
            type="hidden"
            name={`permission_${permission.key}`}
            value={isChecked ? "true" : "false"}
          />
        );
      })}

      <div className="flex gap-2">
        <Button type="submit" size="sm">
          Guardar Permisos
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

      {state.status === "success" && (
        <p className="text-sm text-green-600 dark:text-green-400">{state.message}</p>
      )}
      {state.status === "error" && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.message}</p>
      )}
    </form>
  );
}

