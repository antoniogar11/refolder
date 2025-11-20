"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { InvoiceWithRelations } from "@/lib/data/invoices";

type InvoicesListProps = {
  invoices: InvoiceWithRelations[];
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(amount);
}

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(dateString));
}

function getStatusBadge(status: string) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    draft: "outline",
    sent: "default",
    paid: "default",
    overdue: "destructive",
    cancelled: "secondary",
    partial: "outline",
  };

  const labels: Record<string, string> = {
    draft: "Borrador",
    sent: "Enviada",
    paid: "Pagada",
    overdue: "Vencida",
    cancelled: "Anulada",
    partial: "Pago Parcial",
  };

  return { variant: variants[status] || "outline", label: labels[status] || status };
}

export function InvoicesList({ invoices }: InvoicesListProps) {
  if (invoices.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800/50">
        <p className="text-gray-600 dark:text-gray-400">
          No tienes facturas aún. Crea tu primera factura para comenzar.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {invoices.map((invoice) => {
        const statusBadge = getStatusBadge(invoice.status);
        return (
          <Link key={invoice.id} href={`/dashboard/facturas/${invoice.id}`}>
            <Card className="group relative overflow-hidden border-2 border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg hover:shadow-blue-500/10 dark:hover:shadow-blue-500/20 transition-all duration-200 cursor-pointer h-full active:scale-[0.98]">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-transparent dark:from-blue-950/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <CardHeader className="relative">
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-base sm:text-lg font-semibold line-clamp-1">{invoice.title}</CardTitle>
                  <Badge variant={statusBadge.variant} className="text-xs shrink-0 ml-2">{statusBadge.label}</Badge>
                </div>
                <CardDescription>
                  <div className="space-y-1">
                    <div className="font-medium text-sm text-gray-900 dark:text-white">
                      {invoice.invoice_number}
                    </div>
                    {invoice.client && (
                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                        👤 {invoice.client.name}
                      </div>
                    )}
                    {invoice.project && (
                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                        📁 {invoice.project.name}
                      </div>
                    )}
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Fecha:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatDate(invoice.issue_date)}</span>
                  </div>
                  {invoice.due_date && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Vence:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{formatDate(invoice.due_date)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Total:</span>
                    <span className="text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(invoice.total)}
                    </span>
                  </div>
                  {invoice.paid_amount > 0 && invoice.status !== "paid" && (
                    <div className="flex justify-between items-center text-xs bg-orange-50 dark:bg-orange-900/20 rounded px-2 py-1">
                      <span className="text-orange-700 dark:text-orange-300">Pagado:</span>
                      <span className="font-semibold text-orange-700 dark:text-orange-300">{formatCurrency(invoice.paid_amount)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

