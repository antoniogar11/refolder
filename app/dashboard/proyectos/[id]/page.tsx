import { redirect } from "next/navigation";
import Link from "next/link";

import { deleteProjectAction } from "@/app/dashboard/proyectos/actions";
import { EditProjectForm } from "@/components/projects/edit-project-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getProjectById } from "@/lib/data/projects";
import { getAllClients } from "@/lib/data/clients";
import { getEstimates } from "@/lib/data/estimates";
import { DeleteEntityButton } from "@/components/shared/delete-entity-button";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { GenerateEstimateForm } from "@/components/estimates/generate-estimate-form";

type ProjectEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProjectEditPage({ params }: ProjectEditPageProps) {
  const { id } = await params;
  const [project, clients, { estimates }] = await Promise.all([
    getProjectById(id),
    getAllClients(),
    getEstimates({ projectId: id }),
  ]);

  if (!project) {
    redirect("/dashboard/proyectos");
  }

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
          Editar Proyecto
        </h2>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Modifica la información del proyecto
        </p>
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
                Cliente:{" "}
                {project.client ? (
                  <Link
                    href={`/dashboard/clientes/${project.client.id}`}
                    className="hover:text-amber-600 underline"
                  >
                    {project.client.name}
                  </Link>
                ) : (
                  "Sin asignar"
                )}
              </CardDescription>
            </div>
            <DeleteEntityButton
              entityId={project.id}
              entityName={project.name}
              redirectPath="/dashboard/proyectos"
              onDelete={deleteProjectAction}
            />
          </div>
        </CardHeader>
        <CardContent>
          <EditProjectForm project={project} clients={clients} />
        </CardContent>
      </Card>

      {/* Presupuestos de este proyecto */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Presupuestos ({estimates.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {estimates.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Este proyecto no tiene presupuestos. Genera uno con IA a continuación.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {estimates.map((estimate) => (
                  <TableRow key={estimate.id}>
                    <TableCell>
                      <Link
                        href={`/dashboard/presupuestos/${estimate.id}`}
                        className="font-medium text-slate-900 dark:text-white hover:text-amber-600"
                      >
                        {estimate.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {new Intl.NumberFormat("es-ES", {
                        style: "currency",
                        currency: "EUR",
                      }).format(estimate.total_amount)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge type="estimate" status={estimate.status} />
                    </TableCell>
                    <TableCell className="text-slate-500 dark:text-slate-400">
                      {new Date(estimate.created_at).toLocaleDateString("es-ES")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Generar presupuesto con IA */}
      <div className="mt-6">
        <GenerateEstimateForm projectId={project.id} projectName={project.name} />
      </div>
    </div>
  );
}
