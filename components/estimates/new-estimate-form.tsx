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
import { Loader2, Sparkles, Save, UserPlus, ChevronDown, Send, Zap, List } from "lucide-react";
import { QuickAddClientDialog } from "@/components/clients/quick-add-client-dialog";
import { EstimatePreviewEditor, type Partida } from "@/components/estimates/estimate-preview-editor";
import { ZoneCard, type ZoneData } from "@/components/shared/zones/zone-card";
import { ZoneSuggestions } from "@/components/shared/zones/zone-suggestions";
import { buildDescriptionFromZones } from "@/lib/utils/build-description";
import { cn } from "@/lib/utils";
import { computeEstimateTotals } from "@/lib/utils/estimate-totals";
import { QuickEstimateForm } from "@/components/estimates/quick-estimate-form";

type EstimateMode = "quick" | "detailed";

type NewEstimateFormProps = {
  clients: { id: string; name: string }[];
  workTypes: string[];
};

function emptyZone(name = ""): ZoneData {
  return { name, largo: "", ancho: "", alto: "", notes: "", works: [], photos: [] };
}

export function NewEstimateForm({ clients: initialClients, workTypes }: NewEstimateFormProps) {
  const [mode, setMode] = useState<EstimateMode>("quick");

  return (
    <div className="space-y-6">
      {/* Toggle de modo */}
      <div className="flex rounded-lg border bg-slate-100 p-1 dark:bg-slate-800">
        <button
          type="button"
          onClick={() => setMode("quick")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            mode === "quick"
              ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300",
          )}
        >
          <Zap className="h-4 w-4" />
          Rápido
        </button>
        <button
          type="button"
          onClick={() => setMode("detailed")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            mode === "detailed"
              ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300",
          )}
        >
          <List className="h-4 w-4" />
          Detallado
        </button>
      </div>

      {mode === "quick" ? (
        <QuickEstimateForm clients={initialClients} />
      ) : (
        <DetailedEstimateForm clients={initialClients} workTypes={workTypes} />
      )}
    </div>
  );
}

function DetailedEstimateForm({ clients: initialClients, workTypes }: NewEstimateFormProps) {
  const router = useRouter();
  const [clients, setClients] = useState(initialClients);
  const [clientId, setClientId] = useState("");
  const [nombrePresupuesto, setNombrePresupuesto] = useState("");
  const [address, setAddress] = useState("");
  const [generalNotes, setGeneralNotes] = useState("");
  const [zones, setZones] = useState<ZoneData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [partidas, setPartidas] = useState<Partida[]>([]);
  const [margenGlobal, setMargenGlobal] = useState(20);
  const [showNewClient, setShowNewClient] = useState(false);
  const [showDatos, setShowDatos] = useState(false);
  const [showObservaciones, setShowObservaciones] = useState(false);
  const [aiInstruction, setAiInstruction] = useState("");
  const [isModifying, setIsModifying] = useState(false);

  const selectedClientName = clients.find((c) => c.id === clientId)?.name;

  function addZone(name = "") {
    setZones((prev) => [...prev, emptyZone(name)]);
  }

  function updateZone(index: number, zone: ZoneData) {
    setZones((prev) => prev.map((z, i) => (i === index ? zone : z)));
  }

  function removeZone(index: number) {
    setZones((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleGenerate() {
    if (zones.filter((z) => z.name.trim()).length === 0) {
      toast.error("Añade al menos una zona.");
      return;
    }

    setIsGenerating(true);
    setPartidas([]);

    try {
      const descripcion = buildDescriptionFromZones(address, zones, generalNotes);

      // Recoger fotos de todas las zonas con su nombre de zona
      const photos = zones.flatMap((z) =>
        (z.photos ?? []).map((p) => ({
          base64: p.base64,
          mimeType: p.mimeType,
          zoneName: z.name,
        })),
      );

      const response = await fetch("/api/generate-estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          descripcion,
          client_name: selectedClientName || undefined,
          photos: photos.length > 0 ? photos : undefined,
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
        setNombrePresupuesto(
          `Presupuesto${selectedClientName ? ` - ${selectedClientName}` : ""} - ${address}`,
        );
      }

      toast.success(`Se generaron ${data.partidas.length} partidas.`);
    } catch {
      toast.error("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleModify() {
    if (!aiInstruction.trim()) return;

    setIsModifying(true);
    try {
      const response = await fetch("/api/modify-estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partidas,
          instruccion: aiInstruction,
          margen_global: margenGlobal,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Error al modificar el presupuesto.");
        return;
      }

      setPartidas(data.partidas);
      if (data.margen_global) setMargenGlobal(data.margen_global);
      setAiInstruction("");
      toast.success("Presupuesto modificado.");
    } catch {
      toast.error("Error de conexión.");
    } finally {
      setIsModifying(false);
    }
  }

  async function handleSave() {
    if (partidas.length === 0) {
      toast.error("Primero genera las partidas con IA.");
      return;
    }

    const name = nombrePresupuesto.trim() || "Presupuesto sin nombre";
    const descripcion = buildDescriptionFromZones(address, zones, generalNotes);
    setIsSaving(true);

    try {
      const { total: totalAmount } = computeEstimateTotals(partidas);
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
        toast.success(result.message);
        router.push(`/dashboard/presupuestos/${result.estimateId}`);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Error al guardar el presupuesto.");
    } finally {
      setIsSaving(false);
    }
  }

  const hasZonesWithNames = zones.filter((z) => z.name.trim()).length > 0;

  return (
    <div className="space-y-6">
      {/* Datos del presupuesto (colapsable) */}
      <Card>
        <CardHeader className="cursor-pointer" onClick={() => setShowDatos(!showDatos)}>
          <div className="flex items-center justify-between">
            <CardTitle>Datos del presupuesto</CardTitle>
            <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${showDatos ? "rotate-180" : ""}`} />
          </div>
          {!showDatos && (
            <p className="text-sm text-slate-500 mt-1">Nombre, cliente, dirección (opcional)</p>
          )}
        </CardHeader>
        {showDatos && (
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
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
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </NativeSelect>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    onClick={(e) => { e.stopPropagation(); setShowNewClient(true); }}
                    title="Nuevo cliente"
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Dirección de la obra</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Calle, número, piso"
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Zonas */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Zonas ({zones.length})</h3>
          <ZoneSuggestions
            onSelect={(name) => addZone(name)}
            existingNames={zones.map((z) => z.name)}
          />
        </div>

        {zones.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-sm text-slate-500">
              Añade zonas para registrar medidas y trabajos necesarios
            </CardContent>
          </Card>
        )}

        {zones.map((zone, i) => (
          <ZoneCard
            key={i}
            zone={zone}
            index={i}
            workTypes={workTypes}
            onChange={(z) => updateZone(i, z)}
            onRemove={() => removeZone(i)}
          />
        ))}
      </div>

      {/* Observaciones generales (colapsable) */}
      <Card>
        <CardHeader className="cursor-pointer" onClick={() => setShowObservaciones(!showObservaciones)}>
          <div className="flex items-center justify-between">
            <CardTitle>Observaciones generales</CardTitle>
            <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${showObservaciones ? "rotate-180" : ""}`} />
          </div>
          {!showObservaciones && (
            <p className="text-sm text-slate-500 mt-1">Instalaciones, accesos, licencias... (opcional)</p>
          )}
        </CardHeader>
        {showObservaciones && (
          <CardContent>
            <Textarea
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
              placeholder="Estado de la instalación eléctrica, acceso para material, necesidad de licencias, etc."
              rows={3}
            />
          </CardContent>
        )}
      </Card>

      {/* Generar con IA — sticky en móvil */}
      <div className="sticky bottom-4 z-40">
      <Button
        onClick={handleGenerate}
        disabled={isGenerating || !hasZonesWithNames}
        className="w-full bg-amber-500 hover:bg-amber-600 text-white shadow-lg"
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
      </div>

      {/* Vista previa */}
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

            {/* Modificar con IA */}
            <div className="mt-6 space-y-3">
              <Label className="text-sm font-medium">Modificar con IA</Label>
              <form
                onSubmit={(e) => { e.preventDefault(); handleModify(); }}
                className="flex gap-2"
              >
                <Input
                  value={aiInstruction}
                  onChange={(e) => setAiInstruction(e.target.value)}
                  placeholder="Ej: quita la pintura, añade aire acondicionado, sube precios un 10%..."
                  disabled={isModifying}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={isModifying || !aiInstruction.trim()}
                  size="icon"
                  className="shrink-0"
                >
                  {isModifying ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex-1"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Regenerando...
                  </>
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
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Guardar Presupuesto
                  </>
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
