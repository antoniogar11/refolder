import Link from "next/link";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { SearchInput } from "@/components/dashboard/search-input";
import { Pagination } from "@/components/dashboard/pagination";
import { SupplierTypeBadge } from "@/components/dashboard/status-badge";
import { SupplierForm } from "@/components/suppliers/supplier-form";
import { getSuppliers } from "@/lib/data/suppliers";

type ProveedoresPageProps = {
  searchParams: Promise<{ q?: string; page?: string }>;
};

export default async function ProveedoresPage({ searchParams }: ProveedoresPageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const { suppliers, total } = await getSuppliers({ query: params.q, page });
  const totalPages = Math.ceil(total / 20);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Proveedores</h2>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            {total} proveedor{total !== 1 ? "es" : ""} registrado{total !== 1 ? "s" : ""}
          </p>
        </div>
        <a href="#nuevo-proveedor">
          <Button>Nuevo Proveedor</Button>
        </a>
      </div>

      <div
        id="nuevo-proveedor"
        className="mb-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
      >
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Añadir nuevo proveedor</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Completa el formulario para registrarlo.</p>
        </div>
        <SupplierForm />
      </div>

      <Suspense>
        <SearchInput placeholder="Buscar proveedores..." />
      </Suspense>

      {suppliers.length === 0 ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{params.q ? "Sin resultados" : "No tienes proveedores todavía"}</CardTitle>
            <CardDescription>
              {params.q
                ? `No se encontraron proveedores para "${params.q}".`
                : "Registra tu primer proveedor para comenzar."}
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
                  <TableHead>Tipo</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell>
                      <Link
                        href={`/dashboard/proveedores/${supplier.id}`}
                        className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        {supplier.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <SupplierTypeBadge type={supplier.type} />
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-400">
                      {supplier.contact_name || "-"}
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-400">
                      {supplier.phone || "-"}
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-400">
                      {supplier.email || "-"}
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
