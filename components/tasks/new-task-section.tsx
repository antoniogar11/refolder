"use client";

import { useState } from "react";

import { NewTaskForm } from "./new-task-form";
import { Button } from "@/components/ui/button";

type NewTaskSectionProps = {
  projectId: string;
  onSuccess?: () => void;
};

export function NewTaskSection({ projectId, onSuccess }: NewTaskSectionProps) {
  const [showForm, setShowForm] = useState(false);

  const handleSuccess = () => {
    setShowForm(false);
    if (onSuccess) {
      onSuccess();
    }
  };

  if (!showForm) {
    return (
      <div className="flex justify-center py-4">
        <Button onClick={() => setShowForm(true)} variant="outline">
          + Nueva Tarea
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Nueva Tarea</h3>
        <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
          Cancelar
        </Button>
      </div>
      <NewTaskForm projectId={projectId} onSuccess={handleSuccess} />
    </div>
  );
}

