"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { toast } from "sonner";
import { linkEstimateToProjectAction } from "@/app/dashboard/proyectos/cost-actions";
import { Link2, Loader2 } from "lucide-react";

type LinkEstimateSelectProps = {
  projectId: string;
  estimates: { id: string; name: string; total_amount: number }[];
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(amount);
}

export function LinkEstimateSelect({ projectId, estimates }: LinkEstimateSelectProps) {
  const [selectedId, setSelectedId] = useState("");
  const [linking, setLinking] = useState(false);

  async function handleLink() {
    if (!selectedId) {
      toast.error("Selecciona un presupuesto.");
      return;
    }
    setLinking(true);
    try {
      const result = await linkEstimateToProjectAction(projectId, selectedId);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Error al vincular.");
    } finally {
      setLinking(false);
    }
  }

  if (estimates.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        No hay presupuestos disponibles. Crea uno primero.
      </p>
    );
  }

  return (
    <div className="flex items-end gap-2">
      <div className="flex-1 space-y-1">
        <NativeSelect value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
          <option value="">Seleccionar presupuesto...</option>
          {estimates.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name} ({formatCurrency(e.total_amount)})
            </option>
          ))}
        </NativeSelect>
      </div>
      <Button onClick={handleLink} disabled={!selectedId || linking} size="sm">
        {linking ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Link2 className="mr-2 h-3 w-3" />}
        Vincular
      </Button>
    </div>
  );
}
