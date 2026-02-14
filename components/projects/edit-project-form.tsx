"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";

import { updateProjectAction } from "@/app/dashboard/proyectos/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { FieldError, FormMessage, SubmitButton } from "@/components/shared/entity-form";
import type { FormState } from "@/lib/forms/form-state";
import { initialFormState } from "@/lib/forms/form-state";
import type { Project } from "@/types";

type EditProjectFormProps = {
  project: Project;
  clients: { id: string; name: string }[];
};

export function EditProjectForm({ project, clients }: EditProjectFormProps) {
  const router = useRouter();
  const updateAction = updateProjectAction.bind(null, project.id);
  const [state, formAction] = useActionState(updateAction, initialFormState);

  if (state.status === "success") {
    router.push("/dashboard/proyectos");
    router.refresh();
  }

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="name">Nombre del proyecto *</Label>
        <Input
          id="name"
          name="name"
          type="text"
          required
          placeholder="Ej. Reforma integral piso"
          defaultValue={project.name}
        />
        <FieldError messages={state.errors?.name} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="client_id">Cliente *</Label>
          <NativeSelect
            id="client_id"
            name="client_id"
            required
            defaultValue={project.client_id}
          >
            <option value="">Seleccionar cliente...</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </NativeSelect>
          <FieldError messages={state.errors?.client_id} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Estado</Label>
          <NativeSelect
            id="status"
            name="status"
            defaultValue={project.status}
          >
            <option value="planning">Planificación</option>
            <option value="in_progress">En Curso</option>
            <option value="paused">Pausada</option>
            <option value="completed">Finalizada</option>
            <option value="cancelled">Cancelada</option>
          </NativeSelect>
          <FieldError messages={state.errors?.status} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Detalles del proyecto"
          defaultValue={project.description || ""}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Dirección *</Label>
        <Input
          id="address"
          name="address"
          type="text"
          required
          placeholder="Calle, número, piso"
          defaultValue={project.address}
        />
        <FieldError messages={state.errors?.address} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="start_date">Fecha de inicio</Label>
          <Input
            id="start_date"
            name="start_date"
            type="date"
            defaultValue={project.start_date || ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="estimated_end_date">Fecha fin prevista</Label>
          <Input
            id="estimated_end_date"
            name="estimated_end_date"
            type="date"
            defaultValue={project.estimated_end_date || ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="total_budget">Presupuesto total</Label>
          <Input
            id="total_budget"
            name="total_budget"
            type="number"
            step="0.01"
            placeholder="0.00"
            defaultValue={project.total_budget?.toString() || ""}
          />
          <FieldError messages={state.errors?.total_budget} />
        </div>
      </div>

      <FormMessage status={state.status} message={state.message} />
      <div className="flex gap-2">
        <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>
          Cancelar
        </Button>
        <SubmitButton label="Guardar Cambios" />
      </div>
    </form>
  );
}
