import Link from "next/link";

import { NewTransactionSection } from "./new-transaction-section";
import { TransactionsList } from "./transactions-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { FinanceTransactionWithRelations } from "@/lib/data/finances";
import type { ProjectWithClient } from "@/lib/data/projects";

type ProjectFinancesProps = {
  project: ProjectWithClient;
  transactions: FinanceTransactionWithRelations[];
  summary: { totalIncome: number; totalExpenses: number; balance: number };
  projects: Array<{ id: string; name: string }>;
  clients: Array<{ id: string; name: string }>;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(amount);
}

export function ProjectFinances({
  project,
  transactions,
  summary,
  projects,
  clients,
}: ProjectFinancesProps) {
  return (
    <div className="space-y-6">
      {/* Resumen Financiero del Proyecto */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Ingresos del Proyecto</CardDescription>
            <CardTitle className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(summary.totalIncome)}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Gastos del Proyecto</CardDescription>
            <CardTitle className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(summary.totalExpenses)}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Balance del Proyecto</CardDescription>
            <CardTitle
              className={`text-2xl font-bold ${
                summary.balance >= 0
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {formatCurrency(summary.balance)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Formulario de Nueva Transacción */}
      <NewTransactionSection
        projects={projects}
        clients={clients}
        defaultProjectId={project.id}
        defaultClientId={project.client_id || undefined}
      />

      {/* Lista de Transacciones del Proyecto */}
      <Card className="border border-gray-200 dark:border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Transacciones del Proyecto</CardTitle>
              <CardDescription>
                {transactions.length === 0
                  ? "No hay transacciones registradas para este proyecto"
                  : `${transactions.length} transacción${transactions.length !== 1 ? "es" : ""} registrada${transactions.length !== 1 ? "s" : ""}`}
              </CardDescription>
            </div>
            <Link href="/dashboard/finanzas">
              <Button variant="outline" size="sm">
                Ver Todas las Finanzas
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <TransactionsList transactions={transactions} />
        </CardContent>
      </Card>
    </div>
  );
}

