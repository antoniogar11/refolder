import type { FinanceSummary } from "@/lib/data/finance";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(amount);
}

type FinanceSummaryCardsProps = {
  summary: FinanceSummary;
};

export function FinanceSummaryCards({ summary }: FinanceSummaryCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3 mb-8">
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-800 dark:bg-emerald-950">
        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Ingresos</p>
        <p className="mt-1 text-2xl font-bold text-emerald-900 dark:text-emerald-100">
          {formatCurrency(summary.totalIncome)}
        </p>
      </div>
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-800 dark:bg-red-950">
        <p className="text-sm font-medium text-red-600 dark:text-red-400">Gastos</p>
        <p className="mt-1 text-2xl font-bold text-red-900 dark:text-red-100">
          {formatCurrency(summary.totalExpenses)}
        </p>
      </div>
      <div className={`rounded-2xl border p-5 ${
        summary.balance >= 0
          ? "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950"
          : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950"
      }`}>
        <p className={`text-sm font-medium ${
          summary.balance >= 0
            ? "text-amber-600 dark:text-amber-400"
            : "text-red-600 dark:text-red-400"
        }`}>Balance</p>
        <p className={`mt-1 text-2xl font-bold ${
          summary.balance >= 0
            ? "text-amber-900 dark:text-amber-100"
            : "text-red-900 dark:text-red-100"
        }`}>
          {formatCurrency(summary.balance)}
        </p>
      </div>
    </div>
  );
}
