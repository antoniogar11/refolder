"use client";

import { useState, useCallback, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { Trash2, Plus, Percent, Loader2 } from "lucide-react";
import {
  updateEstimateItemAction,
  addEstimateItemAction,
  deleteEstimateItemAction,
  updateEstimateTotalAction,
  updateGlobalMarginAction,
  updateEstimateIvaAction,
} from "@/app/dashboard/presupuestos/actions";
import { formatCurrency } from "@/lib/utils/format";
import { roundCurrency, computeSellingPrice } from "@/lib/utils";
import type { EstimateItem } from "@/types";

type EstimateItemsEditorProps = {
  estimateId: string;
  initialItems: EstimateItem[];
  estimateTotal: number;
  margenGlobal: number | null;
  ivaPorcentaje?: number;
};

export function EstimateItemsEditor({ estimateId, initialItems, estimateTotal, margenGlobal, ivaPorcentaje = 21 }: EstimateItemsEditorProps) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [globalMargin, setGlobalMargin] = useState(margenGlobal ?? 20);
  const [isApplyingMargin, startApplyingMargin] = useTransition();
  const [ivaRate, setIvaRate] = useState(ivaPorcentaje);
  const [savingItems, setSavingItems] = useState<Set<string>>(new Set());
  const [deletingItem, setDeletingItem] = useState<string | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isSyncingTotal, setIsSyncingTotal] = useState(false);

  // Recalculate subtotal from cantidad * precio_unitario to fix any stale DB values
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + roundCurrency(item.cantidad * item.precio_unitario), 0),
    [items],
  );
  const iva = useMemo(() => roundCurrency(subtotal * (ivaRate / 100)), [subtotal, ivaRate]);
  const total = useMemo(() => roundCurrency(subtotal + iva), [subtotal, iva]);

  const markSaving = useCallback((itemId: string, saving: boolean) => {
    setSavingItems(prev => {
      const next = new Set(prev);
      if (saving) next.add(itemId);
      else next.delete(itemId);
      return next;
    });
  }, []);

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

    // Optimistic update
    const previousItems = items;
    setItems(prev => prev.map(i => {
      if (i.id !== itemId) return i;
      const updated = { ...i, ...update };
      const newSubtotal = roundCurrency(
        (updated.cantidad as number) * (updated.precio_unitario as number)
      );
      return { ...updated, subtotal: newSubtotal } as EstimateItem;
    }));

    markSaving(itemId, true);

    try {
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
    } catch {
      // Rollback on error
      setItems(previousItems);
      toast.error("Error al guardar el cambio. Comprueba tu conexión e inténtalo de nuevo.");
    } finally {
      markSaving(itemId, false);
    }
  }, [items, markSaving]);

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

    setIsAddingItem(true);
    try {
      const result = await addEstimateItemAction(estimateId, newItem);
      if (result.success) {
        toast.success("Partida añadida");
        router.refresh();
      } else {
        toast.error(result.message || "Error al añadir la partida.");
      }
    } catch {
      toast.error("Error de conexión al añadir la partida. Inténtalo de nuevo.");
    } finally {
      setIsAddingItem(false);
    }
  }

  async function handleDeleteItem(itemId: string) {
    // Optimistic delete
    const previousItems = items;
    setItems(prev => prev.filter(i => i.id !== itemId));
    setDeletingItem(itemId);

    try {
      const result = await deleteEstimateItemAction(itemId, estimateId);
      if (result.success) {
        toast.success("Partida eliminada");
      } else {
        // Rollback
        setItems(previousItems);
        toast.error(result.message || "Error al eliminar la partida.");
      }
    } catch {
      // Rollback
      setItems(previousItems);
      toast.error("Error de conexión al eliminar la partida. Inténtalo de nuevo.");
    } finally {
      setDeletingItem(null);
    }
  }

  async function handleSyncTotal() {
    setIsSyncingTotal(true);
    try {
      const result = await updateEstimateTotalAction(estimateId, total);
      if (result.success) {
        toast.success("Total del presupuesto actualizado");
      } else {
        toast.error(result.message || "Error al actualizar el total.");
      }
    } catch {
      toast.error("Error de conexión al actualizar el total. Inténtalo de nuevo.");
    } finally {
      setIsSyncingTotal(false);
    }
  }

  function handleApplyGlobalMargin() {
    startApplyingMargin(async () => {
      try {
        const result = await updateGlobalMarginAction(estimateId, globalMargin);
        if (result.success) {
          toast.success(result.message);
          router.refresh();
        } else {
          toast.error(result.message || "Error al aplicar el margen global.");
        }
      } catch {
        toast.error("Error de conexión al aplicar el margen. Inténtalo de nuevo.");
      }
    });
  }

  async function handleIvaChange(newRate: number) {
    const previousRate = ivaRate;
    setIvaRate(newRate);
    try {
      const result = await updateEstimateIvaAction(estimateId, newRate);
      if (result.success) {
        toast.success(`IVA actualizado a ${newRate}%`);
      } else {
        setIvaRate(previousRate);
        toast.error(result.message || "Error al actualizar el IVA.");
      }
    } catch {
      setIvaRate(previousRate);
      toast.error("Error de conexión al actualizar el IVA. Inténtalo de nuevo.");
    }
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
              {isApplyingMargin ? (
                <><Loader2 className="mr-1 h-3 w-3 animate-spin" /> Aplicando...</>
              ) : (
                "Aplicar"
              )}
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddItem}
            disabled={isAddingItem}
          >
            {isAddingItem ? (
              <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Añadiendo...</>
            ) : (
              <><Plus className="mr-1 h-4 w-4" /> Añadir partida</>
            )}
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
            <TooltipProvider>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px]">Categoría</TableHead>
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
                  {items.map((item) => {
                    const isSaving = savingItems.has(item.id);
                    return (
                      <TableRow key={item.id} className={isSaving ? "opacity-70" : ""}>
                        <TableCell>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Input
                                defaultValue={item.categoria}
                                onBlur={(e) => handleUpdateItem(item.id, "categoria", e.target.value)}
                                className="h-8 text-xs"
                                disabled={isSaving}
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{item.categoria}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Input
                            defaultValue={item.descripcion}
                            onBlur={(e) => handleUpdateItem(item.id, "descripcion", e.target.value)}
                            className="h-8 text-sm"
                            disabled={isSaving}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            defaultValue={item.unidad}
                            onBlur={(e) => handleUpdateItem(item.id, "unidad", e.target.value)}
                            className="h-8 text-xs text-right w-14"
                            disabled={isSaving}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            defaultValue={item.cantidad}
                            onBlur={(e) => handleUpdateItem(item.id, "cantidad", e.target.value)}
                            className="h-8 text-right w-20"
                            disabled={isSaving}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            defaultValue={item.precio_coste ?? 0}
                            onBlur={(e) => handleUpdateItem(item.id, "precio_coste", e.target.value)}
                            className="h-8 text-right w-24"
                            disabled={isSaving}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="1"
                            defaultValue={item.margen}
                            onBlur={(e) => handleUpdateItem(item.id, "margen", e.target.value)}
                            className="h-8 text-right w-20"
                            disabled={isSaving}
                          />
                        </TableCell>
                        <TableCell className="text-right text-sm font-medium text-slate-600 dark:text-slate-300">
                          <div className="flex items-center justify-end gap-1">
                            {isSaving && <Loader2 className="h-3 w-3 animate-spin text-amber-500" />}
                            {formatCurrency(item.precio_unitario)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(roundCurrency(item.cantidad * item.precio_unitario))}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteItem(item.id)}
                            disabled={!!deletingItem || isSaving}
                            className="h-8 w-8 p-0 text-rose-500 hover:text-rose-700"
                          >
                            {deletingItem === item.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TooltipProvider>
          </div>
        )}

        <div className="mt-4 space-y-2 text-right">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Subtotal: <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex items-center justify-end gap-2 text-sm text-slate-600 dark:text-slate-400">
            <NativeSelect
              value={ivaRate.toString()}
              onChange={(e) => handleIvaChange(Number(e.target.value))}
              className="w-auto h-8 text-sm"
            >
              <option value="21">IVA 21% (General)</option>
              <option value="10">IVA 10% (Reducido - Reformas)</option>
            </NativeSelect>
            <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(iva)}</span>
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white">
            Total: {formatCurrency(total)}
          </div>
          {Math.abs(total - estimateTotal) > 0.01 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSyncTotal}
              disabled={isSyncingTotal}
            >
              {isSyncingTotal ? (
                <><Loader2 className="mr-1 h-3 w-3 animate-spin" /> Actualizando...</>
              ) : (
                "Actualizar total del presupuesto"
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
