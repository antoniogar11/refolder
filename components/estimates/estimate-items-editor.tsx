"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Percent, Loader2 } from "lucide-react";
import {
  updateEstimateItemAction,
  addEstimateItemAction,
  deleteEstimateItemAction,
  updateEstimateTotalAction,
  updateGlobalMarginAction,
} from "@/app/dashboard/presupuestos/actions";
import { computeSellingPrice } from "@/lib/utils";
import { computeEstimateTotals } from "@/lib/utils/estimate-totals";
import { EstimateLineView } from "@/components/estimates/estimate-line-view";
import { EstimateLineModal } from "@/components/estimates/estimate-line-modal";
import { EstimateTotals } from "@/components/estimates/estimate-totals";
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
  const [savingItems, setSavingItems] = useState<Set<string>>(new Set());
  const [deletingItem, setDeletingItem] = useState<string | null>(null);
  const [isSyncingTotal, setIsSyncingTotal] = useState(false);

  // Modal state
  const [editingItem, setEditingItem] = useState<EstimateItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isSavingModal, setIsSavingModal] = useState(false);

  const { total } = useMemo(() => computeEstimateTotals(items), [items]);

  // Agrupar items por categoría
  const categories = useMemo(() => {
    const map = new Map<string, EstimateItem[]>();
    for (const item of items) {
      const cat = item.categoria || "General";
      const existing = map.get(cat) ?? [];
      existing.push(item);
      map.set(cat, existing);
    }
    return map;
  }, [items]);

  function handleOpenEdit(item: EstimateItem) {
    setEditingItem(item);
    setIsAddingNew(false);
    setIsModalOpen(true);
  }

  function handleOpenAdd() {
    setEditingItem(null);
    setIsAddingNew(true);
    setIsModalOpen(true);
  }

  async function handleModalSave(data: {
    categoria: string;
    descripcion: string;
    unidad: string;
    cantidad: number;
    precio_coste: number;
    margen: number;
    iva_porcentaje: number;
  }) {
    const precioUnitario = computeSellingPrice(data.precio_coste, data.margen);
    setIsSavingModal(true);

    try {
      if (isAddingNew) {
        // Añadir nueva partida
        const result = await addEstimateItemAction(estimateId, {
          categoria: data.categoria,
          descripcion: data.descripcion,
          unidad: data.unidad,
          cantidad: data.cantidad,
          precio_coste: data.precio_coste,
          margen: data.margen,
          precio_unitario: precioUnitario,
          orden: items.length,
          iva_porcentaje: data.iva_porcentaje,
        });
        if (result.success) {
          toast.success("Partida añadida");
          setIsModalOpen(false);
          router.refresh();
        } else {
          toast.error(result.message || "Error al añadir la partida.");
        }
      } else if (editingItem) {
        // Optimistic update
        const previousItems = items;
        const subtotal = data.cantidad * precioUnitario;
        setItems((prev) =>
          prev.map((i) =>
            i.id === editingItem.id
              ? { ...i, ...data, precio_unitario: precioUnitario, subtotal }
              : i,
          ),
        );
        setIsModalOpen(false);

        setSavingItems((prev) => new Set(prev).add(editingItem.id));
        try {
          await updateEstimateItemAction(editingItem.id, {
            categoria: data.categoria,
            descripcion: data.descripcion,
            unidad: data.unidad,
            cantidad: data.cantidad,
            precio_coste: data.precio_coste,
            margen: data.margen,
            iva_porcentaje: data.iva_porcentaje,
          });
        } catch {
          setItems(previousItems);
          toast.error("Error al guardar el cambio.");
        } finally {
          setSavingItems((prev) => {
            const next = new Set(prev);
            next.delete(editingItem.id);
            return next;
          });
        }
      }
    } finally {
      setIsSavingModal(false);
    }
  }

  async function handleDeleteItem(itemId: string) {
    const previousItems = items;
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    setDeletingItem(itemId);

    try {
      const result = await deleteEstimateItemAction(itemId, estimateId);
      if (result.success) {
        toast.success("Partida eliminada");
      } else {
        setItems(previousItems);
        toast.error(result.message || "Error al eliminar la partida.");
      }
    } catch {
      setItems(previousItems);
      toast.error("Error de conexión al eliminar la partida.");
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
      toast.error("Error de conexión al actualizar el total.");
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
        toast.error("Error de conexión al aplicar el margen.");
      }
    });
  }

  return (
    <>
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
          </div>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-slate-600 dark:text-slate-400 text-sm text-center py-8">
              No hay partidas. Añade una manualmente o genera con IA desde la obra.
            </p>
          ) : (
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
              {Array.from(categories.entries()).map(([category, categoryItems], catIndex) => (
                <div key={category}>
                  {/* Header de categoría */}
                  <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    {catIndex + 1}. {category}
                  </div>
                  {/* Items de la categoría */}
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {categoryItems.map((item, itemIdx) => (
                      <EstimateLineView
                        key={item.id}
                        item={item}
                        itemIndex={itemIdx + 1}
                        categoryIndex={catIndex + 1}
                        mode="edit"
                        onClick={() => handleOpenEdit(item)}
                        onDelete={() => handleDeleteItem(item.id)}
                        isDeleting={deletingItem === item.id}
                        isSaving={savingItems.has(item.id)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Añadir partida */}
          <button
            onClick={handleOpenAdd}
            className="mt-3 flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400"
          >
            <Plus className="h-4 w-4" />
            Añadir línea
          </button>

          {/* Totales */}
          <div className="mt-6 flex justify-end">
            <div className="w-full max-w-xs">
              <EstimateTotals items={items} />
              {Math.abs(total - estimateTotal) > 0.01 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSyncTotal}
                  disabled={isSyncingTotal}
                  className="mt-2 w-full"
                >
                  {isSyncingTotal ? (
                    <><Loader2 className="mr-1 h-3 w-3 animate-spin" /> Actualizando...</>
                  ) : (
                    "Actualizar total del presupuesto"
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de edición */}
      <EstimateLineModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        item={
          editingItem
            ? {
                categoria: editingItem.categoria,
                descripcion: editingItem.descripcion,
                unidad: editingItem.unidad,
                cantidad: editingItem.cantidad,
                precio_coste: editingItem.precio_coste ?? 0,
                margen: editingItem.margen,
                iva_porcentaje: editingItem.iva_porcentaje ?? 21,
              }
            : null
        }
        onSave={handleModalSave}
        isSaving={isSavingModal}
      />
    </>
  );
}
