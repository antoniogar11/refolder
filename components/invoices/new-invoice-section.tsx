"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { NewInvoiceForm } from "./new-invoice-form";
import { Button } from "@/components/ui/button";

type NewInvoiceSectionProps = {
  projects: Array<{ id: string; name: string }>;
  clients: Array<{ id: string; name: string }>;
  defaultProjectId?: string;
  defaultClientId?: string;
  defaultEstimateId?: string;
  onSuccess?: () => void;
};

export function NewInvoiceSection({
  projects,
  clients,
  defaultProjectId,
  defaultClientId,
  defaultEstimateId,
  onSuccess,
}: NewInvoiceSectionProps) {
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
          + Nueva Factura
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Nueva Factura</h3>
        <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
          Cancelar
        </Button>
      </div>
      <NewInvoiceForm
        projects={projects}
        clients={clients}
        defaultProjectId={defaultProjectId}
        defaultClientId={defaultClientId}
        defaultEstimateId={defaultEstimateId}
        onSuccess={handleSuccess}
      />
    </div>
  );
}

