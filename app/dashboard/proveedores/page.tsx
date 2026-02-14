import Link from "next/link";
import { Suspense } from "react";

import { NewSupplierForm } from "@/components/suppliers/new-supplier-form";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/dashboard/search-input";
import { Pagination } from "@/components/dashboard/pagination";
import { getSuppliers } from "@/lib/data/suppliers";

const typeLabels: Record<string, string> = {
  material: "Material",
  labor: "Mano de obra",
  service: "Servicio",
  other: "Otro",
};

const typeColors: Record<string, string> = {
  material: "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300",
  labor: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
  service: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
  other: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
};

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
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Proveedores</h2>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            {total} proveedor{total !== 1 ? "es" : ""} registrado{total !== 1 ? "s" : ""}
          </p>
        </div>
        <a href="#nuevo-proveedor">
          <Button>Nuevo Proveedor</Button>
        </a>
      </div>

      <div
        id="nuevo-proveedor"
        className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
            Añadir nuevo proveedor
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Completa el formulario para registrarlo.
          </p>
        </div>
        <NewSupplierForm />
      </div>

      <Suspense>
        <SearchInput placeholder="Buscar proveedores..." />
      </Suspense>

      {suppliers.length === 0 ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>
              {params.q ? "Sin resultados" : "No tienes proveedores todavía"}
            </CardTitle>
            <CardDescription>
              {params.q
                ? `No se encontraron proveedores para "${params.q}".`
                : "Registra tu primer proveedor para comenzar."}
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
                  <TableHead>Tipo</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Ciudad</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell>
                      <Link
                        href={`/dashboard/proveedores/${supplier.id}`}
                        className="font-medium text-slate-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400"
                      >
                        {supplier.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={typeColors[supplier.type] || ""}>
                        {typeLabels[supplier.type] || supplier.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-500 dark:text-slate-400">
                      {supplier.contact_name || "-"}
                    </TableCell>
                    <TableCell className="text-slate-500 dark:text-slate-400">
                      {supplier.phone || "-"}
                    </TableCell>
                    <TableCell className="text-slate-500 dark:text-slate-400">
                      {supplier.email || "-"}
                    </TableCell>
                    <TableCell className="text-slate-500 dark:text-slate-400">
                      {supplier.city || "-"}
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
