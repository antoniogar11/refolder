import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(minutes: number | null): string {
  if (minutes === null) return "En curso";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours} h`;
  return `${hours} h ${mins} min`;
}

/**
 * Calcula resumen de horas agrupado por periodo
 * Función cliente-safe (no depende de server components)
 */
export function calculateTimeSummaryByPeriod(
  entries: Array<{ entry_date: string; duration_minutes: number | null }>,
  period: "day" | "week" | "month" | "year"
): Array<{ period: string; minutes: number; hours: number; count: number }> {
  const summary: Record<string, { minutes: number; count: number }> = {};

  entries.forEach((entry) => {
    if (!entry.duration_minutes) return;

    const date = new Date(entry.entry_date);
    let periodKey: string;

    switch (period) {
      case "day":
        periodKey = date.toISOString().split("T")[0];
        break;
      case "week":
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        periodKey = weekStart.toISOString().split("T")[0];
        break;
      case "month":
        periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        break;
      case "year":
        periodKey = String(date.getFullYear());
        break;
      default:
        periodKey = date.toISOString().split("T")[0];
    }

    if (!summary[periodKey]) {
      summary[periodKey] = { minutes: 0, count: 0 };
    }

    summary[periodKey].minutes += entry.duration_minutes || 0;
    summary[periodKey].count += 1;
  });

  return Object.entries(summary)
    .map(([periodKey, data]) => ({
      period: periodKey,
      minutes: data.minutes,
      hours: Math.round((data.minutes / 60) * 100) / 100,
      count: data.count,
    }))
    .sort((a, b) => a.period.localeCompare(b.period));
}

/**
 * Calcula resumen financiero agrupado por periodo
 * Función cliente-safe (no depende de server components)
 */
export function calculateFinanceSummaryByPeriod(
  transactions: Array<{
    transaction_date: string;
    type: "income" | "expense";
    amount: number;
  }>,
  period: "day" | "week" | "month" | "year"
): Array<{
  period: string;
  income: number;
  expenses: number;
  balance: number;
  count: number;
}> {
  const summary: Record<
    string,
    { income: number; expenses: number; count: number }
  > = {};

  transactions.forEach((transaction) => {
    const date = new Date(transaction.transaction_date);
    let periodKey: string;

    switch (period) {
      case "day":
        periodKey = date.toISOString().split("T")[0];
        break;
      case "week":
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        periodKey = weekStart.toISOString().split("T")[0];
        break;
      case "month":
        periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        break;
      case "year":
        periodKey = String(date.getFullYear());
        break;
      default:
        periodKey = date.toISOString().split("T")[0];
    }

    if (!summary[periodKey]) {
      summary[periodKey] = { income: 0, expenses: 0, count: 0 };
    }

    if (transaction.type === "income") {
      summary[periodKey].income += transaction.amount;
    } else {
      summary[periodKey].expenses += transaction.amount;
    }

    summary[periodKey].count += 1;
  });

  return Object.entries(summary)
    .map(([periodKey, data]) => ({
      period: periodKey,
      income: Math.round(data.income * 100) / 100,
      expenses: Math.round(data.expenses * 100) / 100,
      balance: Math.round((data.income - data.expenses) * 100) / 100,
      count: data.count,
    }))
    .sort((a, b) => a.period.localeCompare(b.period));
}
