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
import { Pagination } from "@/components/dashboard/pagination";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { getProjects } from "@/lib/data/projects";
import { getAllClients } from "@/lib/data/clients";
import { formatCurrency } from "@/lib/utils/format";

type ProyectosPageProps = {
  searchParams: Promise<{ q?: string; page?: string }>;
};

export default async function ProyectosPage({ searchParams }: ProyectosPageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const [{ projects, total }, clients] = await Promise.all([
    getProjects({ query: params.q, page }),
    getAllClients(),
  ]);
  const totalPages = Math.ceil(total / 20);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Proyectos</h2>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            {total} proyecto{total !== 1 ? "s" : ""} registrado{total !== 1 ? "s" : ""}
          </p>
        </div>
        <NewProjectToggle>
          <NewProjectForm clients={clients} />
        </NewProjectToggle>
      </div>

      <Suspense>
        <SearchInput placeholder="Buscar proyectos..." />
      </Suspense>

      {projects.length === 0 ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>
              {params.q ? "Sin resultados" : "No tienes proyectos todavía"}
            </CardTitle>
            <CardDescription>
              {params.q
                ? `No se encontraron proyectos para "${params.q}".`
                : "Crea tu primer proyecto para empezar."}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          <div className="mt-6 overflow-hidden rounded-lg border bg-white dark:bg-slate-900">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Presupuesto</TableHead>
                  <TableHead>Inicio</TableHead>
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
                    </TableCell>
                    <TableCell className="text-slate-500 dark:text-slate-400">
                      {project.client?.name || "-"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge type="project" status={project.status} />
                    </TableCell>
                    <TableCell className="text-slate-500 dark:text-slate-400">
                      {formatCurrency(project.total_budget)}
                    </TableCell>
                    <TableCell className="text-slate-500 dark:text-slate-400">
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
