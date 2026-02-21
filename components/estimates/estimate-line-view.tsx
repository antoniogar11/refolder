import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import { roundCurrency } from "@/lib/utils";

type EstimateLineViewProps = {
  item: {
    descripcion: string;
    cantidad: number;
    unidad: string;
    precio_unitario: number;
    iva_porcentaje?: number | null;
  };
  itemIndex: number;
  categoryIndex: number;
  mode: "view" | "edit";
  onClick?: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
  isSaving?: boolean;
};

export function EstimateLineView({
  item,
  itemIndex,
  categoryIndex,
  mode,
  onClick,
  onDelete,
  isDeleting,
  isSaving,
}: EstimateLineViewProps) {
  const importe = roundCurrency(item.cantidad * item.precio_unitario);

  const isInteractive = mode === "edit" && onClick;

  return (
    <div
      className={`group relative px-4 py-3 ${
        isInteractive
          ? "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          : ""
      } ${isSaving ? "opacity-60" : ""}`}
      onClick={isInteractive ? onClick : undefined}
    >
      {/* Línea 1: Número + Descripción */}
      <div className="flex items-start gap-2">
        <span className="shrink-0 text-xs font-medium text-slate-400 pt-0.5">
          {categoryIndex}.{itemIndex}
        </span>
        <p className="flex-1 text-sm text-slate-800 dark:text-slate-200">
          {item.descripcion}
        </p>
        {mode === "edit" && onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            disabled={isDeleting || isSaving}
            className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-rose-500 hover:text-rose-700 shrink-0 sm:flex hidden"
          >
            {isDeleting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
          </Button>
        )}
      </div>

      {/* Línea 2: Cantidad × Precio | Importe | IVA badge */}
      <div className="mt-1 ml-6 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {item.cantidad} {item.unidad} × {formatCurrency(item.precio_unitario)}/{item.unidad}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-900 dark:text-white">
            {formatCurrency(importe)}
          </span>
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400">
            IVA {item.iva_porcentaje ?? 21}%
          </span>
          {isSaving && <Loader2 className="h-3 w-3 animate-spin text-amber-500" />}
        </div>
      </div>

      {/* Botón eliminar móvil (siempre visible) */}
      {mode === "edit" && onDelete && (
        <div className="sm:hidden absolute top-2 right-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            disabled={isDeleting || isSaving}
            className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700"
          >
            {isDeleting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
