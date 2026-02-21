"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { computeSellingPrice, roundCurrency } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/format";

type LineData = {
  categoria: string;
  descripcion: string;
  unidad: string;
  cantidad: number;
  precio_coste: number;
  margen: number;
  iva_porcentaje: number;
};

type EstimateLineModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: LineData | null;
  onSave: (data: LineData) => void | Promise<void>;
  isSaving?: boolean;
};

const IVA_OPTIONS = [
  { value: "21", label: "21% General" },
  { value: "10", label: "10% Reducido (Reformas)" },
  { value: "4", label: "4% Superreducido" },
  { value: "0", label: "0% Exento" },
];

export function EstimateLineModal({
  open,
  onOpenChange,
  item,
  onSave,
  isSaving = false,
}: EstimateLineModalProps) {
  const [categoria, setCategoria] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [unidad, setUnidad] = useState("ud");
  const [cantidad, setCantidad] = useState(1);
  const [precioCoste, setPrecioCoste] = useState(0);
  const [margen, setMargen] = useState(20);
  const [ivaPorcentaje, setIvaPorcentaje] = useState(21);

  // Reset state when modal opens (React 19 pattern: adjust state during render)
  const [prevOpen, setPrevOpen] = useState(false);
  if (open && !prevOpen) {
    if (item) {
      setCategoria(item.categoria);
      setDescripcion(item.descripcion);
      setUnidad(item.unidad);
      setCantidad(item.cantidad);
      setPrecioCoste(item.precio_coste);
      setMargen(item.margen);
      setIvaPorcentaje(item.iva_porcentaje);
    } else {
      setCategoria("General");
      setDescripcion("");
      setUnidad("ud");
      setCantidad(1);
      setPrecioCoste(0);
      setMargen(20);
      setIvaPorcentaje(21);
    }
  }
  if (open !== prevOpen) {
    setPrevOpen(open);
  }

  const precioVenta = useMemo(
    () => computeSellingPrice(precioCoste, margen),
    [precioCoste, margen],
  );

  const importe = useMemo(
    () => roundCurrency(cantidad * precioVenta),
    [cantidad, precioVenta],
  );

  async function handleSave() {
    await onSave({
      categoria,
      descripcion,
      unidad,
      cantidad,
      precio_coste: precioCoste,
      margen,
      iva_porcentaje: ivaPorcentaje,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{item ? "Editar partida" : "Nueva partida"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Categoría */}
          <div className="space-y-1.5">
            <Label className="text-sm">Categoría</Label>
            <Input
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              placeholder="Ej: Albañilería, Fontanería..."
            />
          </div>

          {/* Descripción */}
          <div className="space-y-1.5">
            <Label className="text-sm">Descripción</Label>
            <Textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción de la partida..."
              rows={3}
            />
          </div>

          {/* Fila: Unidad | Cantidad | IVA */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm">Unidad</Label>
              <Input
                value={unidad}
                onChange={(e) => setUnidad(e.target.value)}
                placeholder="m², ud..."
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Cantidad</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={cantidad}
                onChange={(e) => setCantidad(parseFloat(e.target.value) || 0)}
                className="text-right"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">IVA</Label>
              <NativeSelect
                value={ivaPorcentaje.toString()}
                onChange={(e) => setIvaPorcentaje(Number(e.target.value))}
              >
                {IVA_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </NativeSelect>
            </div>
          </div>

          {/* Fila: Precio coste | Margen % | Precio venta */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm">Precio coste</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={precioCoste}
                onChange={(e) => setPrecioCoste(parseFloat(e.target.value) || 0)}
                className="text-right"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Margen %</Label>
              <Input
                type="number"
                step="1"
                min="0"
                max="500"
                value={margen}
                onChange={(e) => setMargen(parseFloat(e.target.value) || 0)}
                className="text-right"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-slate-500">P. Venta</Label>
              <div className="flex h-9 items-center rounded-md border bg-slate-50 px-3 text-right text-sm font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {formatCurrency(precioVenta)}
              </div>
            </div>
          </div>

          {/* Importe total */}
          <div className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-800 px-4 py-3">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Importe</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              {formatCurrency(importe)}
            </span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
