"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";

type QuickAddClientDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClientCreated: (client: { id: string; name: string }) => void;
};

export function QuickAddClientDialog({
  open,
  onOpenChange,
  onClientCreated,
}: QuickAddClientDialogProps) {
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const body: Record<string, string> = {};
    formData.forEach((value, key) => {
      body[key] = typeof value === "string" ? value.trim() : "";
    });

    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.fieldErrors) {
          setErrors(data.fieldErrors);
        }
        toast.error(data.error || "Error al crear el cliente.");
        return;
      }

      toast.success(`Cliente "${data.name}" creado.`);
      onClientCreated({ id: data.id, name: data.name });
      onOpenChange(false);
    } catch {
      toast.error("Error de conexion.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Nuevo Cliente
          </DialogTitle>
          <DialogDescription>
            Crea un cliente rapido. Podras completar sus datos despues.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="qc-name">Nombre *</Label>
            <Input
              id="qc-name"
              name="name"
              required
              placeholder="Ej. Juan Perez"
              autoFocus
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="qc-email">Email</Label>
              <Input
                id="qc-email"
                name="email"
                type="email"
                placeholder="juan@ejemplo.com"
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="qc-phone">Telefono</Label>
              <Input
                id="qc-phone"
                name="phone"
                type="text"
                placeholder="+34 600 000 000"
              />
              {errors.phone && (
                <p className="text-sm text-red-600">{errors.phone}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Crear Cliente"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
