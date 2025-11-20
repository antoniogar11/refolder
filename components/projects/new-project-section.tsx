"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { NewProjectForm } from "./new-project-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type NewProjectSectionProps = {
  clients: Array<{ id: string; name: string }>;
};

export function NewProjectSection({ clients }: NewProjectSectionProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);

  // Ocultar el formulario cuando se crea exitosamente un proyecto
  const handleSuccess = () => {
    setShowForm(false);
    router.refresh();
  };

  if (!showForm) {
    return (
      <div className="mb-8 flex justify-center">
        <Button onClick={() => setShowForm(true)} size="lg">
          + Nueva Obra
        </Button>
      </div>
    );
  }

  return (
    <div className="mb-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Añadir nueva obra</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Completa el formulario para registrar una nueva obra.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
          Cancelar
        </Button>
      </div>
      <NewProjectForm clients={clients} onSuccess={handleSuccess} />
    </div>
  );
}

