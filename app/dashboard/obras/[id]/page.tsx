import { redirect } from "next/navigation";

import { deleteProjectAction } from "@/app/dashboard/obras/actions";
import { ProjectForm } from "@/components/projects/project-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getProjectById } from "@/lib/data/projects";
import { getAllClients } from "@/lib/data/clients";
import { DeleteEntityButton } from "@/components/shared/delete-entity-button";
import { StatusBadge } from "@/components/dashboard/status-badge";

type ProjectEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProjectEditPage({ params }: ProjectEditPageProps) {
  const { id } = await params;
  const [project, clients] = await Promise.all([
    getProjectById(id),
    getAllClients(),
  ]);

  if (!project) {
    redirect("/dashboard/obras");
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Editar Obra</h2>
        <p className="mt-1 text-gray-600 dark:text-gray-400">Modifica la información de la obra</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {project.name}
                <StatusBadge type="project" status={project.status} />
              </CardTitle>
              <CardDescription>
                Cliente: {project.client?.name || "Sin asignar"}
              </CardDescription>
            </div>
            <DeleteEntityButton
              entityId={project.id}
              entityName={project.name}
              redirectPath="/dashboard/obras"
              onDelete={deleteProjectAction}
            />
          </div>
        </CardHeader>
        <CardContent>
          <ProjectForm project={project} clients={clients} />
        </CardContent>
      </Card>
    </div>
  );
}
