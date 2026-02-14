import { createClient } from "@/lib/supabase/server";
import type { FinanceTransaction } from "@/types";

const PAGE_SIZE = 20;

type GetTransactionsParams = {
  query?: string;
  type?: string;
  page?: number;
};

export async function getTransactions(
  params: GetTransactionsParams = {},
): Promise<{ transactions: FinanceTransaction[]; total: number }> {
  const { query, type, page = 1 } = params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { transactions: [], total: 0 };

  let queryBuilder = supabase
    .from("finance_transactions")
    .select("*, project:projects(id, name), client:clients(id, name)", { count: "exact" })
    .eq("user_id", user.id);

  if (query) {
    queryBuilder = queryBuilder.or(
      `description.ilike.%${query}%,category.ilike.%${query}%,reference.ilike.%${query}%`,
    );
  }

  if (type && (type === "income" || type === "expense")) {
    queryBuilder = queryBuilder.eq("type", type);
  }

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error, count } = await queryBuilder
    .order("transaction_date", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Error fetching transactions", error);
    return { transactions: [], total: 0 };
  }

  return { transactions: (data ?? []) as FinanceTransaction[], total: count ?? 0 };
}

export type FinanceSummary = {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactionCount: number;
};

export async function getFinanceSummary(): Promise<FinanceSummary> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { totalIncome: 0, totalExpenses: 0, balance: 0, transactionCount: 0 };

  const { data, error } = await supabase
    .from("finance_transactions")
    .select("type, amount")
    .eq("user_id", user.id);

  if (error || !data) {
    console.error("Error fetching finance summary", error);
    return { totalIncome: 0, totalExpenses: 0, balance: 0, transactionCount: 0 };
  }

  let totalIncome = 0;
  let totalExpenses = 0;

  for (const tx of data) {
    if (tx.type === "income") {
      totalIncome += tx.amount;
    } else {
      totalExpenses += tx.amount;
    }
  }

  return {
    totalIncome: Math.round(totalIncome * 100) / 100,
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    balance: Math.round((totalIncome - totalExpenses) * 100) / 100,
    transactionCount: data.length,
  };
}
