"use client";

import { useState, useEffect } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { FinanceTransactionWithRelations } from "@/lib/data/finances";
import { calculateFinanceSummaryByPeriod } from "@/lib/utils";

type FinanceSummarySectionProps = {
  transactions: FinanceTransactionWithRelations[];
  projects: Array<{ id: string; name: string }>;
};

type PeriodType = "day" | "week" | "month" | "year";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(amount);
}

function formatPeriodLabel(period: string, periodType: PeriodType): string {
  switch (periodType) {
    case "day":
      return new Intl.DateTimeFormat("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(new Date(period));
    case "week":
      const weekStart = new Date(period);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      return `${weekStart.getDate()}/${weekStart.getMonth() + 1} - ${weekEnd.getDate()}/${weekEnd.getMonth() + 1} ${weekStart.getFullYear()}`;
    case "month":
      const [year, month] = period.split("-");
      return new Intl.DateTimeFormat("es-ES", {
        year: "numeric",
        month: "long",
      }).format(new Date(parseInt(year), parseInt(month) - 1));
    case "year":
      return period;
    default:
      return period;
  }
}

export function FinanceSummarySection({ transactions, projects }: FinanceSummarySectionProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>("month");
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [customRange, setCustomRange] = useState(false);

  // Filtrar transacciones por proyecto
  const filteredTransactions = selectedProject === "all"
    ? transactions
    : transactions.filter((transaction) => transaction.project_id === selectedProject);

  // Filtrar por rango de fechas si está activo
  const dateFilteredTransactions = customRange && startDate && endDate
    ? filteredTransactions.filter((transaction) => {
        const transactionDate = transaction.transaction_date;
        return transactionDate >= startDate && transactionDate <= endDate;
      })
    : filteredTransactions;

  // Calcular resumen por periodo
  const summary = calculateFinanceSummaryByPeriod(dateFilteredTransactions, selectedPeriod);

  // Calcular totales
  const totalIncome = dateFilteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = dateFilteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalBalance = totalIncome - totalExpenses;
  const totalTransactions = dateFilteredTransactions.length;

  // Configurar fechas por defecto según el periodo
  useEffect(() => {
    if (!customRange) {
      const today = new Date();
      switch (selectedPeriod) {
        case "month":
          const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          setStartDate(firstDayOfMonth.toISOString().split("T")[0]);
          setEndDate(today.toISOString().split("T")[0]);
          break;
        case "year":
          const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
          setStartDate(firstDayOfYear.toISOString().split("T")[0]);
          setEndDate(today.toISOString().split("T")[0]);
          break;
        case "week":
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          setStartDate(weekStart.toISOString().split("T")[0]);
          setEndDate(today.toISOString().split("T")[0]);
          break;
      }
    }
  }, [selectedPeriod, customRange]);

  return (
    <Card className="border border-gray-200 dark:border-gray-800">
      <CardHeader>
        <CardTitle>Resumen Financiero</CardTitle>
        <CardDescription>Consulta ingresos, gastos y balance por periodo y proyecto</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filtros */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <label htmlFor="period" className="text-sm font-medium">
              Periodo
            </label>
            <select
              id="period"
              value={selectedPeriod}
              onChange={(e) => {
                setSelectedPeriod(e.target.value as PeriodType);
                setCustomRange(false);
              }}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="day">Diario</option>
              <option value="week">Semanal</option>
              <option value="month">Mensual</option>
              <option value="year">Anual</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="project" className="text-sm font-medium">
              Proyecto
            </label>
            <select
              id="project"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="all">Todos los proyectos</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <input
                type="checkbox"
                checked={customRange}
                onChange={(e) => setCustomRange(e.target.checked)}
                className="rounded border-gray-300"
              />
              Rango personalizado
            </label>
            {customRange && (
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            )}
          </div>

          {customRange && (
            <div className="space-y-2">
              <label htmlFor="endDate" className="text-sm font-medium">
                Fecha fin
              </label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          )}
        </div>

        {/* Resumen total */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
            <p className="text-sm text-green-700 dark:text-green-300">Total Ingresos</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(totalIncome)}
            </p>
          </div>
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
            <p className="text-sm text-red-700 dark:text-red-300">Total Gastos</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(totalExpenses)}
            </p>
          </div>
          <div
            className={`rounded-lg border p-4 ${
              totalBalance >= 0
                ? "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20"
                : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
            }`}
          >
            <p
              className={`text-sm ${
                totalBalance >= 0
                  ? "text-blue-700 dark:text-blue-300"
                  : "text-red-700 dark:text-red-300"
              }`}
            >
              Balance
            </p>
            <p
              className={`text-2xl font-bold ${
                totalBalance >= 0
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {formatCurrency(totalBalance)}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
            <p className="text-sm text-gray-600 dark:text-gray-400">Transacciones</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalTransactions}</p>
          </div>
        </div>

        {/* Desglose por periodo */}
        {summary.length > 0 ? (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Desglose por {selectedPeriod === "day" ? "día" : selectedPeriod === "week" ? "semana" : selectedPeriod === "month" ? "mes" : "año"}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Periodo
                    </th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-green-700 dark:text-green-300">
                      Ingresos
                    </th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-red-700 dark:text-red-300">
                      Gastos
                    </th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                      Balance
                    </th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                      Registros
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {summary.map((item) => (
                    <tr
                      key={item.period}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                        {formatPeriodLabel(item.period, selectedPeriod)}
                      </td>
                      <td className="px-4 py-2 text-right text-sm font-medium text-green-600 dark:text-green-400">
                        {formatCurrency(item.income)}
                      </td>
                      <td className="px-4 py-2 text-right text-sm font-medium text-red-600 dark:text-red-400">
                        {formatCurrency(item.expenses)}
                      </td>
                      <td
                        className={`px-4 py-2 text-right text-sm font-medium ${
                          item.balance >= 0
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {formatCurrency(item.balance)}
                      </td>
                      <td className="px-4 py-2 text-right text-sm text-gray-600 dark:text-gray-400">
                        {item.count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-800/50">
            <p className="text-gray-600 dark:text-gray-400">
              No hay transacciones para los filtros seleccionados.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

