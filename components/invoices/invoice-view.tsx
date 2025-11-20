"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { InvoiceWithRelations } from "@/lib/data/invoices";
import { updateInvoiceStatusAction, deleteInvoiceAction } from "@/app/dashboard/facturas/actions";

type InvoiceViewProps = {
  invoice: InvoiceWithRelations;
  projects: Array<{ id: string; name: string }>;
  clients: Array<{ id: string; name: string }>;
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(amount);
}

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    year: "numeric",
    month: "long",
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

export function InvoiceView({ invoice, projects, clients }: InvoiceViewProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const statusBadge = getStatusBadge(invoice.status);

  const handleStatusChange = async (newStatus: string) => {
    const result = await updateInvoiceStatusAction(invoice.id, newStatus as any);
    if (result.status === "success") {
      router.refresh();
    } else {
      alert(result.message || "Error al actualizar el estado");
    }
  };

  const handleDelete = async () => {
    if (!confirm(`¿Estás seguro de que quieres eliminar la factura "${invoice.title}"?`)) {
      return;
    }

    setIsDeleting(true);
    const result = await deleteInvoiceAction(invoice.id);
    setIsDeleting(false);

    if (result.status === "success") {
      router.push("/dashboard/facturas");
    } else {
      alert(result.message || "Error al eliminar la factura");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{invoice.title}</h1>
            <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400">{invoice.invoice_number}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              window.open(`/api/invoices/${invoice.id}/pdf`, "_blank");
            }}
          >
            📄 Descargar PDF
          </Button>
          {invoice.status !== "paid" && invoice.status !== "cancelled" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              disabled={isEditing}
            >
              ✏️ Editar Factura
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting || invoice.status === "paid"}
            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </Button>
          <Link href="/dashboard/facturas">
            <Button variant="outline" size="sm">
              Volver
            </Button>
          </Link>
        </div>
      </div>

      {/* Información General */}
      <Card className="border border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle>Información de la Factura</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {invoice.client && (
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Cliente</p>
                <p className="text-base text-gray-900 dark:text-white">{invoice.client.name}</p>
                {invoice.client.email && (
                  <p className="text-sm text-gray-500 dark:text-gray-500">{invoice.client.email}</p>
                )}
              </div>
            )}
            {invoice.project && (
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Proyecto</p>
                <Link href={`/dashboard/obras/${invoice.project.id}`}>
                  <p className="text-base text-blue-600 dark:text-blue-400 hover:underline">
                    {invoice.project.name}
                  </p>
                </Link>
              </div>
            )}
            {invoice.estimate && (
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Presupuesto</p>
                <Link href={`/dashboard/presupuestos/${invoice.estimate.id}`}>
                  <p className="text-base text-blue-600 dark:text-blue-400 hover:underline">
                    {invoice.estimate.estimate_number}
                  </p>
                </Link>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Fecha de Emisión</p>
              <p className="text-base text-gray-900 dark:text-white">{formatDate(invoice.issue_date)}</p>
            </div>
            {invoice.due_date && (
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Fecha de Vencimiento</p>
                <p className="text-base text-gray-900 dark:text-white">{formatDate(invoice.due_date)}</p>
              </div>
            )}
            {invoice.payment_date && (
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Fecha de Pago</p>
                <p className="text-base text-green-600 dark:text-green-400">{formatDate(invoice.payment_date)}</p>
              </div>
            )}
            {invoice.payment_method && (
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Método de Pago</p>
                <p className="text-base text-gray-900 dark:text-white">{invoice.payment_method}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">IVA</p>
              <p className="text-base text-gray-900 dark:text-white">{invoice.tax_rate}%</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Estado</p>
              <select
                value={invoice.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                disabled={invoice.status === "paid" || invoice.status === "cancelled"}
              >
                <option value="draft">Borrador</option>
                <option value="sent">Enviada</option>
                <option value="paid">Pagada</option>
                <option value="overdue">Vencida</option>
                <option value="partial">Pago Parcial</option>
                <option value="cancelled">Anulada</option>
              </select>
            </div>
            {invoice.description && (
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Descripción</p>
                <p className="text-base text-gray-900 dark:text-white whitespace-pre-wrap">
                  {invoice.description}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Líneas de la Factura */}
      <Card className="border border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle>Líneas de la Factura</CardTitle>
        </CardHeader>
        <CardContent>
          {invoice.items && invoice.items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      #
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Concepto
                    </th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                      Cantidad
                    </th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                      Precio Unit.
                    </th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                      Subtotal
                    </th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                      IVA ({invoice.tax_rate}%)
                    </th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{index + 1}</td>
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                        {item.description}
                        {item.notes && (
                          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">{item.notes}</div>
                        )}
                      </td>
                      <td className="px-4 py-2 text-right text-sm text-gray-900 dark:text-white">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-2 text-right text-sm text-gray-900 dark:text-white">
                        {formatCurrency(item.unit_price)}
                      </td>
                      <td className="px-4 py-2 text-right text-sm text-gray-900 dark:text-white">
                        {formatCurrency(item.subtotal)}
                      </td>
                      <td className="px-4 py-2 text-right text-sm text-gray-900 dark:text-white">
                        {formatCurrency(item.tax_amount)}
                      </td>
                      <td className="px-4 py-2 text-right text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t-2 border-gray-300 dark:border-gray-600">
                  <tr>
                    <td colSpan={4} className="px-4 py-2 text-right text-sm font-medium text-gray-900 dark:text-white">
                      Subtotal:
                    </td>
                    <td className="px-4 py-2 text-right text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(invoice.subtotal)}
                    </td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td colSpan={4} className="px-4 py-2 text-right text-sm font-medium text-gray-900 dark:text-white">
                      IVA ({invoice.tax_rate}%):
                    </td>
                    <td></td>
                    <td className="px-4 py-2 text-right text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(invoice.tax_amount)}
                    </td>
                    <td></td>
                  </tr>
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-2 text-right text-lg font-bold text-gray-900 dark:text-white"
                    >
                      TOTAL:
                    </td>
                    <td></td>
                    <td></td>
                    <td className="px-4 py-2 text-right text-lg font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(invoice.total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">
              No hay líneas en esta factura.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Notas y Términos */}
            {(invoice.notes || invoice.terms) && (
              <div className="grid gap-4 md:grid-cols-2">
                {invoice.notes && (
                  <Card className="border border-gray-200 dark:border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-lg">Notas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {invoice.notes}
                      </p>
                    </CardContent>
                  </Card>
                )}
                {invoice.terms && (
                  <Card className="border border-gray-200 dark:border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-lg">Términos y Condiciones</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {invoice.terms}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Información de Pago */}
            {(invoice.status === "paid" || invoice.status === "partial") && (
              <Card className="border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
                <CardHeader>
                  <CardTitle className="text-lg text-green-800 dark:text-green-400">
                    {invoice.status === "paid" ? "✓ Factura Pagada" : "Pago Parcial"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {invoice.payment_date && (
                      <div>
                        <p className="text-sm font-medium text-green-700 dark:text-green-300">Fecha de Pago</p>
                        <p className="text-base text-green-900 dark:text-green-100">
                          {formatDate(invoice.payment_date)}
                        </p>
                      </div>
                    )}
                    {invoice.payment_method && (
                      <div>
                        <p className="text-sm font-medium text-green-700 dark:text-green-300">Método de Pago</p>
                        <p className="text-base text-green-900 dark:text-green-100">{invoice.payment_method}</p>
                      </div>
                    )}
                    {invoice.status === "partial" && (
                      <div>
                        <p className="text-sm font-medium text-green-700 dark:text-green-300">Importe Pagado</p>
                        <p className="text-base text-green-900 dark:text-green-100">
                          {formatCurrency(invoice.paid_amount)}
                        </p>
                      </div>
                    )}
                    {invoice.status === "partial" && (
                      <div>
                        <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Pendiente</p>
                        <p className="text-base text-orange-900 dark:text-orange-100 font-bold">
                          {formatCurrency(invoice.total - invoice.paid_amount)}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
    </div>
  );
}

