"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { deleteHourAction } from "@/app/dashboard/proyectos/hour-actions";
import { Trash2, Loader2 } from "lucide-react";
import type { ProjectHour } from "@/types";
import { formatCurrency } from "@/lib/utils/format";

type HoursTableProps = {
  hours: ProjectHour[];
  projectId: string;
};

export function HoursTable({ hours, projectId }: HoursTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(hourId: string) {
    setDeletingId(hourId);
    try {
      const result = await deleteHourAction(hourId, projectId);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Error al eliminar el registro.");
    } finally {
      setDeletingId(null);
    }
  }

  if (hours.length === 0) {
    return (
      <p className="text-sm text-slate-500 py-4">
        No hay horas registradas. A&ntilde;ade las horas trabajadas para calcular el coste de mano de obra.
      </p>
    );
  }

  const totalHoras = hours.reduce((sum, h) => sum + Number(h.horas), 0);
  const totalCoste = hours.reduce((sum, h) => sum + Number(h.coste_total), 0);

  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descripci&oacute;n</TableHead>
              <TableHead>Trabajador</TableHead>
              <TableHead className="text-right">Tarifa/h</TableHead>
              <TableHead className="text-right">Horas</TableHead>
              <TableHead className="text-right">Coste</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {hours.map((hour) => (
              <TableRow key={hour.id}>
                <TableCell className="font-medium">{hour.descripcion}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-violet-100 text-violet-700">
                    {hour.categoria_trabajador}
                  </span>
                </TableCell>
                <TableCell className="text-right text-slate-500">
                  {formatCurrency(hour.tarifa_hora)}
                </TableCell>
                <TableCell className="text-right">
                  {hour.horas}h
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(hour.coste_total)}
                </TableCell>
                <TableCell className="text-slate-500">
                  {new Date(hour.fecha).toLocaleDateString("es-ES")}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(hour.id)}
                    disabled={deletingId === hour.id}
                    className="h-8 w-8 p-0 text-slate-400 hover:text-rose-500"
                  >
                    {deletingId === hour.id ? (
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
      <div className="flex justify-end gap-6 text-sm font-medium">
        <span className="text-slate-600">Total: {totalHoras}h</span>
        <span className="text-violet-600">Coste: {formatCurrency(totalCoste)}</span>
      </div>
    </div>
  );
}
