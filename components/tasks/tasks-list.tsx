"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { deleteTaskAction } from "@/app/dashboard/obras/[id]/tasks/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Task } from "@/lib/data/tasks";
import { EditTaskForm } from "./edit-task-form";

type TasksListProps = {
  tasks: Task[];
  projectId: string;
};

function getStatusLabel(status: string) {
  const labels: Record<string, { text: string; color: string; bgColor: string }> = {
    pending: { text: "Pendiente", color: "text-yellow-600 dark:text-yellow-400", bgColor: "bg-yellow-100 dark:bg-yellow-900/20" },
    in_progress: { text: "En Progreso", color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-100 dark:bg-blue-900/20" },
    completed: { text: "Completada", color: "text-green-600 dark:text-green-400", bgColor: "bg-green-100 dark:bg-green-900/20" },
    cancelled: { text: "Cancelada", color: "text-red-600 dark:text-red-400", bgColor: "bg-red-100 dark:bg-red-900/20" },
  };
  return labels[status] || { text: status, color: "", bgColor: "" };
}

function getPriorityLabel(priority: string) {
  const labels: Record<string, { text: string; color: string }> = {
    low: { text: "Baja", color: "text-gray-600 dark:text-gray-400" },
    medium: { text: "Media", color: "text-blue-600 dark:text-blue-400" },
    high: { text: "Alta", color: "text-orange-600 dark:text-orange-400" },
    urgent: { text: "Urgente", color: "text-red-600 dark:text-red-400" },
  };
  return labels[priority] || { text: priority, color: "" };
}

function formatDate(dateString: string | null) {
  if (!dateString) return null;
  return new Intl.DateTimeFormat("es-ES", { year: "numeric", month: "short", day: "numeric" }).format(
    new Date(dateString),
  );
}

export function TasksList({ tasks, projectId }: TasksListProps) {
  const router = useRouter();
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

  async function handleDelete(taskId: string, taskTitle: string) {
    if (!confirm(`¿Estás seguro de que quieres eliminar la tarea "${taskTitle}"?`)) {
      return;
    }

    setDeletingTaskId(taskId);
    const result = await deleteTaskAction(taskId, projectId);

    if (result.success) {
      router.refresh();
    } else {
      alert(result.message);
    }
    setDeletingTaskId(null);
  }

  if (tasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tareas</CardTitle>
          <CardDescription>No hay tareas asignadas a esta obra</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tareas ({tasks.length})</h3>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => {
          const statusInfo = getStatusLabel(task.status);
          const priorityInfo = getPriorityLabel(task.priority);
          const isEditing = editingTaskId === task.id;
          const isDeleting = deletingTaskId === task.id;

          if (isEditing) {
            return (
              <Card key={task.id} className="border-blue-300 dark:border-blue-700">
                <CardHeader>
                  <CardTitle className="text-base">Editar Tarea</CardTitle>
                </CardHeader>
                <CardContent>
                  <EditTaskForm
                    task={task}
                    projectId={projectId}
                    onCancel={() => setEditingTaskId(null)}
                    onSuccess={() => {
                      setEditingTaskId(null);
                      router.refresh();
                    }}
                  />
                </CardContent>
              </Card>
            );
          }

          return (
            <Card key={task.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base font-semibold">{task.title}</CardTitle>
                    {task.description && (
                      <CardDescription className="mt-1">{task.description}</CardDescription>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.bgColor} ${statusInfo.color}`}
                    >
                      {statusInfo.text}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex flex-wrap items-center gap-4">
                    {task.priority && (
                      <div className="flex items-center gap-1">
                        <span className="text-gray-600 dark:text-gray-400">Prioridad:</span>
                        <span className={`font-medium ${priorityInfo.color}`}>{priorityInfo.text}</span>
                      </div>
                    )}
                    {task.due_date && (
                      <div className="flex items-center gap-1">
                        <span className="text-gray-600 dark:text-gray-400">Vence:</span>
                        <span className="font-medium">{formatDate(task.due_date)}</span>
                      </div>
                    )}
                    {task.assigned_to && (
                      <div className="flex items-center gap-1">
                        <span className="text-gray-600 dark:text-gray-400">Asignada a:</span>
                        <span className="font-medium">{task.assigned_to}</span>
                      </div>
                    )}
                  </div>
                  {(task.estimated_hours || task.actual_hours) && (
                    <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                      {task.estimated_hours && <span>Estimado: {task.estimated_hours}h</span>}
                      {task.actual_hours && <span>Real: {task.actual_hours}h</span>}
                    </div>
                  )}
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingTaskId(task.id)}
                      disabled={isDeleting}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(task.id, task.title)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Eliminando..." : "Eliminar"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

