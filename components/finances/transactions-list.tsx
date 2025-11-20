"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { FinanceTransactionWithRelations } from "@/lib/data/finances";

type TransactionsListProps = {
  transactions: FinanceTransactionWithRelations[];
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(amount);
}

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("es-ES", { year: "numeric", month: "short", day: "numeric" }).format(
    new Date(dateString),
  );
}

function getPaymentMethodLabel(method: string | null) {
  const labels: Record<string, string> = {
    cash: "Efectivo",
    bank_transfer: "Transferencia",
    card: "Tarjeta",
    check: "Cheque",
    other: "Otro",
  };
  return labels[method || ""] || "-";
}

export function TransactionsList({ transactions }: TransactionsListProps) {
  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transacciones</CardTitle>
          <CardDescription>No hay transacciones registradas</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => {
        const isIncome = transaction.type === "income";
        const amountColor = isIncome
          ? "text-green-600 dark:text-green-400"
          : "text-red-600 dark:text-red-400";
        const bgColor = isIncome
          ? "bg-green-100 dark:bg-green-900/20"
          : "bg-red-100 dark:bg-red-900/20";
        const icon = isIncome ? "+" : "-";

        return (
          <Link key={transaction.id} href={`/dashboard/finanzas/${transaction.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`h-10 w-10 rounded-full ${bgColor} flex items-center justify-center flex-shrink-0`}>
                      <span className={`text-sm font-semibold ${amountColor}`}>{icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm text-gray-900 dark:text-white">
                          {transaction.description || transaction.category}
                        </p>
                        {transaction.reference && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            ({transaction.reference})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-600 dark:text-gray-400 flex-wrap">
                        <span>{formatDate(transaction.transaction_date)}</span>
                        <span>•</span>
                        <span>{transaction.category}</span>
                        {transaction.project && (
                          <>
                            <span>•</span>
                            <span>Obra: {transaction.project.name}</span>
                          </>
                        )}
                        {transaction.client && (
                          <>
                            <span>•</span>
                            <span>Cliente: {transaction.client.name}</span>
                          </>
                        )}
                        {transaction.payment_method && (
                          <>
                            <span>•</span>
                            <span>{getPaymentMethodLabel(transaction.payment_method)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    <p className={`font-semibold text-lg ${amountColor}`}>
                      {isIncome ? "+" : "-"}
                      {formatCurrency(Math.abs(transaction.amount))}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

