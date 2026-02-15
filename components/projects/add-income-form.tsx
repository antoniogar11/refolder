"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { createCostAction } from "@/app/dashboard/proyectos/cost-actions";
import { Plus, Loader2 } from "lucide-react";

type AddIncomeFormProps = {
  projectId: string;
};

export function AddIncomeForm({ projectId }: AddIncomeFormProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      descripcion: formData.get("descripcion") as string,
      categoria: formData.get("categoria") as string,
      importe: formData.get("importe") as string,
      fecha: formData.get("fecha") as string,
      notas: formData.get("notas") as string,
      tipo: "ingreso",
    };

    try {
      const result = await createCostAction(projectId, data);
      if (result.success) {
        toast.success(result.message);
        setOpen(false);
        (e.target as HTMLFormElement).reset();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Error al guardar el ingreso.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} variant="outline" size="sm">
        <Plus className="mr-2 h-4 w-4" />
        Registrar ingreso
      </Button>
    );
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <Card className="border-emerald-200 bg-emerald-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Nuevo ingreso</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="income-descripcion" className="text-sm">Descripci&oacute;n *</Label>
              <Input id="income-descripcion" name="descripcion" required placeholder="Ej. Pago certificaci&oacute;n fase 1" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="income-categoria" className="text-sm">Categor&iacute;a *</Label>
              <NativeSelect id="income-categoria" name="categoria" required defaultValue="pago_cliente">
                <option value="pago_cliente">Pago de cliente</option>
                <option value="certificacion">Certificaci&oacute;n</option>
                <option value="otros">Otros</option>
              </NativeSelect>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-1">
              <Label htmlFor="income-importe" className="text-sm">Importe (EUR) *</Label>
              <Input id="income-importe" name="importe" type="number" step="0.01" required placeholder="0.00" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="income-fecha" className="text-sm">Fecha *</Label>
              <Input id="income-fecha" name="fecha" type="date" required defaultValue={today} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="income-notas" className="text-sm">Notas</Label>
              <Input id="income-notas" name="notas" placeholder="Opcional" />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : null}
              Guardar ingreso
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
