import { Suspense } from "react";

import { NewTransactionForm } from "@/components/finance/new-transaction-form";
import { FinanceSummaryCards } from "@/components/finance/finance-summary";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { getTransactions, getFinanceSummary } from "@/lib/data/finance";
import { formatCurrency } from "@/lib/utils/format";

const categoryLabels: Record<string, string> = {
  material: "Material",
  mano_de_obra: "Mano de obra",
  subcontrata: "Subcontrata",
  transporte: "Transporte",
  herramientas: "Herramientas",
  cobro_cliente: "Cobro cliente",
  alquiler: "Alquiler",
  seguros: "Seguros",
  impuestos: "Impuestos",
  otro: "Otro",
};

const paymentLabels: Record<string, string> = {
  cash: "Efectivo",
  bank_transfer: "Transferencia",
  card: "Tarjeta",
  check: "Cheque",
};

type FinanzasPageProps = {
  searchParams: Promise<{ q?: string; type?: string; page?: string }>;
};

export default async function FinanzasPage({ searchParams }: FinanzasPageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;

  const [{ transactions, total }, summary] = await Promise.all([
    getTransactions({ query: params.q, type: params.type, page }),
    getFinanceSummary(),
  ]);

  const totalPages = Math.ceil(total / 20);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Finanzas</h2>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            {summary.transactionCount} movimiento{summary.transactionCount !== 1 ? "s" : ""} registrado{summary.transactionCount !== 1 ? "s" : ""}
          </p>
        </div>
        <a href="#nuevo-movimiento">
          <Button>Nuevo Movimiento</Button>
        </a>
      </div>

      <FinanceSummaryCards summary={summary} />

      <div
        id="nuevo-movimiento"
        className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
            Registrar movimiento
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Registra un ingreso o gasto.
          </p>
        </div>
        <NewTransactionForm />
      </div>

      <Suspense>
        <SearchInput placeholder="Buscar movimientos..." />
      </Suspense>

      {transactions.length === 0 ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>
              {params.q ? "Sin resultados" : "No tienes movimientos todavía"}
            </CardTitle>
            <CardDescription>
              {params.q
                ? `No se encontraron movimientos para "${params.q}".`
                : "Registra tu primer ingreso o gasto para comenzar."}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          <div className="mt-6 overflow-hidden rounded-lg border bg-white dark:bg-slate-900">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Pago</TableHead>
                  <TableHead className="text-right">Importe</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {new Date(tx.transaction_date).toLocaleDateString("es-ES")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          tx.type === "income"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                        }
                      >
                        {tx.type === "income" ? "Ingreso" : "Gasto"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-500 dark:text-slate-400">
                      {categoryLabels[tx.category] || tx.category}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900 dark:text-white max-w-xs truncate">
                      {tx.description}
                    </TableCell>
                    <TableCell className="text-slate-500 dark:text-slate-400">
                      {paymentLabels[tx.payment_method || ""] || "-"}
                    </TableCell>
                    <TableCell className={`text-right font-medium ${
                      tx.type === "income"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400"
                    }`}>
                      {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
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
