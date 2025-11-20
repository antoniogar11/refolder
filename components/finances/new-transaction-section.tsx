"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { NewTransactionForm } from "./new-transaction-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type NewTransactionSectionProps = {
  projects: Array<{ id: string; name: string }>;
  clients: Array<{ id: string; name: string }>;
  defaultProjectId?: string;
  defaultClientId?: string;
  onSuccess?: () => void;
};

export function NewTransactionSection({
  projects,
  clients,
  defaultProjectId,
  defaultClientId,
  onSuccess,
}: NewTransactionSectionProps) {
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
          + Nueva Transacción
        </Button>
      </div>
    );
  }

  return (
    <Card className="border border-gray-200 dark:border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Nueva Transacción para este Proyecto</CardTitle>
            <CardDescription>Registra un ingreso o gasto relacionado con esta obra</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
            Cancelar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <NewTransactionForm
          projects={projects}
          clients={clients}
          defaultProjectId={defaultProjectId}
          defaultClientId={defaultClientId}
          onSuccess={handleSuccess}
        />
      </CardContent>
    </Card>
  );
}

