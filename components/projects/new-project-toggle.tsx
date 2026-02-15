"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

type NewProjectToggleProps = {
  children: React.ReactNode;
};

export function NewProjectToggle({ children }: NewProjectToggleProps) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Nuevo Proyecto
      </Button>
    );
  }

  return (
    <div
      id="nuevo-proyecto"
      className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
            Crear nuevo proyecto
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Completa el formulario para crear un proyecto.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      {children}
    </div>
  );
}
