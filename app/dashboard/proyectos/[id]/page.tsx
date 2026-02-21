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
import { getEstimates, getAllEstimates } from "@/lib/data/estimates";
import { getCostsByProjectId, getFinancialSummary } from "@/lib/data/project-costs";
import { getHoursByProjectId } from "@/lib/data/project-hours";
import { getTasksByProjectId } from "@/lib/data/project-tasks";
import { getWorkerRates } from "@/lib/data/worker-rates";
import { DeleteEntityButton } from "@/components/shared/delete-entity-button";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { GenerateEstimateForm } from "@/components/estimates/generate-estimate-form";
import { ProjectFinancialSummary } from "@/components/projects/project-financial-summary";
import { ProjectDetailTabs } from "@/components/projects/project-detail-tabs";
import { LinkEstimateSelect } from "@/components/projects/link-estimate-select";
import { CostComparison } from "@/components/projects/cost-comparison";
import { TasksList } from "@/components/projects/tasks-list";
import { AddTaskForm } from "@/components/projects/add-task-form";
import { ProjectPageTabs } from "@/components/projects/project-page-tabs";
import { formatCurrency, formatDate } from "@/lib/utils/format";

type ProjectEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProjectEditPage({ params }: ProjectEditPageProps) {
  const { id } = await params;

  const [project, clients, { estimates }, allEstimates, gastos, ingresos, hours, workerRates, financialSummary, tasks] = await Promise.all([
    getProjectById(id),
    getAllClients(),
    getEstimates({ projectId: id }),
    getAllEstimates(),
    getCostsByProjectId(id, "gasto"),
    getCostsByProjectId(id, "ingreso"),
    getHoursByProjectId(id),
    getWorkerRates(),
    getFinancialSummary(id),
    getTasksByProjectId(id),
  ]);

  if (!project) {
    redirect("/dashboard/proyectos");
  }

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header - siempre visible fuera de los tabs */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <CardTitle className="flex items-center gap-2">
                <span className="truncate">{project.name}</span>
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
      </Card>

      {/* Tabs a nivel de pagina */}
      <ProjectPageTabs
        finanzasTab={
          <>
            {/* Resumen financiero */}
            <Card>
              <CardHeader>
                <CardTitle>Resumen financiero</CardTitle>
              </CardHeader>
              <CardContent>
                <ProjectFinancialSummary summary={financialSummary} />
              </CardContent>
            </Card>

            {/* Comparacion presupuesto vs coste */}
            <Card>
              <CardHeader>
                <CardTitle>Comparacion presupuesto vs coste real</CardTitle>
                <CardDescription>Vincula un presupuesto para comparar con el gasto real</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <LinkEstimateSelect projectId={project.id} estimates={allEstimates} />
                <CostComparison
                  budgeted={financialSummary.presupuestado}
                  spent={financialSummary.gastado}
                />
              </CardContent>
            </Card>

            {/* Movimientos: Gastos | Ingresos | Horas */}
            <Card>
              <CardHeader>
                <CardTitle>Movimientos del proyecto</CardTitle>
                <CardDescription>Gestiona gastos, ingresos y horas de mano de obra</CardDescription>
              </CardHeader>
              <CardContent>
                <ProjectDetailTabs
                  projectId={project.id}
                  gastos={gastos}
                  ingresos={ingresos}
                  hours={hours}
                  workerRates={workerRates}
                  tasks={tasks}
                />
              </CardContent>
            </Card>
          </>
        }
        presupuestosTab={
          <>
            {/* Tabla de presupuestos */}
            <Card>
              <CardHeader>
                <CardTitle>Presupuestos ({estimates.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {estimates.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Este proyecto no tiene presupuestos. Genera uno con IA a continuacion.
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
                            {formatCurrency(estimate.total_amount)}
                          </TableCell>
                          <TableCell>
                            <StatusBadge type="estimate" status={estimate.status} />
                          </TableCell>
                          <TableCell className="text-slate-500 dark:text-slate-400">
                            {formatDate(estimate.created_at)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Generar presupuesto con IA */}
            <GenerateEstimateForm projectId={project.id} projectName={project.name} />
          </>
        }
        tareasTab={
          <>
            <Card>
              <CardHeader>
                <CardTitle>Tareas ({tasks.length})</CardTitle>
                <CardDescription>Organiza el trabajo del proyecto en tareas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <AddTaskForm projectId={project.id} />
                <TasksList tasks={tasks} projectId={project.id} />
              </CardContent>
            </Card>
          </>
        }
        datosTab={
          <Card>
            <CardHeader>
              <CardTitle>Editar datos del proyecto</CardTitle>
              <CardDescription>Modifica la informacion del proyecto</CardDescription>
            </CardHeader>
            <CardContent>
              <EditProjectForm project={project} clients={clients} />
            </CardContent>
          </Card>
        }
      />
    </div>
  );
}
