import Link from "next/link";
import { Suspense } from "react";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { SearchInput } from "@/components/dashboard/search-input";
import { Pagination } from "@/components/dashboard/pagination";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { getEstimates } from "@/lib/data/estimates";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(amount);
}

type PresupuestosPageProps = {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
};

export default async function PresupuestosPage({ searchParams }: PresupuestosPageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const { estimates, total } = await getEstimates({ query: params.q, status: params.status, page });
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
        <p className="text-sm text-gray-500">
          Para crear un presupuesto, ve a una obra y haz clic en &quot;Generar presupuesto&quot;
        </p>
      </div>

      <Suspense>
        <SearchInput placeholder="Buscar presupuestos..." />
      </Suspense>

      {estimates.length === 0 ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{params.q || params.status ? "Sin resultados" : "No tienes presupuestos todavía"}</CardTitle>
            <CardDescription>
              {params.q
                ? `No se encontraron presupuestos para "${params.q}".`
                : "Ve a una obra para generar tu primer presupuesto con IA."}
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
                    <TableCell className="text-right font-medium">
                      {formatCurrency(estimate.total_amount)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge type="estimate" status={estimate.status} />
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-400">
                      {new Date(estimate.created_at).toLocaleDateString("es-ES")}
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
