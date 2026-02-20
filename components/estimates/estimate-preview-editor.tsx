"use client";

import { useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus, Percent } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import { roundCurrency, computeSellingPrice } from "@/lib/utils";

export type Partida = {
  categoria: string;
  descripcion: string;
  unidad: string;
  cantidad: number;
  precio_coste: number;
  margen: number;
  precio_unitario: number;
  subtotal: number;
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
  const subtotal = useMemo(() => roundCurrency(partidas.reduce((sum, p) => sum + p.subtotal, 0)), [partidas]);
  const iva = useMemo(() => roundCurrency(subtotal * 0.21), [subtotal]);
  const total = useMemo(() => roundCurrency(subtotal + iva), [subtotal, iva]);

  const handleUpdateItem = useCallback((index: number, field: string, value: string) => {
    const item = partidas[index];
    if (!item) return;

    const numVal = parseFloat(value) || 0;
    let updated: Partida;

    if (field === "precio_coste") {
      const precioUnitario = computeSellingPrice(numVal, item.margen);
      updated = { ...item, precio_coste: numVal, precio_unitario: precioUnitario, subtotal: roundCurrency(item.cantidad * precioUnitario) };
    } else if (field === "margen") {
      const precioUnitario = computeSellingPrice(item.precio_coste, numVal);
      updated = { ...item, margen: numVal, precio_unitario: precioUnitario, subtotal: roundCurrency(item.cantidad * precioUnitario) };
    } else if (field === "cantidad") {
      updated = { ...item, cantidad: numVal, subtotal: roundCurrency(numVal * item.precio_unitario) };
    } else {
      updated = { ...item, [field]: value };
    }

    const next = [...partidas];
    next[index] = updated;
    onPartidasChange(next);
  }, [partidas, onPartidasChange]);

  function handleAddItem() {
    const newItem: Partida = {
      categoria: "General",
      descripcion: "Nueva partida",
      unidad: "ud",
      cantidad: 1,
      precio_coste: 0,
      margen: margenGlobal,
      precio_unitario: 0,
      subtotal: 0,
      orden: partidas.length,
    };
    onPartidasChange([...partidas, newItem]);
  }

  function handleDeleteItem(index: number) {
    onPartidasChange(partidas.filter((_, i) => i !== index).map((p, i) => ({ ...p, orden: i })));
  }

  function handleApplyGlobalMargin() {
    const updated = partidas.map((p) => {
      const precioUnitario = computeSellingPrice(p.precio_coste, margenGlobal);
      return { ...p, margen: margenGlobal, precio_unitario: precioUnitario, subtotal: roundCurrency(p.cantidad * precioUnitario) };
    });
    onPartidasChange(updated);
  }

  return (
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
          <Button variant="outline" size="sm" onClick={handleAddItem}>
            <Plus className="mr-1 h-4 w-4" /> Añadir partida
          </Button>
        </div>
      </div>

      {/* Vista móvil: tarjetas */}
      <div className="space-y-3 sm:hidden">
        {partidas.map((p, i) => (
          <div key={i} className="rounded-lg border p-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <Input
                  defaultValue={p.categoria}
                  onBlur={(e) => handleUpdateItem(i, "categoria", e.target.value)}
                  className="h-7 text-xs font-medium text-amber-700 bg-amber-50 border-amber-200 mb-1"
                />
                <Input
                  defaultValue={p.descripcion}
                  onBlur={(e) => handleUpdateItem(i, "descripcion", e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteItem(i)}
                className="h-8 w-8 p-0 text-rose-500 hover:text-rose-700 shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div>
                <span className="text-[10px] text-slate-500 block">Ud.</span>
                <Input
                  defaultValue={p.unidad}
                  onBlur={(e) => handleUpdateItem(i, "unidad", e.target.value)}
                  className="h-7 text-xs text-center"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Cant.</span>
                <Input
                  type="number"
                  step="0.01"
                  defaultValue={p.cantidad}
                  onBlur={(e) => handleUpdateItem(i, "cantidad", e.target.value)}
                  className="h-7 text-xs text-right"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">P. Coste</span>
                <Input
                  type="number"
                  step="0.01"
                  defaultValue={p.precio_coste}
                  onBlur={(e) => handleUpdateItem(i, "precio_coste", e.target.value)}
                  className="h-7 text-xs text-right"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Margen %</span>
                <Input
                  type="number"
                  step="1"
                  defaultValue={p.margen}
                  onBlur={(e) => handleUpdateItem(i, "margen", e.target.value)}
                  className="h-7 text-xs text-right"
                />
              </div>
            </div>
            <div className="flex justify-between text-sm pt-1 border-t">
              <span className="text-slate-500">P. Venta: <span className="font-medium text-slate-700">{formatCurrency(p.precio_unitario)}</span></span>
              <span className="font-semibold">{formatCurrency(p.subtotal)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Vista desktop: tabla */}
      <div className="overflow-x-auto rounded-lg border hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Categoria</TableHead>
              <TableHead>Descripcion</TableHead>
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
            {partidas.map((p, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Input
                    defaultValue={p.categoria}
                    onBlur={(e) => handleUpdateItem(i, "categoria", e.target.value)}
                    className="h-8 text-xs"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    defaultValue={p.descripcion}
                    onBlur={(e) => handleUpdateItem(i, "descripcion", e.target.value)}
                    className="h-8 text-sm"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    defaultValue={p.unidad}
                    onBlur={(e) => handleUpdateItem(i, "unidad", e.target.value)}
                    className="h-8 text-xs text-right w-14"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    defaultValue={p.cantidad}
                    onBlur={(e) => handleUpdateItem(i, "cantidad", e.target.value)}
                    className="h-8 text-right w-20"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    defaultValue={p.precio_coste}
                    onBlur={(e) => handleUpdateItem(i, "precio_coste", e.target.value)}
                    className="h-8 text-right w-24"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="1"
                    defaultValue={p.margen}
                    onBlur={(e) => handleUpdateItem(i, "margen", e.target.value)}
                    className="h-8 text-right w-20"
                  />
                </TableCell>
                <TableCell className="text-right text-sm font-medium text-slate-600 dark:text-slate-300">
                  {formatCurrency(p.precio_unitario)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(p.subtotal)}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteItem(i)}
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
      </div>
    </div>
  );
}
