"use client";

import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Percent } from "lucide-react";
import { roundCurrency, computeSellingPrice } from "@/lib/utils";
import { EstimateLineView } from "@/components/estimates/estimate-line-view";
import { EstimateLineModal } from "@/components/estimates/estimate-line-modal";
import { EstimateTotals } from "@/components/estimates/estimate-totals";

export type Partida = {
  categoria: string;
  descripcion: string;
  unidad: string;
  cantidad: number;
  precio_coste: number;
  margen: number;
  precio_unitario: number;
  subtotal: number;
  iva_porcentaje: number;
  orden: number;
};

type EstimatePreviewEditorProps = {
  partidas: Partida[];
  onPartidasChange: (partidas: Partida[]) => void;
  margenGlobal: number;
  onMargenGlobalChange: (margen: number) => void;
};

export function EstimatePreviewEditor({
  partidas,
  onPartidasChange,
  margenGlobal,
  onMargenGlobalChange,
}: EstimatePreviewEditorProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Agrupar por categoría
  const categories = useMemo(() => {
    const map = new Map<string, { item: Partida; globalIndex: number }[]>();
    partidas.forEach((item, i) => {
      const cat = item.categoria || "General";
      const existing = map.get(cat) ?? [];
      existing.push({ item, globalIndex: i });
      map.set(cat, existing);
    });
    return map;
  }, [partidas]);

  function handleOpenEdit(globalIndex: number) {
    setEditingIndex(globalIndex);
    setIsAddingNew(false);
    setIsModalOpen(true);
  }

  function handleOpenAdd() {
    setEditingIndex(null);
    setIsAddingNew(true);
    setIsModalOpen(true);
  }

  const handleModalSave = useCallback(
    (data: {
      categoria: string;
      descripcion: string;
      unidad: string;
      cantidad: number;
      precio_coste: number;
      margen: number;
      iva_porcentaje: number;
    }) => {
      const precioUnitario = computeSellingPrice(data.precio_coste, data.margen);
      const subtotal = roundCurrency(data.cantidad * precioUnitario);

      if (isAddingNew) {
        const newItem: Partida = {
          ...data,
          precio_unitario: precioUnitario,
          subtotal,
          orden: partidas.length,
        };
        onPartidasChange([...partidas, newItem]);
      } else if (editingIndex !== null) {
        const next = [...partidas];
        next[editingIndex] = {
          ...next[editingIndex],
          ...data,
          precio_unitario: precioUnitario,
          subtotal,
        };
        onPartidasChange(next);
      }
      setIsModalOpen(false);
    },
    [isAddingNew, editingIndex, partidas, onPartidasChange],
  );

  function handleDeleteItem(globalIndex: number) {
    onPartidasChange(
      partidas.filter((_, i) => i !== globalIndex).map((p, i) => ({ ...p, orden: i })),
    );
  }

  function handleApplyGlobalMargin() {
    const updated = partidas.map((p) => {
      const precioUnitario = computeSellingPrice(p.precio_coste, margenGlobal);
      return {
        ...p,
        margen: margenGlobal,
        precio_unitario: precioUnitario,
        subtotal: roundCurrency(p.cantidad * precioUnitario),
      };
    });
    onPartidasChange(updated);
  }

  const editingPartida = editingIndex !== null ? partidas[editingIndex] : null;

  return (
    <>
      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Partidas ({partidas.length})
          </span>
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
                value={margenGlobal}
                onChange={(e) => onMargenGlobalChange(parseFloat(e.target.value) || 0)}
                className="h-8 w-20 text-right"
              />
              <span className="text-sm text-slate-500">%</span>
              <Button variant="outline" size="sm" onClick={handleApplyGlobalMargin}>
                Aplicar
              </Button>
            </div>
          </div>
        </div>

        {partidas.length > 0 && (
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            {Array.from(categories.entries()).map(([category, categoryItems], catIndex) => (
              <div key={category}>
                <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  {catIndex + 1}. {category}
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {categoryItems.map(({ item, globalIndex }, itemIdx) => (
                    <EstimateLineView
                      key={globalIndex}
                      item={item}
                      itemIndex={itemIdx + 1}
                      categoryIndex={catIndex + 1}
                      mode="edit"
                      onClick={() => handleOpenEdit(globalIndex)}
                      onDelete={() => handleDeleteItem(globalIndex)}
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
        {partidas.length > 0 && (
          <div className="mt-6 flex justify-end">
            <EstimateTotals items={partidas} className="w-full max-w-xs" />
          </div>
        )}
      </div>

      <EstimateLineModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        item={
          editingPartida
            ? {
                categoria: editingPartida.categoria,
                descripcion: editingPartida.descripcion,
                unidad: editingPartida.unidad,
                cantidad: editingPartida.cantidad,
                precio_coste: editingPartida.precio_coste,
                margen: editingPartida.margen,
                iva_porcentaje: editingPartida.iva_porcentaje ?? 21,
              }
            : null
        }
        onSave={handleModalSave}
      />
    </>
  );
}
