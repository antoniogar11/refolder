"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { NativeSelect } from "@/components/ui/native-select";
import { toast } from "sonner";
import { createEstimateWithItemsAction } from "@/app/dashboard/presupuestos/actions";
import { Loader2, Sparkles, Save } from "lucide-react";

type Partida = {
  categoria: string;
  descripcion: string;
  unidad: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  orden: number;
};

type GenerateEstimateFormProps = {
  projectId: string;
  projectName: string;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(amount);
}

export function GenerateEstimateForm({ projectId, projectName }: GenerateEstimateFormProps) {
  const router = useRouter();
  const [descripcion, setDescripcion] = useState("");
  const [tipoObra, setTipoObra] = useState("");
  const [nombrePresupuesto, setNombrePresupuesto] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [partidas, setPartidas] = useState<Partida[]>([]);
  const [totals, setTotals] = useState({ subtotal: 0, iva: 0, total: 0 });

  async function handleGenerate() {
    if (!descripcion.trim()) {
      toast.error("Describe el trabajo a presupuestar.");
      return;
    }

    setIsGenerating(true);
    setPartidas([]);

    try {
      const response = await fetch("/api/generate-estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          descripcion: descripcion.trim(),
          tipo_obra: tipoObra || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Error al generar el presupuesto.");
        return;
      }

      setPartidas(data.partidas);
      setTotals({ subtotal: data.subtotal, iva: data.iva, total: data.total });

      if (!nombrePresupuesto) {
        setNombrePresupuesto(`Presupuesto - ${projectName}`);
      }

      toast.success(`Se generaron ${data.partidas.length} partidas.`);
    } catch (error) {
      console.error("Generate error:", error);
      toast.error("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleSave() {
    if (partidas.length === 0) {
      toast.error("Primero genera las partidas con IA.");
      return;
    }

    const name = nombrePresupuesto.trim() || `Presupuesto - ${projectName}`;
    setIsSaving(true);

    try {
      const result = await createEstimateWithItemsAction(
        projectId,
        null,
        name,
        descripcion,
        partidas,
        totals.total,
      );

      if (result.success && result.estimateId) {
        toast.success(result.message);
        router.push(`/dashboard/presupuestos/${result.estimateId}`);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Error al guardar el presupuesto. Revisa la consola para más detalles.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Generar Presupuesto con IA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre_presupuesto">Nombre del presupuesto</Label>
            <Input
              id="nombre_presupuesto"
              value={nombrePresupuesto}
              onChange={(e) => setNombrePresupuesto(e.target.value)}
              placeholder={`Presupuesto - ${projectName}`}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo_obra">Tipo de obra (opcional)</Label>
            <NativeSelect
              id="tipo_obra"
              value={tipoObra}
              onChange={(e) => setTipoObra(e.target.value)}
            >
              <option value="">Sin especificar</option>
              <option value="reforma_integral">Reforma integral</option>
              <option value="reforma_bano">Reforma de baño</option>
              <option value="reforma_cocina">Reforma de cocina</option>
              <option value="pintura">Pintura</option>
              <option value="fontaneria">Fontanería</option>
              <option value="electricidad">Electricidad</option>
              <option value="albanileria">Albañilería</option>
              <option value="carpinteria">Carpintería</option>
              <option value="obra_nueva">Obra nueva</option>
              <option value="otro">Otro</option>
            </NativeSelect>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción del trabajo *</Label>
            <Textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describe detalladamente el trabajo a realizar. Ejemplo: Reforma completa de baño de 6m², cambio de plato de ducha, alicatado completo, instalación de mueble de baño y espejo, nueva grifería..."
              rows={5}
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !descripcion.trim()}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando presupuesto... (puede tardar 15-20s)
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generar con IA
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {partidas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Vista previa del presupuesto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="text-right">Ud.</TableHead>
                    <TableHead className="text-right">Cant.</TableHead>
                    <TableHead className="text-right">P. Unit.</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partidas.map((p, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium text-xs">{p.categoria}</TableCell>
                      <TableCell className="text-sm">{p.descripcion}</TableCell>
                      <TableCell className="text-right text-xs">{p.unidad}</TableCell>
                      <TableCell className="text-right">{p.cantidad}</TableCell>
                      <TableCell className="text-right">{formatCurrency(p.precio_unitario)}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(p.subtotal)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 space-y-2 text-right">
              <div className="text-sm text-slate-600">
                Subtotal: <span className="font-medium text-slate-900">{formatCurrency(totals.subtotal)}</span>
              </div>
              <div className="text-sm text-slate-600">
                IVA (21%): <span className="font-medium text-slate-900">{formatCurrency(totals.iva)}</span>
              </div>
              <div className="text-lg font-bold text-slate-900">
                Total: {formatCurrency(totals.total)}
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex-1"
              >
                {isGenerating ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Regenerando...</>
                ) : (
                  "Regenerar con IA"
                )}
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1"
                size="lg"
              >
                {isSaving ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</>
                ) : (
                  <><Save className="mr-2 h-4 w-4" /> Guardar Presupuesto</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
