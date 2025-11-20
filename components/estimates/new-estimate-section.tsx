"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { NewEstimateForm } from "./new-estimate-form";
import { Button } from "@/components/ui/button";

type NewEstimateSectionProps = {
  projects: Array<{ id: string; name: string }>;
  clients: Array<{ id: string; name: string }>;
  defaultProjectId?: string;
  defaultClientId?: string;
  onSuccess?: () => void;
};

export function NewEstimateSection({
  projects,
  clients,
  defaultProjectId,
  defaultClientId,
  onSuccess,
}: NewEstimateSectionProps) {
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
          + Nuevo Presupuesto
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Nuevo Presupuesto</h3>
        <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
          Cancelar
        </Button>
      </div>
      <NewEstimateForm
        projects={projects}
        clients={clients}
        defaultProjectId={defaultProjectId}
        defaultClientId={defaultClientId}
        onSuccess={handleSuccess}
      />
    </div>
  );
}

