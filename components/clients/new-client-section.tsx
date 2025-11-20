"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { NewClientForm } from "./new-client-form";
import { Button } from "@/components/ui/button";

type NewClientSectionProps = {
  onSuccess?: () => void;
};

export function NewClientSection({ onSuccess }: NewClientSectionProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);

  // Ocultar el formulario cuando se crea exitosamente un cliente
  const handleSuccess = () => {
    setShowForm(false);
    router.refresh();
    if (onSuccess) {
      onSuccess();
    }
  };

  if (!showForm) {
    return (
      <div className="mb-8 flex justify-center">
        <Button onClick={() => setShowForm(true)} size="lg">
          + Nuevo Cliente
        </Button>
      </div>
    );
  }

  return (
    <div className="mb-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Añadir nuevo cliente</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Completa el formulario para registrarlo.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
          Cancelar
        </Button>
      </div>
      <NewClientForm onSuccess={handleSuccess} />
    </div>
  );
}

