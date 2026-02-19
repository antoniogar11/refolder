"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { NativeSelect } from "@/components/ui/native-select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateTaskStatusAction, deleteTaskAction } from "@/app/dashboard/proyectos/task-actions";
import { Trash2, Loader2 } from "lucide-react";
import type { ProjectTask, TaskStatus } from "@/types";

type TasksListProps = {
  tasks: ProjectTask[];
  projectId: string;
};

const statusConfig: Record<TaskStatus, { label: string; color: string }> = {
  pendiente: { label: "Pendiente", color: "bg-slate-100 text-slate-700" },
  en_progreso: { label: "En progreso", color: "bg-amber-100 text-amber-700" },
  completada: { label: "Completada", color: "bg-emerald-100 text-emerald-700" },
};

export function TasksList({ tasks, projectId }: TasksListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function handleStatusChange(taskId: string, newStatus: string) {
    setUpdatingId(taskId);
    try {
      const result = await updateTaskStatusAction(taskId, newStatus, projectId);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Error al actualizar el estado.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(taskId: string) {
    setDeletingId(taskId);
    try {
      const result = await deleteTaskAction(taskId, projectId);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Error al eliminar la tarea.");
    } finally {
      setDeletingId(null);
    }
  }

  if (tasks.length === 0) {
    return (
      <p className="text-sm text-slate-500 py-4">
        No hay tareas. Añade tareas para organizar el trabajo del proyecto.
      </p>
    );
  }

  const completed = tasks.filter((t) => t.estado === "completada").length;

  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tarea</TableHead>
              <TableHead className="w-[160px]">Estado</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id} className={task.estado === "completada" ? "opacity-60" : ""}>
                <TableCell>
                  <div>
                    <span className="font-medium">{task.nombre}</span>
                    {task.descripcion && (
                      <p className="text-xs text-slate-500 mt-0.5">{task.descripcion}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {updatingId === task.id && (
                      <Loader2 className="h-3 w-3 animate-spin text-amber-500" />
                    )}
                    <NativeSelect
                      value={task.estado}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      disabled={updatingId === task.id}
                      className="h-8 text-xs w-auto"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="en_progreso">En progreso</option>
                      <option value="completada">Completada</option>
                    </NativeSelect>
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(task.id)}
                    disabled={deletingId === task.id}
                    className="h-8 w-8 p-0 text-slate-400 hover:text-rose-500"
                  >
                    {deletingId === task.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-end text-sm font-medium text-slate-600">
        {completed}/{tasks.length} completadas
      </div>
    </div>
  );
}
