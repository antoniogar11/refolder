import { redirect } from "next/navigation";
import Link from "next/link";

import { LogoutButton } from "@/components/auth/logout-button";
import { NewProjectSection } from "@/components/projects/new-project-section";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getProjects, getClientsForSelect } from "@/lib/data/projects";
import { hasWorkerPermission, isCompanyAdmin } from "@/lib/data/companies";
import { formatDate, formatCurrency } from "@/lib/utils/format";

function getStatusLabel(status: string) {
  const labels: Record<string, { text: string; color: string }> = {
    planning: { text: "Planificación", color: "text-blue-600 dark:text-blue-400" },
    in_progress: { text: "En Curso", color: "text-green-600 dark:text-green-400" },
    completed: { text: "Completado", color: "text-gray-600 dark:text-gray-400" },
    cancelled: { text: "Cancelado", color: "text-red-600 dark:text-red-400" },
  };
  return labels[status] || { text: status, color: "" };
}

export default async function ObrasPage() {
  const isAdmin = await isCompanyAdmin();
  const canViewProjects = isAdmin || await hasWorkerPermission("projects:read");

  if (!canViewProjects) {
    redirect("/dashboard");
  }

  const projects = await getProjects();
  const clients = await getClientsForSelect();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="sticky top-0 z-30 border-b bg-white dark:bg-gray-800 md:ml-64">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Gestión de Obras</h1>
            <div className="flex items-center gap-2">
              <LogoutButton variant="outline" />
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Obras</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Gestiona todos tus proyectos de obras y reformas
          </p>
        </div>

        <NewProjectSection clients={clients} />

        {projects.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No tienes obras todavía</CardTitle>
              <CardDescription>Registra tu primera obra para comenzar a gestionar tus proyectos.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Usa el formulario superior para añadir tu primera obra.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
              const statusInfo = getStatusLabel(project.status);
              return (
                <Link key={project.id} href={`/dashboard/obras/${project.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{project.name}</CardTitle>
                          <CardDescription>
                            {project.client ? `Cliente: ${project.client.name}` : "Sin cliente asignado"}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Estado:</span>
                          <span className={`font-semibold ${statusInfo.color}`}>{statusInfo.text}</span>
                        </div>
                        {project.budget !== null && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Presupuesto:</span>
                            <span className="font-semibold">{formatCurrency(project.budget)}</span>
                          </div>
                        )}
                        {project.start_date && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Inicio:</span>
                            <span className="text-gray-900 dark:text-white">{formatDate(project.start_date)}</span>
                          </div>
                        )}
                        {project.address && (
                          <div className="pt-2">
                            <span className="text-gray-600 dark:text-gray-400">📍 {project.address}</span>
                          </div>
                        )}
                        <div className="pt-4">
                          <Button variant="outline" className="w-full">
                            Ver Detalles
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

