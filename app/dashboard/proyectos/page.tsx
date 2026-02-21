import Link from "next/link";
import { Suspense } from "react";

import { NewProjectForm } from "@/components/projects/new-project-form";
import { NewProjectToggle } from "@/components/projects/new-project-toggle";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SearchInput } from "@/components/dashboard/search-input";
import { StatusFilter } from "@/components/dashboard/status-filter";
import { Pagination } from "@/components/dashboard/pagination";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { getProjects } from "@/lib/data/projects";
import { getAllClients } from "@/lib/data/clients";
import { getGlobalFinancialSummary } from "@/lib/data/project-costs";
import { ProjectFinancialSummary } from "@/components/projects/project-financial-summary";
import { formatCurrency } from "@/lib/utils/format";

const projectStatusOptions = [
  { value: "planning", label: "Planificando" },
  { value: "in_progress", label: "En curso" },
  { value: "paused", label: "Pausado" },
  { value: "completed", label: "Completado" },
  { value: "cancelled", label: "Cancelado" },
];

type ProyectosPageProps = {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
};

export default async function ProyectosPage({ searchParams }: ProyectosPageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const [{ projects, total }, clients, financialSummary] = await Promise.all([
    getProjects({ query: params.q, status: params.status, page }),
    getAllClients(),
    getGlobalFinancialSummary(),
  ]);
  const totalPages = Math.ceil(total / 20);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Proyectos</h2>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            {total} proyecto{total !== 1 ? "s" : ""} registrado{total !== 1 ? "s" : ""}
          </p>
        </div>
        <NewProjectToggle>
          <NewProjectForm clients={clients} />
        </NewProjectToggle>
      </div>

      {total > 0 && (financialSummary.presupuestado > 0 || financialSummary.gastado > 0 || financialSummary.cobrado > 0) && (
        <div className="mb-6">
          <ProjectFinancialSummary summary={financialSummary} />
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Suspense>
          <SearchInput placeholder="Buscar proyectos..." />
        </Suspense>
        <Suspense>
          <StatusFilter options={projectStatusOptions} />
        </Suspense>
      </div>

      {projects.length === 0 ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>
              {params.q || params.status ? "Sin resultados" : "No tienes proyectos todavía"}
            </CardTitle>
            <CardDescription>
              {params.q
                ? `No se encontraron proyectos para "${params.q}".`
                : params.status
                ? "No hay proyectos con este estado."
                : "Crea tu primer proyecto para empezar."}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          <div className="mt-6 overflow-x-auto rounded-lg border bg-white dark:bg-slate-900">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="hidden sm:table-cell">Cliente</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="hidden sm:table-cell">Presupuesto</TableHead>
                  <TableHead className="hidden md:table-cell">Inicio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <Link
                        href={`/dashboard/proyectos/${project.id}`}
                        className="font-medium text-slate-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400"
                      >
                        {project.name}
                      </Link>
                      <p className="text-xs text-slate-500 dark:text-slate-400 sm:hidden">
                        {project.client?.name || "Sin cliente"}
                      </p>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-slate-500 dark:text-slate-400">
                      {project.client?.name || "-"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge type="project" status={project.status} />
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-slate-500 dark:text-slate-400">
                      {formatCurrency(project.total_budget)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-slate-500 dark:text-slate-400">
                      {project.start_date || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Pagination currentPage={page} totalPages={totalPages} />
        </>
      )}
    </div>
  );
}
