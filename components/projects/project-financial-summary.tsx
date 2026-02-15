import { cn } from "@/lib/utils";
import type { FinancialSummary } from "@/lib/data/project-costs";
import { Wallet, TrendingDown, TrendingUp, Clock } from "lucide-react";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(amount);
}

type Props = {
  summary: FinancialSummary;
};

export function ProjectFinancialSummary({ summary }: Props) {
  const { presupuestado, gastado, cobrado, costeManoObra, beneficio } = summary;

  const cards = [
    {
      label: "Presupuestado",
      value: presupuestado,
      icon: Wallet,
      color: "text-blue-600",
      bg: "bg-blue-50 border-blue-200",
    },
    {
      label: "Gastado (inc. mano de obra)",
      value: gastado,
      icon: TrendingDown,
      color: "text-rose-600",
      bg: "bg-rose-50 border-rose-200",
      subtitle: costeManoObra > 0 ? `${formatCurrency(costeManoObra)} en mano de obra` : undefined,
    },
    {
      label: "Cobrado",
      value: cobrado,
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50 border-emerald-200",
    },
    {
      label: "Beneficio",
      value: beneficio,
      icon: Clock,
      color: beneficio >= 0 ? "text-emerald-600" : "text-rose-600",
      bg: beneficio >= 0 ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={cn("rounded-lg border p-4", card.bg)}
        >
          <div className="flex items-center gap-2">
            <card.icon className={cn("h-4 w-4", card.color)} />
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              {card.label}
            </p>
          </div>
          <p className={cn("mt-2 text-2xl font-bold", card.color)}>
            {formatCurrency(card.value)}
          </p>
          {card.subtitle && (
            <p className="mt-1 text-xs text-slate-500">{card.subtitle}</p>
          )}
        </div>
      ))}
    </div>
  );
}
