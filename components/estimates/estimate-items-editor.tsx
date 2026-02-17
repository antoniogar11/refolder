"use client";

import { useState, useCallback, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Trash2, Plus, Percent } from "lucide-react";
import {
  updateEstimateItemAction,
  addEstimateItemAction,
  deleteEstimateItemAction,
  updateEstimateTotalAction,
  updateGlobalMarginAction,
} from "@/app/dashboard/presupuestos/actions";
import { formatCurrency } from "@/lib/utils/format";
import { roundCurrency, computeSellingPrice } from "@/lib/utils";
import type { EstimateItem } from "@/types";

type EstimateItemsEditorProps = {
  estimateId: string;
  initialItems: EstimateItem[];
  estimateTotal: number;
  margenGlobal: number | null;
};

export function EstimateItemsEditor({ estimateId, initialItems, estimateTotal, margenGlobal }: EstimateItemsEditorProps) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [globalMargin, setGlobalMargin] = useState(margenGlobal ?? 20);
  const [isApplyingMargin, startApplyingMargin] = useTransition();

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.subtotal, 0), [items]);
  const iva = useMemo(() => roundCurrency(subtotal * 0.21), [subtotal]);
  const total = useMemo(() => roundCurrency(subtotal + iva), [subtotal, iva]);

  const handleUpdateItem = useCallback(async (itemId: string, field: string, value: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const update: Record<string, unknown> = {};
    const numVal = parseFloat(value) || 0;

    if (field === "precio_coste") {
      update.precio_coste = numVal;
      update.margen = item.margen;
      update.cantidad = item.cantidad;
      update.precio_unitario = computeSellingPrice(numVal, item.margen);
    } else if (field === "margen") {
      update.margen = numVal;
      update.precio_coste = item.precio_coste ?? 0;
      update.cantidad = item.cantidad;
      update.precio_unitario = computeSellingPrice(item.precio_coste ?? 0, numVal);
    } else if (field === "cantidad") {
      update.cantidad = numVal;
      update.precio_coste = item.precio_coste;
      update.margen = item.margen;
      update.precio_unitario = item.precio_unitario;
    } else {
      update[field] = value;
      update.cantidad = item.cantidad;
      update.precio_unitario = item.precio_unitario;
      update.precio_coste = item.precio_coste;
      update.margen = item.margen;
    }

    const newSubtotal = roundCurrency(
      (update.cantidad as number) * (update.precio_unitario as number)
    );

    setItems(prev => prev.map(i =>
      i.id === itemId ? { ...i, ...update, subtotal: newSubtotal } as EstimateItem : i
    ));

    if (field === "precio_coste" || field === "margen") {
      await updateEstimateItemAction(itemId, {
        precio_coste: update.precio_coste as number,
        margen: update.margen as number,
        cantidad: update.cantidad as number,
      });
    } else if (field === "cantidad") {
      await updateEstimateItemAction(itemId, {
        cantidad: update.cantidad as number,
        precio_unitario: update.precio_unitario as number,
        precio_coste: update.precio_coste as number | undefined,
        margen: update.margen as number | undefined,
      });
    } else {
      await updateEstimateItemAction(itemId, { [field]: value });
    }
  }, [items]);

  async function handleAddItem() {
    const defaultMargin = globalMargin;
    const newItem = {
      categoria: "General",
      descripcion: "Nueva partida",
      unidad: "ud",
      cantidad: 1,
      precio_coste: 0,
      margen: defaultMargin,
      precio_unitario: 0,
      orden: items.length,
    };

    const result = await addEstimateItemAction(estimateId, newItem);
    if (result.success) {
      toast.success("Partida añadida");
      router.refresh();
    } else {
      toast.error(result.message);
    }
  }

  async function handleDeleteItem(itemId: string) {
    const result = await deleteEstimateItemAction(itemId, estimateId);
    if (result.success) {
      setItems(prev => prev.filter(i => i.id !== itemId));
      toast.success("Partida eliminada");
    } else {
      toast.error(result.message);
    }
  }

  async function handleSyncTotal() {
    const result = await updateEstimateTotalAction(estimateId, total);
    if (result.success) {
      toast.success("Total del presupuesto actualizado");
    } else {
      toast.error(result.message);
    }
  }

  function handleApplyGlobalMargin() {
    startApplyingMargin(async () => {
      const result = await updateGlobalMarginAction(estimateId, globalMargin);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>Partidas ({items.length})</CardTitle>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Label className="text-sm whitespace-nowrap text-slate-600 dark:text-slate-400">
              <Percent className="inline h-3 w-3 mr-1" />
              Margen global:
            </Label>
            <Input
              type="number"
              step="1"
              min="0"
              max="500"
              value={globalMargin}
              onChange={(e) => setGlobalMargin(parseFloat(e.target.value) || 0)}
              className="h-8 w-20 text-right"
            />
            <span className="text-sm text-slate-500">%</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleApplyGlobalMargin}
              disabled={isApplyingMargin}
            >
              {isApplyingMargin ? "Aplicando..." : "Aplicar"}
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={handleAddItem}>
            <Plus className="mr-1 h-4 w-4" /> Añadir partida
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-slate-600 dark:text-slate-400 text-sm text-center py-8">
            No hay partidas. Añade una manualmente o genera con IA desde la obra.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Categoría</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="w-[60px] text-right">Ud.</TableHead>
                  <TableHead className="w-[80px] text-right">Cant.</TableHead>
                  <TableHead className="w-[100px] text-right">P. Coste</TableHead>
                  <TableHead className="w-[80px] text-right">Margen %</TableHead>
                  <TableHead className="w-[100px] text-right">P. Venta</TableHead>
                  <TableHead className="w-[100px] text-right">Subtotal</TableHead>
                  <TableHead className="w-[40px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Input
                        defaultValue={item.categoria}
                        onBlur={(e) => handleUpdateItem(item.id, "categoria", e.target.value)}
                        className="h-8 text-xs"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        defaultValue={item.descripcion}
                        onBlur={(e) => handleUpdateItem(item.id, "descripcion", e.target.value)}
                        className="h-8 text-sm"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        defaultValue={item.unidad}
                        onBlur={(e) => handleUpdateItem(item.id, "unidad", e.target.value)}
                        className="h-8 text-xs text-right w-14"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        defaultValue={item.cantidad}
                        onBlur={(e) => handleUpdateItem(item.id, "cantidad", e.target.value)}
                        className="h-8 text-right w-20"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        defaultValue={item.precio_coste ?? 0}
                        onBlur={(e) => handleUpdateItem(item.id, "precio_coste", e.target.value)}
                        className="h-8 text-right w-24"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="1"
                        defaultValue={item.margen}
                        onBlur={(e) => handleUpdateItem(item.id, "margen", e.target.value)}
                        className="h-8 text-right w-20"
                      />
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium text-slate-600 dark:text-slate-300">
                      {formatCurrency(item.precio_unitario)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(item.subtotal)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteItem(item.id)}
                        className="h-8 w-8 p-0 text-rose-500 hover:text-rose-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="mt-4 space-y-2 text-right">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Subtotal: <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(subtotal)}</span>
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            IVA (21%): <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(iva)}</span>
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white">
            Total: {formatCurrency(total)}
          </div>
          {Math.abs(total - estimateTotal) > 0.01 && (
            <Button variant="outline" size="sm" onClick={handleSyncTotal}>
              Actualizar total del presupuesto
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
