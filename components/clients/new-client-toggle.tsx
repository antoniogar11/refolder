"use client";

import { useState, isValidElement, cloneElement } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

type NewClientToggleProps = {
  children: React.ReactElement<{ onSuccess?: () => void }>;
};

export function NewClientToggle({ children }: NewClientToggleProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  function handleSuccess() {
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Nuevo Cliente
      </Button>
    );
  }

  return (
    <div
      id="nuevo-cliente"
      className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
            Añadir nuevo cliente
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Completa el formulario para registrarlo.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      {isValidElement(children) ? cloneElement(children, { onSuccess: handleSuccess }) : children}
    </div>
  );
}
