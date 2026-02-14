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
import { EstimateForm } from "@/components/estimates/estimate-form";
import { getEstimates } from "@/lib/data/estimates";
import { getAllProjects } from "@/lib/data/projects";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(amount);
}

type PresupuestosPageProps = {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
};

export default async function PresupuestosPage({ searchParams }: PresupuestosPageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const [{ estimates, total }, projects] = await Promise.all([
    getEstimates({ query: params.q, status: params.status, page }),
    getAllProjects(),
  ]);
  const totalPages = Math.ceil(total / 20);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Presupuestos</h2>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            {total} presupuesto{total !== 1 ? "s" : ""} registrado{total !== 1 ? "s" : ""}
          </p>
        </div>
        <a href="#nuevo-presupuesto">
          <Button>Nuevo Presupuesto</Button>
        </a>
      </div>

      <div
        id="nuevo-presupuesto"
        className="mb-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
      >
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Crear nuevo presupuesto</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Completa el formulario para crear un presupuesto.</p>
        </div>
        <EstimateForm projects={projects} />
      </div>

      <Suspense>
        <SearchInput placeholder="Buscar presupuestos..." />
      </Suspense>

      {estimates.length === 0 ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{params.q || params.status ? "Sin resultados" : "No tienes presupuestos todavia"}</CardTitle>
            <CardDescription>
              {params.q
                ? `No se encontraron presupuestos para "${params.q}".`
                : "Crea tu primer presupuesto para empezar."}
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
                  <TableHead>Obra</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Importe</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Valido hasta</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {estimates.map((estimate) => (
                  <TableRow key={estimate.id}>
                    <TableCell>
                      <Link
                        href={`/dashboard/presupuestos/${estimate.id}`}
                        className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        {estimate.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-400">
                      {estimate.project?.name || "-"}
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-400">
                      {estimate.project?.client?.name || "-"}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(estimate.total_amount)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge type="estimate" status={estimate.status} />
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-400">
                      {estimate.valid_until || "-"}
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
