"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { deleteCostAction } from "@/app/dashboard/proyectos/cost-actions";
import { Trash2, Loader2 } from "lucide-react";
import type { ProjectCost } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils/format";

const categoryLabels: Record<string, string> = {
  material: "Material",
  mano_de_obra: "Mano de obra",
  subcontrata: "Subcontrata",
  transporte: "Transporte",
  otros: "Otros",
  pago_cliente: "Pago de cliente",
  certificacion: "Certificación",
};

const categoryColors: Record<string, string> = {
  material: "bg-sky-100 text-sky-700",
  mano_de_obra: "bg-amber-100 text-amber-700",
  subcontrata: "bg-violet-100 text-violet-700",
  transporte: "bg-emerald-100 text-emerald-700",
  otros: "bg-slate-100 text-slate-700",
  pago_cliente: "bg-emerald-100 text-emerald-700",
  certificacion: "bg-blue-100 text-blue-700",
};

type CostsTableProps = {
  costs: ProjectCost[];
  projectId: string;
};

export function CostsTable({ costs, projectId }: CostsTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(costId: string) {
    setDeletingId(costId);
    try {
      const result = await deleteCostAction(costId, projectId);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Error al eliminar el gasto.");
    } finally {
      setDeletingId(null);
    }
  }

  if (costs.length === 0) {
    return (
      <p className="text-sm text-slate-500 py-4">
        No hay gastos registrados. Añade el primer gasto para empezar a controlar los costes.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Descripción</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead className="text-right">Importe</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {costs.map((cost) => (
            <TableRow key={cost.id}>
              <TableCell className="font-medium">{cost.descripcion}</TableCell>
              <TableCell>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${categoryColors[cost.categoria] || categoryColors.otros}`}>
                  {categoryLabels[cost.categoria] || cost.categoria}
                </span>
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(cost.importe)}
              </TableCell>
              <TableCell className="text-slate-500">
                {formatDate(cost.fecha)}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(cost.id)}
                  disabled={deletingId === cost.id}
                  className="h-8 w-8 p-0 text-slate-400 hover:text-rose-500"
                  aria-label={`Eliminar gasto: ${cost.descripcion}`}
                >
                  {deletingId === cost.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Trash2 className="h-3 w-3" />
                  )}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
