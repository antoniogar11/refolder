"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { EditEstimateForm } from "./edit-estimate-form";
import { Button } from "@/components/ui/button";
import type { EstimateWithRelations } from "@/lib/data/estimates";

type EditEstimateSectionProps = {
  estimate: EstimateWithRelations;
  projects: Array<{ id: string; name: string }>;
  clients: Array<{ id: string; name: string }>;
  onSuccess?: () => void;
};

export function EditEstimateSection({
  estimate,
  projects,
  clients,
  onSuccess,
}: EditEstimateSectionProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);

  const handleSuccess = () => {
    setShowForm(false);
    router.refresh();
    if (onSuccess) {
      onSuccess();
    }
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  if (!showForm) {
    return (
      <div className="flex justify-center py-4">
        <Button onClick={() => setShowForm(true)} variant="outline">
          ✏️ Editar Presupuesto
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Editar Presupuesto</h3>
        <Button variant="ghost" size="sm" onClick={handleCancel}>
          Cancelar
        </Button>
      </div>
      <EditEstimateForm
        estimate={estimate}
        projects={projects}
        clients={clients}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}

