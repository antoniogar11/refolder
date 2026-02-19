"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { createTaskAction } from "@/app/dashboard/proyectos/task-actions";
import { Plus, Loader2 } from "lucide-react";

type AddTaskFormProps = {
  projectId: string;
};

export function AddTaskForm({ projectId }: AddTaskFormProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      nombre: formData.get("nombre") as string,
      descripcion: formData.get("descripcion") as string,
    };

    try {
      const result = await createTaskAction(projectId, data);
      if (result.success) {
        toast.success(result.message);
        setOpen(false);
        (e.target as HTMLFormElement).reset();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Error al crear la tarea.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} variant="outline" size="sm">
        <Plus className="mr-2 h-4 w-4" />
        Añadir tarea
      </Button>
    );
  }

  return (
    <Card className="border-amber-200 bg-amber-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Nueva tarea</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="task-nombre" className="text-sm">Nombre *</Label>
              <Input id="task-nombre" name="nombre" required placeholder="Ej. Demolición baño" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="task-descripcion" className="text-sm">Descripción</Label>
              <Input id="task-descripcion" name="descripcion" placeholder="Opcional" />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : null}
              Crear tarea
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
