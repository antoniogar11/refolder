"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { EditProjectForm } from "./edit-project-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProjectWithClient } from "@/lib/data/projects";

type EditProjectSectionProps = {
  project: ProjectWithClient;
  clients: Array<{ id: string; name: string }>;
};

export function EditProjectSection({ project, clients }: EditProjectSectionProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);

  const handleSuccess = () => {
    setShowForm(false);
    router.refresh();
  };

  if (!showForm) {
    return (
      <Card className="mb-8 border border-gray-200 dark:border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{project.name}</CardTitle>
              <CardDescription>Información de la obra</CardDescription>
            </div>
            <Button onClick={() => setShowForm(true)} variant="outline">
              Editar Obra
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {project.client && (
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Cliente</p>
                <p className="text-base text-gray-900 dark:text-white">{project.client.name}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Estado</p>
              <p className="text-base text-gray-900 dark:text-white">
                {project.status === "planning" && "Planificación"}
                {project.status === "in_progress" && "En Curso"}
                {project.status === "completed" && "Completado"}
                {project.status === "cancelled" && "Cancelado"}
              </p>
            </div>
            {project.budget !== null && (
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Presupuesto</p>
                <p className="text-base text-gray-900 dark:text-white">
                  {new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(
                    project.budget,
                  )}
                </p>
              </div>
            )}
            {project.start_date && (
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Fecha de Inicio</p>
                <p className="text-base text-gray-900 dark:text-white">
                  {new Intl.DateTimeFormat("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }).format(new Date(project.start_date))}
                </p>
              </div>
            )}
            {project.end_date && (
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Fecha de Finalización</p>
                <p className="text-base text-gray-900 dark:text-white">
                  {new Intl.DateTimeFormat("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }).format(new Date(project.end_date))}
                </p>
              </div>
            )}
            {project.address && (
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Dirección</p>
                <p className="text-base text-gray-900 dark:text-white">{project.address}</p>
              </div>
            )}
            {project.description && (
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Descripción</p>
                <p className="text-base text-gray-900 dark:text-white">{project.description}</p>
              </div>
            )}
            {project.notes && (
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Notas</p>
                <p className="text-base text-gray-900 dark:text-white whitespace-pre-wrap">{project.notes}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8 border border-gray-200 dark:border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Editar Obra</CardTitle>
            <CardDescription>Modifica los datos de la obra</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
            Cancelar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <EditProjectForm project={project} clients={clients} onSuccess={handleSuccess} />
      </CardContent>
    </Card>
  );
}

