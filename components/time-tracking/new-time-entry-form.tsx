"use client";

import { useEffect } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";

import { createTimeEntryAction } from "@/app/dashboard/control-horario/actions";
import { Button } from "@/components/ui/button";
import { initialTimeEntryFormState } from "@/lib/forms/time-entry-form-state";

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
      {pending ? "Guardando..." : "Registrar Tiempo"}
    </Button>
  );
}

type NewTimeEntryFormProps = {
  projects: Array<{ id: string; name: string }>;
  tasks?: Array<{ id: string; title: string; project_id: string }>;
  companyMembers?: Array<{ id: string; user_id: string; role: string; user: { id: string; email: string; name?: string } }>;
  isAdmin?: boolean;
  currentUserName?: string;
  defaultProjectId?: string;
  defaultTaskId?: string;
  defaultAssignedUserId?: string;
  onSuccess?: () => void;
};

export function NewTimeEntryForm({
  projects,
  tasks = [],
  companyMembers = [],
  isAdmin = false,
  currentUserName,
  defaultProjectId,
  defaultTaskId,
  defaultAssignedUserId,
  onSuccess,
}: NewTimeEntryFormProps) {
  const router = useRouter();
  const [state, formAction] = useActionState(createTimeEntryAction, initialTimeEntryFormState);

  useEffect(() => {
    if (state.status === "success") {
      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
      }
      const form = document.getElementById("new-time-entry-form") as HTMLFormElement;
      if (form) {
        form.reset();
      }
    }
  }, [state.status, onSuccess, router]);

  const filteredTasks = defaultProjectId
    ? tasks.filter((task) => task.project_id === defaultProjectId)
    : tasks;

  return (
    <form id="new-time-entry-form" action={formAction} className="space-y-4" noValidate>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="entry_date" className="text-sm font-medium">
            Fecha *
          </label>
          <input
            id="entry_date"
            name="entry_date"
            type="date"
            required
            className={inputClasses}
            defaultValue={new Date().toISOString().split("T")[0]}
          />
          <FieldError messages={state.errors?.entry_date} />
        </div>
        <div className="space-y-2">
          <label htmlFor="project_id" className="text-sm font-medium">
            Obra/Proyecto
          </label>
          <select
            id="project_id"
            name="project_id"
            className={selectClasses}
            defaultValue={defaultProjectId || ""}
          >
            <option value="">Sin obra asignada</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="task_id" className="text-sm font-medium">
            Tarea
          </label>
          <select id="task_id" name="task_id" className={selectClasses} defaultValue={defaultTaskId || ""}>
            <option value="">Sin tarea asignada</option>
            {filteredTasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.title}
              </option>
            ))}
          </select>
        </div>
        
        {isAdmin && (
          <div className="space-y-2">
            <label htmlFor="assigned_user_id" className="text-sm font-medium">
              Trabajador
            </label>
            <select 
              id="assigned_user_id" 
              name="assigned_user_id" 
              className={selectClasses}
              defaultValue={defaultAssignedUserId || ""}
            >
              <option value="">{currentUserName || "Yo mismo"} (por defecto)</option>
              {companyMembers.length > 0 && companyMembers.map((member) => (
                <option key={member.user_id} value={member.user_id}>
                  {member.user.name || member.user.email || member.user_id}
                  {member.role === "admin" ? " (Admin)" : ""}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {companyMembers.length > 0
                ? "Selecciona el trabajador para el que se registra el tiempo"
                : "Por defecto se registrará para ti mismo. Añade más trabajadores a tu empresa para asignar registros a otros."}
            </p>
          </div>
        )}
      </div>

      <div className="space-y-4 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div>
          <h3 className="text-sm font-medium mb-2">Tiempo trabajado</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Puedes registrar el tiempo de dos formas: especificando hora de inicio y fin, o directamente el número de horas trabajadas.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="start_time" className="text-sm font-medium">
              Hora de Inicio
            </label>
            <input
              id="start_time"
              name="start_time"
              type="time"
              className={inputClasses}
            />
            <FieldError messages={state.errors?.start_time} />
          </div>
          <div className="space-y-2">
            <label htmlFor="end_time" className="text-sm font-medium">
              Hora de Fin
            </label>
            <input
              id="end_time"
              name="end_time"
              type="time"
              className={inputClasses}
            />
            <FieldError messages={state.errors?.end_time} />
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-300 dark:border-gray-600"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">O</span>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="hours_worked" className="text-sm font-medium">
            Horas Trabajadas
          </label>
          <div className="flex items-center gap-2">
            <input
              id="hours_worked"
              name="hours_worked"
              type="number"
              step="0.25"
              min="0"
              className={inputClasses}
              placeholder="Ej: 8 o 7.5 (para 7 horas y media)"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">horas</span>
          </div>
          <FieldError messages={state.errors?.hours_worked} />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Introduce directamente el número de horas (puedes usar decimales, ej: 8.5 para 8 horas y media)
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Descripción
        </label>
        <textarea
          id="description"
          name="description"
          className={textareaClasses}
          placeholder="Describe las actividades realizadas..."
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
          placeholder="Notas adicionales sobre el registro de tiempo..."
        />
      </div>

      <FormMessage status={state.status} message={state.message} />
      <SubmitButton />
    </form>
  );
}

