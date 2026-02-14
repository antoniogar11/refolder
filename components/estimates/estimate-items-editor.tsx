"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";
import {
  updateEstimateItemAction,
  addEstimateItemAction,
  deleteEstimateItemAction,
  updateEstimateTotalAction,
} from "@/app/dashboard/presupuestos/actions";
import type { EstimateItem } from "@/types";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(amount);
}

type EstimateItemsEditorProps = {
  estimateId: string;
  initialItems: EstimateItem[];
  estimateTotal: number;
};

export function EstimateItemsEditor({ estimateId, initialItems, estimateTotal }: EstimateItemsEditorProps) {
  const [items, setItems] = useState(initialItems);
  const [editingId, setEditingId] = useState<string | null>(null);

  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const iva = Math.round(subtotal * 0.21 * 100) / 100;
  const total = Math.round((subtotal + iva) * 100) / 100;

  const handleUpdateItem = useCallback(async (itemId: string, field: string, value: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    let update: Record<string, unknown> = {};
    if (field === "cantidad" || field === "precio_unitario") {
      const numVal = parseFloat(value) || 0;
      update[field] = numVal;
      update.cantidad = field === "cantidad" ? numVal : item.cantidad;
      update.precio_unitario = field === "precio_unitario" ? numVal : item.precio_unitario;
    } else {
      update[field] = value;
      update.cantidad = item.cantidad;
      update.precio_unitario = item.precio_unitario;
    }

    const newSubtotal = Math.round(
      (update.cantidad as number) * (update.precio_unitario as number) * 100
    ) / 100;

    setItems(prev => prev.map(i =>
      i.id === itemId ? { ...i, ...update, subtotal: newSubtotal } as EstimateItem : i
    ));

    await updateEstimateItemAction(itemId, {
      ...(field === "cantidad" || field === "precio_unitario"
        ? { cantidad: update.cantidad as number, precio_unitario: update.precio_unitario as number }
        : { [field]: value }),
    });
  }, [items]);

  async function handleAddItem() {
    const newItem = {
      categoria: "General",
      descripcion: "Nueva partida",
      unidad: "ud",
      cantidad: 1,
      precio_unitario: 0,
      orden: items.length,
    };

    const result = await addEstimateItemAction(estimateId, newItem);
    if (result.success) {
      toast.success("Partida añadida");
      // Reload to get the new item with its ID
      window.location.reload();
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Partidas ({items.length})</CardTitle>
        <Button variant="outline" size="sm" onClick={handleAddItem}>
          <Plus className="mr-1 h-4 w-4" /> Añadir partida
        </Button>
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
                  <TableHead className="w-[100px] text-right">P. Unit.</TableHead>
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
                        defaultValue={item.precio_unitario}
                        onBlur={(e) => handleUpdateItem(item.id, "precio_unitario", e.target.value)}
                        className="h-8 text-right w-24"
                      />
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
