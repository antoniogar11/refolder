"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { createHourAction } from "@/app/dashboard/proyectos/hour-actions";
import { Plus, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import { roundCurrency } from "@/lib/utils";
import type { WorkerRate } from "@/types";

type AddHoursFormProps = {
  projectId: string;
  workerRates: WorkerRate[];
};

export function AddHoursForm({ projectId, workerRates }: AddHoursFormProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedRate, setSelectedRate] = useState("");
  const [tarifa, setTarifa] = useState("");
  const [horas, setHoras] = useState("");

  const costeCalculado = useMemo(() => {
    const t = parseFloat(tarifa);
    const h = parseFloat(horas);
    if (isNaN(t) || isNaN(h) || t <= 0 || h <= 0) return 0;
    return roundCurrency(t * h);
  }, [tarifa, horas]);

  function handleWorkerChange(value: string) {
    setSelectedRate(value);
    if (value === "custom") {
      setTarifa("");
      return;
    }
    const rate = workerRates.find((r) => r.id === value);
    if (rate) {
      setTarifa(rate.tarifa_hora.toString());
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const rate = workerRates.find((r) => r.id === selectedRate);

    const data = {
      descripcion: formData.get("descripcion") as string,
      categoria_trabajador: rate?.nombre || (formData.get("categoria_custom") as string) || "Sin categorizar",
      tarifa_hora: tarifa,
      horas,
      fecha: formData.get("fecha") as string,
      notas: formData.get("notas") as string,
    };

    try {
      const result = await createHourAction(projectId, data);
      if (result.success) {
        toast.success(result.message);
        setOpen(false);
        setSelectedRate("");
        setTarifa("");
        setHoras("");
        (e.target as HTMLFormElement).reset();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Error al guardar las horas.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} variant="outline" size="sm">
        <Plus className="mr-2 h-4 w-4" />
        Registrar horas
      </Button>
    );
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <Card className="border-violet-200 bg-violet-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Registrar horas de trabajo</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="hours-descripcion" className="text-sm">Descripci&oacute;n *</Label>
              <Input id="hours-descripcion" name="descripcion" required placeholder="Ej. Instalaci&oacute;n tuber&iacute;as ba&ntilde;o" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="hours-worker" className="text-sm">Tipo de trabajador *</Label>
              <NativeSelect
                id="hours-worker"
                value={selectedRate}
                onChange={(e) => handleWorkerChange(e.target.value)}
                required
              >
                <option value="" disabled>Seleccionar...</option>
                {workerRates.map((rate) => (
                  <option key={rate.id} value={rate.id}>
                    {rate.nombre} ({formatCurrency(rate.tarifa_hora)}/h)
                  </option>
                ))}
                <option value="custom">-- Tarifa manual --</option>
              </NativeSelect>
            </div>
          </div>

          {selectedRate === "custom" && (
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="hours-categoria-custom" className="text-sm">Nombre del trabajador *</Label>
                <Input id="hours-categoria-custom" name="categoria_custom" required placeholder="Ej. Fontanero" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="hours-tarifa" className="text-sm">Tarifa/hora (EUR) *</Label>
                <Input
                  id="hours-tarifa"
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={tarifa}
                  onChange={(e) => setTarifa(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-1">
              <Label htmlFor="hours-horas" className="text-sm">Horas *</Label>
              <Input
                id="hours-horas"
                type="number"
                step="0.25"
                required
                placeholder="0"
                value={horas}
                onChange={(e) => setHoras(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="hours-fecha" className="text-sm">Fecha *</Label>
              <Input id="hours-fecha" name="fecha" type="date" required defaultValue={today} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="hours-notas" className="text-sm">Notas</Label>
              <Input id="hours-notas" name="notas" placeholder="Opcional" />
            </div>
          </div>

          {costeCalculado > 0 && (
            <div className="rounded-md bg-violet-100 px-3 py-2 text-sm">
              <span className="text-violet-700 font-medium">
                Coste estimado: {formatCurrency(costeCalculado)}
              </span>
              <span className="text-violet-500 ml-1">
                ({horas}h &times; {formatCurrency(parseFloat(tarifa))}/h)
              </span>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="ghost" size="sm" onClick={() => { setOpen(false); setSelectedRate(""); setTarifa(""); setHoras(""); }}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : null}
              Guardar horas
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
