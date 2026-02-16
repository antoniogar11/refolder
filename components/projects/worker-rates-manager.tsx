"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createWorkerRateAction, deleteWorkerRateAction } from "@/app/dashboard/proyectos/worker-rate-actions";
import { Plus, Trash2, Loader2, Settings } from "lucide-react";
import type { WorkerRate } from "@/types";
import { formatCurrency } from "@/lib/utils/format";

type WorkerRatesManagerProps = {
  rates: WorkerRate[];
};

export function WorkerRatesManager({ rates }: WorkerRatesManagerProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      nombre: formData.get("nombre") as string,
      tarifa_hora: formData.get("tarifa_hora") as string,
    };

    try {
      const result = await createWorkerRateAction(data);
      if (result.success) {
        toast.success(result.message);
        (e.target as HTMLFormElement).reset();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Error al guardar la tarifa.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(rateId: string) {
    setDeletingId(rateId);
    try {
      const result = await deleteWorkerRateAction(rateId);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Error al eliminar la tarifa.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-3">
      <Button onClick={() => setOpen(!open)} variant="outline" size="sm">
        <Settings className="mr-2 h-4 w-4" />
        {open ? "Cerrar tarifas" : "Gestionar tarifas"}
      </Button>

      {open && (
        <div className="rounded-lg border bg-slate-50 p-4 space-y-4">
          <h4 className="text-sm font-semibold text-slate-700">Tarifas de trabajadores</h4>

          {rates.length > 0 && (
            <div className="space-y-2">
              {rates.map((rate) => (
                <div key={rate.id} className="flex items-center justify-between rounded-md bg-white border px-3 py-2">
                  <div>
                    <span className="font-medium text-sm">{rate.nombre}</span>
                    <span className="ml-2 text-sm text-slate-500">
                      {formatCurrency(rate.tarifa_hora)}/h
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(rate.id)}
                    disabled={deletingId === rate.id}
                    className="h-7 w-7 p-0 text-slate-400 hover:text-rose-500"
                  >
                    {deletingId === rate.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <div className="space-y-1 flex-1">
              <Label htmlFor="rate-nombre" className="text-xs">Nombre</Label>
              <Input id="rate-nombre" name="nombre" required placeholder="Ej. Fontanero" className="h-8 text-sm" />
            </div>
            <div className="space-y-1 w-28">
              <Label htmlFor="rate-tarifa" className="text-xs">EUR/hora</Label>
              <Input id="rate-tarifa" name="tarifa_hora" type="number" step="0.01" required placeholder="0.00" className="h-8 text-sm" />
            </div>
            <Button type="submit" size="sm" disabled={saving} className="h-8">
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
            </Button>
          </form>

          {rates.length === 0 && (
            <p className="text-xs text-slate-500">
              A&ntilde;ade tarifas para poder seleccionarlas r&aacute;pidamente al registrar horas.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
