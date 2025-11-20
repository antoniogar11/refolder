"use client";

import { useEffect } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";

import { createTaskAction } from "@/app/dashboard/obras/[id]/tasks/actions";
import { Button } from "@/components/ui/button";
import { initialTaskFormState } from "@/lib/forms/task-form-state";

const inputClasses =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const textareaClasses =
  "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

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
      {pending ? "Guardando..." : "Crear Tarea"}
    </Button>
  );
}

type NewTaskFormProps = {
  projectId: string;
  onSuccess?: () => void;
};

export function NewTaskForm({ projectId, onSuccess }: NewTaskFormProps) {
  const router = useRouter();
  const createAction = createTaskAction.bind(null, projectId);
  const [state, formAction] = useActionState(createAction, initialTaskFormState);

  useEffect(() => {
    if (state.status === "success") {
      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
      }
      // Resetear el formulario
      const form = document.getElementById("new-task-form") as HTMLFormElement;
      if (form) {
        form.reset();
      }
    }
  }, [state.status, onSuccess, router]);

  return (
    <form id="new-task-form" action={formAction} className="space-y-4" noValidate>
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">
          Título de la Tarea *
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          className={inputClasses}
          placeholder="Ej. Instalar azulejos en la cocina"
        />
        <FieldError messages={state.errors?.title} />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Descripción
        </label>
        <textarea
          id="description"
          name="description"
          className={textareaClasses}
          placeholder="Descripción detallada de la tarea..."
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="status" className="text-sm font-medium">
            Estado *
          </label>
          <select id="status" name="status" required className={selectClasses} defaultValue="pending">
            <option value="pending">Pendiente</option>
            <option value="in_progress">En Progreso</option>
            <option value="completed">Completada</option>
            <option value="cancelled">Cancelada</option>
          </select>
          <FieldError messages={state.errors?.status} />
        </div>
        <div className="space-y-2">
          <label htmlFor="priority" className="text-sm font-medium">
            Prioridad
          </label>
          <select id="priority" name="priority" className={selectClasses} defaultValue="medium">
            <option value="low">Baja</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
            <option value="urgent">Urgente</option>
          </select>
          <FieldError messages={state.errors?.priority} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="due_date" className="text-sm font-medium">
            Fecha de Vencimiento
          </label>
          <input id="due_date" name="due_date" type="date" className={inputClasses} />
        </div>
        <div className="space-y-2">
          <label htmlFor="assigned_to" className="text-sm font-medium">
            Asignada a
          </label>
          <input
            id="assigned_to"
            name="assigned_to"
            type="text"
            className={inputClasses}
            placeholder="Nombre del responsable"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="estimated_hours" className="text-sm font-medium">
            Horas Estimadas
          </label>
          <input
            id="estimated_hours"
            name="estimated_hours"
            type="number"
            step="0.5"
            min="0"
            className={inputClasses}
            placeholder="0.0"
          />
          <FieldError messages={state.errors?.estimated_hours} />
        </div>
        <div className="space-y-2">
          <label htmlFor="actual_hours" className="text-sm font-medium">
            Horas Reales
          </label>
          <input
            id="actual_hours"
            name="actual_hours"
            type="number"
            step="0.5"
            min="0"
            className={inputClasses}
            placeholder="0.0"
          />
          <FieldError messages={state.errors?.actual_hours} />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="notes" className="text-sm font-medium">
          Notas
        </label>
        <textarea
          id="notes"
          name="notes"
          className={textareaClasses}
          placeholder="Notas adicionales sobre la tarea..."
        />
      </div>

      <FormMessage status={state.status} message={state.message} />
      <SubmitButton />
    </form>
  );
}

