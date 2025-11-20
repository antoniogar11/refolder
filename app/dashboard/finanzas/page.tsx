import { redirect } from "next/navigation";
import Link from "next/link";

import { LogoutButton } from "@/components/auth/logout-button";
import { NewTransactionSection } from "@/components/finances/new-transaction-section";
import { TransactionsList } from "@/components/finances/transactions-list";
import { FinanceSummarySection } from "@/components/finances/finance-summary-section";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getFinanceTransactions, getFinanceSummary } from "@/lib/data/finances";
import { getProjects } from "@/lib/data/projects";
import { getClientsForSelect } from "@/lib/data/projects";
import { hasWorkerPermission, isCompanyAdmin } from "@/lib/data/companies";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(amount);
}

export default async function FinanzasPage() {
  const isAdmin = await isCompanyAdmin();
  const canViewFinances = isAdmin || await hasWorkerPermission("finances:read");

  if (!canViewFinances) {
    redirect("/dashboard");
  }

  const transactions = await getFinanceTransactions();
  const summary = await getFinanceSummary();
  const projects = await getProjects();
  const clients = await getClientsForSelect();

  // Calcular totales del mes actual
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyIncome = transactions
    .filter(
      (t) =>
        t.type === "income" &&
        new Date(t.transaction_date).getMonth() === currentMonth &&
        new Date(t.transaction_date).getFullYear() === currentYear,
    )
    .reduce((sum, t) => sum + t.amount, 0);
  const monthlyExpenses = transactions
    .filter(
      (t) =>
        t.type === "expense" &&
        new Date(t.transaction_date).getMonth() === currentMonth &&
        new Date(t.transaction_date).getFullYear() === currentYear,
    )
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="border-b bg-white dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Gestión de Finanzas</h1>
            <div className="flex items-center gap-2">
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <LogoutButton variant="outline" />
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Finanzas</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Controla ingresos, gastos y estado financiero de tus proyectos
          </p>
        </div>

        {/* Resumen Financiero con Filtros */}
        <FinanceSummarySection transactions={transactions} projects={projects} />

        {/* Resumen Financiero Simple */}
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Ingresos Totales</CardDescription>
              <CardTitle className="text-3xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(summary.totalIncome)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Este mes: {formatCurrency(monthlyIncome)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Gastos Totales</CardDescription>
              <CardTitle className="text-3xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(summary.totalExpenses)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Este mes: {formatCurrency(monthlyExpenses)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Balance</CardDescription>
              <CardTitle
                className={`text-3xl font-bold ${
                  summary.balance >= 0
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {formatCurrency(summary.balance)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-600 dark:text-gray-400">Ingresos - Gastos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Transacciones</CardDescription>
              <CardTitle className="text-3xl font-bold text-gray-600 dark:text-gray-400">
                {transactions.length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-600 dark:text-gray-400">Total registradas</p>
            </CardContent>
          </Card>
        </div>

        {/* Formulario de Nueva Transacción */}
        <Card className="mb-8 border border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle>Nueva Transacción</CardTitle>
            <CardDescription>Registra un nuevo ingreso o gasto</CardDescription>
          </CardHeader>
          <CardContent>
            <NewTransactionSection projects={projects} clients={clients} />
          </CardContent>
        </Card>

        {/* Lista de Transacciones */}
        <Card className="border border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle>Transacciones</CardTitle>
            <CardDescription>Todas tus transacciones financieras</CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionsList transactions={transactions} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
