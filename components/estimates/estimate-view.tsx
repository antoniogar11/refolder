"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { EstimateWithRelations } from "@/lib/data/estimates";
import { updateEstimateStatusAction, deleteEstimateAction } from "@/app/dashboard/presupuestos/actions";
import { createInvoiceFromEstimateAction } from "@/app/dashboard/facturas/actions";
import { EditEstimateSection } from "./edit-estimate-section";

type EstimateViewProps = {
  estimate: EstimateWithRelations;
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

export function EstimateView({ estimate, projects, clients }: EstimateViewProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
  const statusBadge = getStatusBadge(estimate.status);

  const handleStatusChange = async (newStatus: string) => {
    const result = await updateEstimateStatusAction(estimate.id, newStatus as any);
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || "Error al actualizar el estado");
    }
  };

  const handleGenerateInvoice = async () => {
    if (!confirm(`¿Quieres generar una factura desde este presupuesto aceptado?`)) {
      return;
    }

    setIsGeneratingInvoice(true);
    const result = await createInvoiceFromEstimateAction(estimate.id);
    setIsGeneratingInvoice(false);

    if (result.status === "success") {
      alert(`Factura creada correctamente. ${result.message || ""}`);
      if (result.invoiceId) {
        router.push(`/dashboard/facturas/${result.invoiceId}`);
      } else {
        router.push("/dashboard/facturas");
      }
    } else {
      alert(result.message || "Error al generar la factura");
    }
  };

  const handleDelete = async () => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el presupuesto "${estimate.title}"?`)) {
      return;
    }

    setIsDeleting(true);
    const result = await deleteEstimateAction(estimate.id);
    setIsDeleting(false);

    if (result.success) {
      router.push("/dashboard/presupuestos");
    } else {
      alert(result.error || "Error al eliminar el presupuesto");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{estimate.title}</h1>
            <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400">{estimate.estimate_number}</p>
        </div>
        <div className="flex gap-2">
          {estimate.status === "accepted" && (
            <Button
              variant="default"
              size="sm"
              onClick={handleGenerateInvoice}
              disabled={isGeneratingInvoice}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isGeneratingInvoice ? "Generando..." : "🧾 Generar Factura"}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              window.open(`/api/estimates/${estimate.id}/pdf`, "_blank");
            }}
          >
            📄 Descargar PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </Button>
          <Link href="/dashboard/presupuestos">
            <Button variant="outline" size="sm">
              Volver
            </Button>
          </Link>
        </div>
      </div>

      {/* Formulario de Edición */}
      {isEditing && (
        <div className="mb-6">
          <EditEstimateSection
            estimate={estimate}
            projects={projects}
            clients={clients}
            onSuccess={() => setIsEditing(false)}
          />
        </div>
      )}

      {/* Botón de Editar */}
      {!isEditing && (
        <div className="mb-6 flex justify-center">
          <Button onClick={() => setIsEditing(true)} variant="outline">
            ✏️ Editar Presupuesto
          </Button>
        </div>
      )}

      {/* Información General */}
      <Card className="border border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle>Información del Presupuesto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {estimate.client && (
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Cliente</p>
                <p className="text-base text-gray-900 dark:text-white">{estimate.client.name}</p>
                {estimate.client.email && (
                  <p className="text-sm text-gray-500 dark:text-gray-500">{estimate.client.email}</p>
                )}
              </div>
            )}
            {estimate.project && (
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Proyecto</p>
                <Link href={`/dashboard/obras/${estimate.project.id}`}>
                  <p className="text-base text-blue-600 dark:text-blue-400 hover:underline">
                    {estimate.project.name}
                  </p>
                </Link>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Fecha de Emisión</p>
              <p className="text-base text-gray-900 dark:text-white">{formatDate(estimate.issue_date)}</p>
            </div>
            {estimate.validity_date && (
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Válido hasta</p>
                <p className="text-base text-gray-900 dark:text-white">{formatDate(estimate.validity_date)}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">IVA</p>
              <p className="text-base text-gray-900 dark:text-white">{estimate.tax_rate}%</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Estado</p>
              <select
                value={estimate.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="draft">Borrador</option>
                <option value="sent">Enviado</option>
                <option value="accepted">Aceptado</option>
                <option value="rejected">Rechazado</option>
                <option value="expired">Expirado</option>
              </select>
            </div>
            {estimate.description && (
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Descripción</p>
                <p className="text-base text-gray-900 dark:text-white whitespace-pre-wrap">
                  {estimate.description}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Líneas del Presupuesto */}
      <Card className="border border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle>Líneas del Presupuesto</CardTitle>
        </CardHeader>
        <CardContent>
          {estimate.items && estimate.items.length > 0 ? (
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
                      IVA ({estimate.tax_rate}%)
                    </th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {estimate.items.map((item, index) => (
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
                      {formatCurrency(estimate.subtotal)}
                    </td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td colSpan={4} className="px-4 py-2 text-right text-sm font-medium text-gray-900 dark:text-white">
                      IVA ({estimate.tax_rate}%):
                    </td>
                    <td></td>
                    <td className="px-4 py-2 text-right text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(estimate.tax_amount)}
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
                      {formatCurrency(estimate.total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">
              No hay líneas en este presupuesto.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Notas y Términos */}
      {(estimate.notes || estimate.terms) && (
        <div className="grid gap-4 md:grid-cols-2">
          {estimate.notes && (
            <Card className="border border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg">Notas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {estimate.notes}
                </p>
              </CardContent>
            </Card>
          )}
          {estimate.terms && (
            <Card className="border border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg">Términos y Condiciones</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {estimate.terms}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

