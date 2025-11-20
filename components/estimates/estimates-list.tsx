"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { EstimateWithRelations } from "@/lib/data/estimates";

type EstimatesListProps = {
  estimates: EstimateWithRelations[];
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
    accepted: "default",
    rejected: "destructive",
    expired: "secondary",
  };

  const labels: Record<string, string> = {
    draft: "Borrador",
    sent: "Enviado",
    accepted: "Aceptado",
    rejected: "Rechazado",
    expired: "Expirado",
  };

  return { variant: variants[status] || "outline", label: labels[status] || status };
}

export function EstimatesList({ estimates }: EstimatesListProps) {
  if (estimates.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800/50">
        <p className="text-gray-600 dark:text-gray-400">
          No tienes presupuestos aún. Crea tu primer presupuesto para comenzar.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {estimates.map((estimate) => {
        const statusBadge = getStatusBadge(estimate.status);
        return (
          <Link key={estimate.id} href={`/dashboard/presupuestos/${estimate.id}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-lg">{estimate.title}</CardTitle>
                  <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                </div>
                <CardDescription>
                  <div className="space-y-1">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {estimate.estimate_number}
                    </div>
                    {estimate.client && (
                      <div className="text-sm">Cliente: {estimate.client.name}</div>
                    )}
                    {estimate.project && (
                      <div className="text-sm">Proyecto: {estimate.project.name}</div>
                    )}
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Fecha:</span>
                    <span className="font-medium">{formatDate(estimate.issue_date)}</span>
                  </div>
                  {estimate.validity_date && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Válido hasta:</span>
                      <span className="font-medium">{formatDate(estimate.validity_date)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-2">
                    <span className="text-gray-600 dark:text-gray-400">Total:</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatCurrency(estimate.total)}
                    </span>
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

