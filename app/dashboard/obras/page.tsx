import Link from "next/link";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { SearchInput } from "@/components/dashboard/search-input";
import { Pagination } from "@/components/dashboard/pagination";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { ProjectForm } from "@/components/projects/project-form";
import { getProjects } from "@/lib/data/projects";
import { getAllClients } from "@/lib/data/clients";

function formatCurrency(amount: number | null) {
  if (!amount) return "-";
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(amount);
}

type ObrasPageProps = {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
};

export default async function ObrasPage({ searchParams }: ObrasPageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const [{ projects, total }, clients] = await Promise.all([
    getProjects({ query: params.q, status: params.status, page }),
    getAllClients(),
  ]);
  const totalPages = Math.ceil(total / 20);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Obras</h2>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            {total} obra{total !== 1 ? "s" : ""} registrada{total !== 1 ? "s" : ""}
          </p>
        </div>
        <a href="#nueva-obra">
          <Button>Nueva Obra</Button>
        </a>
      </div>

      <div
        id="nueva-obra"
        className="mb-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
      >
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Crear nueva obra</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Completa el formulario para crear una obra.</p>
        </div>
        <ProjectForm clients={clients} />
      </div>

      <Suspense>
        <SearchInput placeholder="Buscar obras..." />
      </Suspense>

      {projects.length === 0 ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{params.q || params.status ? "Sin resultados" : "No tienes obras todavía"}</CardTitle>
            <CardDescription>
              {params.q
                ? `No se encontraron obras para "${params.q}".`
                : "Crea tu primera obra para empezar."}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          <div className="mt-6 overflow-hidden rounded-lg border bg-white dark:bg-gray-900">
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
                        href={`/dashboard/obras/${project.id}`}
                        className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        {project.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-400">
                      {project.client?.name || "-"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge type="project" status={project.status} />
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-400">
                      {formatCurrency(project.total_budget)}
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-400">
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
