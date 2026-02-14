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

type AddCostFormProps = {
  projectId: string;
};

export function AddCostForm({ projectId }: AddCostFormProps) {
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
      toast.error("Error al guardar el gasto.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} variant="outline" size="sm">
        <Plus className="mr-2 h-4 w-4" />
        Añadir gasto
      </Button>
    );
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <Card className="border-amber-200 bg-amber-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Nuevo gasto</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="descripcion" className="text-sm">Descripción *</Label>
              <Input id="descripcion" name="descripcion" required placeholder="Ej. Azulejos baño principal" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="categoria" className="text-sm">Categoría *</Label>
              <NativeSelect id="categoria" name="categoria" required defaultValue="material">
                <option value="material">Material</option>
                <option value="mano_de_obra">Mano de obra</option>
                <option value="subcontrata">Subcontrata</option>
                <option value="transporte">Transporte</option>
                <option value="otros">Otros</option>
              </NativeSelect>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-1">
              <Label htmlFor="importe" className="text-sm">Importe (EUR) *</Label>
              <Input id="importe" name="importe" type="number" step="0.01" required placeholder="0.00" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="fecha" className="text-sm">Fecha *</Label>
              <Input id="fecha" name="fecha" type="date" required defaultValue={today} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="notas" className="text-sm">Notas</Label>
              <Input id="notas" name="notas" placeholder="Opcional" />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : null}
              Guardar gasto
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
