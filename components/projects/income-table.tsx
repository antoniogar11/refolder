"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { deleteCostAction } from "@/app/dashboard/proyectos/cost-actions";
import { Trash2, Loader2 } from "lucide-react";
import type { ProjectCost } from "@/types";
import { formatCurrency } from "@/lib/utils/format";

const categoryLabels: Record<string, string> = {
  pago_cliente: "Pago de cliente",
  certificacion: "Certificaci\u00f3n",
  otros: "Otros",
};

const categoryColors: Record<string, string> = {
  pago_cliente: "bg-emerald-100 text-emerald-700",
  certificacion: "bg-blue-100 text-blue-700",
  otros: "bg-slate-100 text-slate-700",
};

type IncomeTableProps = {
  incomes: ProjectCost[];
  projectId: string;
};

export function IncomeTable({ incomes, projectId }: IncomeTableProps) {
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
      toast.error("Error al eliminar el ingreso.");
    } finally {
      setDeletingId(null);
    }
  }

  if (incomes.length === 0) {
    return (
      <p className="text-sm text-slate-500 py-4">
        No hay ingresos registrados. Registra el primer cobro del proyecto.
      </p>
    );
  }

  const total = incomes.reduce((sum, i) => sum + Number(i.importe), 0);

  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descripci&oacute;n</TableHead>
              <TableHead>Categor&iacute;a</TableHead>
              <TableHead className="text-right">Importe</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {incomes.map((income) => (
              <TableRow key={income.id}>
                <TableCell className="font-medium">{income.descripcion}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${categoryColors[income.categoria] || categoryColors.otros}`}>
                    {categoryLabels[income.categoria] || income.categoria}
                  </span>
                </TableCell>
                <TableCell className="text-right font-medium text-emerald-600">
                  +{formatCurrency(income.importe)}
                </TableCell>
                <TableCell className="text-slate-500">
                  {new Date(income.fecha).toLocaleDateString("es-ES")}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(income.id)}
                    disabled={deletingId === income.id}
                    className="h-8 w-8 p-0 text-slate-400 hover:text-rose-500"
                  >
                    {deletingId === income.id ? (
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
      <p className="text-sm font-medium text-right text-emerald-600">
        Total cobrado: {formatCurrency(total)}
      </p>
    </div>
  );
}
