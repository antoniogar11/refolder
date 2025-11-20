"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { NewTimeEntryForm } from "./new-time-entry-form";
import { Button } from "@/components/ui/button";

type NewTimeEntrySectionProps = {
  projects: Array<{ id: string; name: string }>;
  tasks?: Array<{ id: string; title: string; project_id: string }>;
  companyMembers?: Array<{ id: string; user_id: string; role: string; user: { id: string; email: string; name?: string } }>;
  isAdmin?: boolean;
  currentUserName?: string;
  defaultProjectId?: string;
  defaultTaskId?: string;
  onSuccess?: () => void;
};

export function NewTimeEntrySection({
  projects,
  tasks = [],
  companyMembers = [],
  isAdmin = false,
  currentUserName,
  defaultProjectId,
  defaultTaskId,
  onSuccess,
}: NewTimeEntrySectionProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);

  const handleSuccess = () => {
    setShowForm(false);
    router.refresh();
    if (onSuccess) {
      onSuccess();
    }
  };

  if (!showForm) {
    return (
      <div className="flex justify-center py-4">
        <Button onClick={() => setShowForm(true)} variant="outline">
          + Añadir Registro
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Nuevo Registro de Tiempo</h3>
        <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
          Cancelar
        </Button>
      </div>
      <NewTimeEntryForm
        projects={projects}
        tasks={tasks}
        companyMembers={companyMembers}
        isAdmin={isAdmin}
        currentUserName={currentUserName}
        defaultProjectId={defaultProjectId}
        defaultTaskId={defaultTaskId}
        onSuccess={handleSuccess}
      />
    </div>
  );
}

