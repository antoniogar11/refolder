import Link from "next/link";
import { Suspense } from "react";

import { NewClientForm } from "@/components/clients/new-client-form";
import { NewClientToggle } from "@/components/clients/new-client-toggle";
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
import { getClients } from "@/lib/data/clients";

type ClientesPageProps = {
  searchParams: Promise<{ q?: string; page?: string }>;
};

export default async function ClientesPage({ searchParams }: ClientesPageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const { clients, total } = await getClients({ query: params.q, page });
  const totalPages = Math.ceil(total / 20);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Clientes</h2>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            {total} cliente{total !== 1 ? "s" : ""} registrado{total !== 1 ? "s" : ""}
          </p>
        </div>
        <NewClientToggle>
          <NewClientForm />
        </NewClientToggle>
      </div>

      <Suspense>
        <SearchInput placeholder="Buscar clientes..." />
      </Suspense>

      {clients.length === 0 ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>
              {params.q ? "Sin resultados" : "No tienes clientes todavía"}
            </CardTitle>
            <CardDescription>
              {params.q
                ? `No se encontraron clientes para "${params.q}".`
                : "Registra tu primer cliente para comenzar."}
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
                  <TableHead className="hidden sm:table-cell">Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead className="hidden md:table-cell">Localidad</TableHead>
                  <TableHead className="hidden md:table-cell">CIF/NIF</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <Link
                        href={`/dashboard/clientes/${client.id}`}
                        className="font-medium text-slate-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400"
                      >
                        {client.name}
                      </Link>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-slate-500 dark:text-slate-400">
                      {client.email || "-"}
                    </TableCell>
                    <TableCell className="text-slate-500 dark:text-slate-400">
                      {client.phone || "-"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-slate-500 dark:text-slate-400">
                      {[client.postal_code, client.city, client.province]
                        .filter(Boolean)
                        .join(", ") || "-"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-slate-500 dark:text-slate-400">
                      {client.tax_id || "-"}
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
