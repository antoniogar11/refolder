"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Nuevo Cliente
          </DialogTitle>
          <DialogDescription>
            Rellena los datos del cliente. Solo el nombre es obligatorio.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="qc-name">Nombre *</Label>
            <Input
              id="qc-name"
              name="name"
              required
              placeholder="Ej. Juan Pérez"
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
              <Label htmlFor="qc-phone">Teléfono</Label>
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

          <div className="space-y-2">
            <Label htmlFor="qc-address">Dirección</Label>
            <Input
              id="qc-address"
              name="address"
              type="text"
              placeholder="Calle y número"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="qc-postal_code">Código Postal</Label>
              <Input
                id="qc-postal_code"
                name="postal_code"
                type="text"
                placeholder="28001"
                maxLength={5}
              />
              {errors.postal_code && (
                <p className="text-sm text-red-600">{errors.postal_code}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="qc-city">Población</Label>
              <Input
                id="qc-city"
                name="city"
                type="text"
                placeholder="Madrid"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qc-province">Provincia</Label>
              <Input
                id="qc-province"
                name="province"
                type="text"
                placeholder="Madrid"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="qc-tax_id">CIF / NIF</Label>
            <Input
              id="qc-tax_id"
              name="tax_id"
              type="text"
              placeholder="12345678A o B12345678"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="qc-notes">Notas</Label>
            <Textarea
              id="qc-notes"
              name="notes"
              placeholder="Información adicional"
            />
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
                "Guardar Cliente"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
