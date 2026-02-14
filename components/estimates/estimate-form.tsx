"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FieldError, FormMessage, SubmitButton } from "@/components/shared/entity-form";
import { createEstimateAction, updateEstimateAction } from "@/app/dashboard/presupuestos/actions";
import { initialFormState, type FormState } from "@/lib/forms/form-state";
import type { Estimate, Project } from "@/types";

type EstimateFormProps = {
  estimate?: Estimate;
  projects: Pick<Project, "id" | "name">[];
};

export function EstimateForm({ estimate, projects }: EstimateFormProps) {
  const router = useRouter();
  const action = estimate
    ? updateEstimateAction.bind(null, estimate.id)
    : createEstimateAction;
  const [state, formAction] = useActionState(action, initialFormState);

  if (state.status === "success" && estimate) {
    router.push("/dashboard/presupuestos");
    router.refresh();
  }

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="name">Nombre del presupuesto *</Label>
        <Input id="name" name="name" placeholder="Ej. Presupuesto cocina" defaultValue={estimate?.name ?? ""} />
        <FieldError messages={state.errors?.name} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="project_id">Obra *</Label>
          <select
            id="project_id"
            name="project_id"
            defaultValue={estimate?.project_id ?? ""}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">Selecciona una obra</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          <FieldError messages={state.errors?.project_id} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Estado *</Label>
          <select
            id="status"
            name="status"
            defaultValue={estimate?.status ?? "draft"}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="draft">Borrador</option>
            <option value="sent">Enviado</option>
            <option value="accepted">Aceptado</option>
            <option value="rejected">Rechazado</option>
          </select>
          <FieldError messages={state.errors?.status} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="total_amount">Importe total *</Label>
          <Input id="total_amount" name="total_amount" type="number" step="0.01" placeholder="0.00" defaultValue={estimate?.total_amount?.toString() ?? ""} />
          <FieldError messages={state.errors?.total_amount} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="valid_until">Valido hasta</Label>
          <Input id="valid_until" name="valid_until" type="date" defaultValue={estimate?.valid_until ?? ""} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripcion</Label>
        <Textarea id="description" name="description" placeholder="Detalles del presupuesto" defaultValue={estimate?.description ?? ""} />
      </div>

      <FormMessage status={state.status} message={state.message} />
      {estimate ? (
        <div className="flex gap-2">
          <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>
            Cancelar
          </Button>
          <SubmitButton label="Guardar Cambios" pendingLabel="Guardando..." />
        </div>
      ) : (
        <SubmitButton label="Crear Presupuesto" pendingLabel="Creando..." />
      )}
    </form>
  );
}
