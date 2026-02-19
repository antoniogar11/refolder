"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NativeSelect } from "@/components/ui/native-select";
import { toast } from "sonner";
import { createEstimateWithItemsAction } from "@/app/dashboard/presupuestos/actions";
import { Loader2, Sparkles, Save, UserPlus } from "lucide-react";
import { QuickAddClientDialog } from "@/components/clients/quick-add-client-dialog";
import { linkEstimateToVisitAction } from "@/app/dashboard/visitas/actions";
import { EstimatePreviewEditor, type Partida } from "@/components/estimates/estimate-preview-editor";
import { roundCurrency } from "@/lib/utils";

type NewEstimateFormProps = {
  clients: { id: string; name: string }[];
  prefilledDescription?: string;
  prefilledClientId?: string;
  visitId?: string;
};

export function NewEstimateForm({ clients: initialClients, prefilledDescription, prefilledClientId, visitId }: NewEstimateFormProps) {
  const router = useRouter();
  const [clients, setClients] = useState(initialClients);
  const [clientId, setClientId] = useState(prefilledClientId ?? "");
  const [descripcion, setDescripcion] = useState(prefilledDescription ?? "");
  const [tipoObra, setTipoObra] = useState("");
  const [nombrePresupuesto, setNombrePresupuesto] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [partidas, setPartidas] = useState<Partida[]>([]);
  const [margenGlobal, setMargenGlobal] = useState(20);
  const [showNewClient, setShowNewClient] = useState(false);

  const selectedClientName = clients.find(c => c.id === clientId)?.name;

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
          descripcion: descripcion.trim(),
          tipo_obra: tipoObra || undefined,
          client_name: selectedClientName || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Error al generar el presupuesto.");
        return;
      }

      setPartidas(data.partidas);
      if (data.margen_global) setMargenGlobal(data.margen_global);

      if (!nombrePresupuesto) {
        const tipoLabel = tipoObra ? tipoObra.replace(/_/g, " ") : "Presupuesto";
        setNombrePresupuesto(`${tipoLabel.charAt(0).toUpperCase() + tipoLabel.slice(1)}${selectedClientName ? ` - ${selectedClientName}` : ""}`);
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

    const name = nombrePresupuesto.trim() || "Presupuesto sin nombre";
    setIsSaving(true);

    try {
      const sub = roundCurrency(partidas.reduce((sum, p) => sum + p.subtotal, 0));
      const totalAmount = roundCurrency(sub + roundCurrency(sub * 0.21));
      const result = await createEstimateWithItemsAction(
        null,
        clientId || null,
        name,
        descripcion,
        partidas,
        totalAmount,
        margenGlobal,
      );

      if (result.success && result.estimateId) {
        // Link estimate to visit if coming from a visit
        if (visitId) {
          await linkEstimateToVisitAction(visitId, result.estimateId);
        }
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
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nombre_presupuesto">Nombre del presupuesto</Label>
              <Input
                id="nombre_presupuesto"
                value={nombrePresupuesto}
                onChange={(e) => setNombrePresupuesto(e.target.value)}
                placeholder="Se genera automáticamente"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client_id">Cliente (opcional)</Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <NativeSelect
                    id="client_id"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                  >
                    <option value="">Sin cliente</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </NativeSelect>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  onClick={() => setShowNewClient(true)}
                  title="Nuevo cliente"
                >
                  <UserPlus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo_obra">Tipo de trabajo</Label>
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
            <EstimatePreviewEditor
              partidas={partidas}
              onPartidasChange={setPartidas}
              margenGlobal={margenGlobal}
              onMargenGlobalChange={setMargenGlobal}
            />

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
      <QuickAddClientDialog
        open={showNewClient}
        onOpenChange={setShowNewClient}
        onClientCreated={(newClient) => {
          setClients((prev) => [...prev, newClient]);
          setClientId(newClient.id);
        }}
      />
    </div>
  );
}
