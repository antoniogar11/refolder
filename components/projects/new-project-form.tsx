"use client";

import { useActionState } from "react";

import { createProjectAction } from "@/app/dashboard/obras/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { FieldError, FormMessage, SubmitButton } from "@/components/shared/entity-form";
import { initialFormState } from "@/lib/forms/form-state";

type NewProjectFormProps = {
  clients: { id: string; name: string }[];
};

export function NewProjectForm({ clients }: NewProjectFormProps) {
  const [state, formAction] = useActionState(createProjectAction, initialFormState);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="name">Nombre de la obra *</Label>
        <Input id="name" name="name" type="text" required placeholder="Ej. Reforma integral piso" />
        <FieldError messages={state.errors?.name} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="client_id">Cliente *</Label>
          <NativeSelect
            id="client_id"
            name="client_id"
            required
            defaultValue=""
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
            defaultValue="planning"
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
        <Textarea id="description" name="description" placeholder="Detalles de la obra" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Dirección *</Label>
        <Input id="address" name="address" type="text" required placeholder="Calle, número, piso" />
        <FieldError messages={state.errors?.address} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="start_date">Fecha de inicio</Label>
          <Input id="start_date" name="start_date" type="date" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="estimated_end_date">Fecha fin prevista</Label>
          <Input id="estimated_end_date" name="estimated_end_date" type="date" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="total_budget">Presupuesto total</Label>
          <Input id="total_budget" name="total_budget" type="number" step="0.01" placeholder="0.00" />
          <FieldError messages={state.errors?.total_budget} />
        </div>
      </div>

      <FormMessage status={state.status} message={state.message} />
      <SubmitButton label="Crear Obra" />
    </form>
  );
}
