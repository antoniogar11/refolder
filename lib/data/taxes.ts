import { createClient } from "@/lib/supabase/server";

export type TaxCalculation = {
  period: string;
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  ivaCollected: number;
  ivaPaid: number;
  ivaToPay: number;
  irpfEstimate: number;
  totalTaxes: number;
};

const IVA_RATE = 0.21; // 21%
const IRPF_ESTIMATE_RATE = 0.20; // 20% estimado

/**
 * Calcula los impuestos para un período determinado
 */
export async function calculateTaxes(
  startDate: Date,
  endDate: Date
): Promise<TaxCalculation | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Obtener todas las transacciones del período
  const { data: transactions, error } = await supabase
    .from("finance_transactions")
    .select("*")
    .eq("user_id", user.id)
    .gte("transaction_date", startDate.toISOString().split("T")[0])
    .lte("transaction_date", endDate.toISOString().split("T")[0]);

  if (error || !transactions) {
    console.error("Error fetching transactions:", error);
    return null;
  }

  // Calcular totales
  let totalIncome = 0;
  let totalExpenses = 0;

  transactions.forEach((transaction) => {
    if (transaction.type === "income") {
      totalIncome += transaction.amount;
    } else if (transaction.type === "expense") {
      totalExpenses += transaction.amount;
    }
  });

  const netIncome = totalIncome - totalExpenses;

  // Calcular IVA
  const ivaCollected = totalIncome * IVA_RATE;
  const ivaPaid = totalExpenses * IVA_RATE;
  const ivaToPay = ivaCollected - ivaPaid;

  // Estimación IRPF (sobre el beneficio neto)
  const irpfEstimate = netIncome > 0 ? netIncome * IRPF_ESTIMATE_RATE : 0;

  const totalTaxes = ivaToPay + irpfEstimate;

  const periodLabel = startDate.toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });

  return {
    period: periodLabel.charAt(0).toUpperCase() + periodLabel.slice(1),
    totalIncome,
    totalExpenses,
    netIncome,
    ivaCollected,
    ivaPaid,
    ivaToPay,
    irpfEstimate,
    totalTaxes,
  };
}

/**
 * Obtiene el cálculo de impuestos para el mes actual
 */
export async function getCurrentMonthTaxes(): Promise<TaxCalculation | null> {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return calculateTaxes(startDate, endDate);
}

/**
 * Obtiene el cálculo de impuestos para el año actual
 */
export async function getCurrentYearTaxes(): Promise<TaxCalculation | null> {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), 0, 1);
  const endDate = new Date(now.getFullYear(), 11, 31);

  return calculateTaxes(startDate, endDate);
}

