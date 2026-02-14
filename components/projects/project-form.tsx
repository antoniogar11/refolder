"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FieldError, FormMessage, SubmitButton } from "@/components/shared/entity-form";
import { createProjectAction, updateProjectAction } from "@/app/dashboard/obras/actions";
import { initialFormState, type FormState } from "@/lib/forms/form-state";
import type { Project, Client } from "@/types";

type ProjectFormProps = {
  project?: Project;
  clients: Pick<Client, "id" | "name">[];
};

export function ProjectForm({ project, clients }: ProjectFormProps) {
  const router = useRouter();
  const action = project
    ? updateProjectAction.bind(null, project.id)
    : createProjectAction;
  const [state, formAction] = useActionState(action, initialFormState);

  if (state.status === "success" && project) {
    router.push("/dashboard/obras");
    router.refresh();
  }

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="name">Nombre de la obra *</Label>
        <Input id="name" name="name" placeholder="Ej. Reforma integral piso" defaultValue={project?.name ?? ""} />
        <FieldError messages={state.errors?.name} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="client_id">Cliente *</Label>
          <select
            id="client_id"
            name="client_id"
            defaultValue={project?.client_id ?? ""}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">Selecciona un cliente</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
          <FieldError messages={state.errors?.client_id} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Estado *</Label>
          <select
            id="status"
            name="status"
            defaultValue={project?.status ?? "planning"}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="planning">Planificación</option>
            <option value="in_progress">En Curso</option>
            <option value="paused">Pausada</option>
            <option value="completed">Finalizada</option>
            <option value="cancelled">Cancelada</option>
          </select>
          <FieldError messages={state.errors?.status} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Dirección de la obra *</Label>
        <Input id="address" name="address" placeholder="Calle, número, piso" defaultValue={project?.address ?? ""} />
        <FieldError messages={state.errors?.address} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea id="description" name="description" placeholder="Detalles de la obra" defaultValue={project?.description ?? ""} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="start_date">Fecha de inicio</Label>
          <Input id="start_date" name="start_date" type="date" defaultValue={project?.start_date ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="estimated_end_date">Fecha fin prevista</Label>
          <Input id="estimated_end_date" name="estimated_end_date" type="date" defaultValue={project?.estimated_end_date ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="total_budget">Presupuesto total</Label>
          <Input id="total_budget" name="total_budget" type="number" step="0.01" placeholder="0.00" defaultValue={project?.total_budget?.toString() ?? ""} />
          <FieldError messages={state.errors?.total_budget} />
        </div>
      </div>

      <FormMessage status={state.status} message={state.message} />
      {project ? (
        <div className="flex gap-2">
          <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>
            Cancelar
          </Button>
          <SubmitButton label="Guardar Cambios" pendingLabel="Guardando..." />
        </div>
      ) : (
        <SubmitButton label="Crear Obra" pendingLabel="Creando..." />
      )}
    </form>
  );
}
