"use client";

import { useEffect } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";

import { createProjectAction } from "@/app/dashboard/obras/actions";
import { Button } from "@/components/ui/button";
import { initialProjectFormState } from "@/lib/forms/project-form-state";

const inputClasses =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const textareaClasses =
  "flex min-h-[96px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const selectClasses =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return (
    <p className="text-sm text-red-600 dark:text-red-400" role="alert">
      {messages.join(" ")}
    </p>
  );
}

function FormMessage({ status, message }: { status: "idle" | "success" | "error"; message?: string }) {
  if (!message || status === "idle") return null;

  const styles =
    status === "error"
      ? "text-sm text-red-600 dark:text-red-400"
      : "text-sm text-green-600 dark:text-green-400";

  return <p className={styles}>{message}</p>;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Guardando..." : "Guardar Obra"}
    </Button>
  );
}

type ClientOption = {
  id: string;
  name: string;
};

type NewProjectFormProps = {
  clients: ClientOption[];
  onSuccess?: () => void;
};

export function NewProjectForm({ clients, onSuccess }: NewProjectFormProps) {
  const router = useRouter();
  const [state, formAction] = useActionState(createProjectAction, initialProjectFormState);

  useEffect(() => {
    if (state.status === "success") {
      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
      }
      // Resetear el formulario
      const form = document.getElementById("new-project-form") as HTMLFormElement;
      if (form) {
        form.reset();
      }
    }
  }, [state.status, onSuccess, router]);

  return (
    <form id="new-project-form" action={formAction} className="space-y-4" noValidate>
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Nombre de la Obra *
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className={inputClasses}
          placeholder="Ej. Reforma de cocina"
        />
        <FieldError messages={state.errors?.name} />
      </div>

      <div className="space-y-2">
        <label htmlFor="client_id" className="text-sm font-medium">
          Cliente
        </label>
        <select id="client_id" name="client_id" className={selectClasses}>
          <option value="">Seleccionar cliente (opcional)</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Descripción
        </label>
        <textarea
          id="description"
          name="description"
          className={textareaClasses}
          placeholder="Descripción del proyecto..."
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="status" className="text-sm font-medium">
            Estado *
          </label>
          <select id="status" name="status" required className={selectClasses} defaultValue="planning">
            <option value="planning">Planificación</option>
            <option value="in_progress">En Curso</option>
            <option value="completed">Completado</option>
            <option value="cancelled">Cancelado</option>
          </select>
          <FieldError messages={state.errors?.status} />
        </div>
        <div className="space-y-2">
          <label htmlFor="budget" className="text-sm font-medium">
            Presupuesto (€)
          </label>
          <input
            id="budget"
            name="budget"
            type="number"
            step="0.01"
            min="0"
            className={inputClasses}
            placeholder="0.00"
          />
          <FieldError messages={state.errors?.budget} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="start_date" className="text-sm font-medium">
            Fecha de Inicio
          </label>
          <input id="start_date" name="start_date" type="date" className={inputClasses} />
          <FieldError messages={state.errors?.start_date} />
        </div>
        <div className="space-y-2">
          <label htmlFor="end_date" className="text-sm font-medium">
            Fecha de Finalización
          </label>
          <input id="end_date" name="end_date" type="date" className={inputClasses} />
          <FieldError messages={state.errors?.end_date} />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="address" className="text-sm font-medium">
          Dirección de la Obra
        </label>
        <input
          id="address"
          name="address"
          type="text"
          className={inputClasses}
          placeholder="Calle y número"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="notes" className="text-sm font-medium">
          Notas
        </label>
        <textarea
          id="notes"
          name="notes"
          className={textareaClasses}
          placeholder="Información adicional sobre el proyecto..."
        />
      </div>

      <FormMessage status={state.status} message={state.message} />
      <SubmitButton />
    </form>
  );
}

