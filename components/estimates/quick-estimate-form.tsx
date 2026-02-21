"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NativeSelect } from "@/components/ui/native-select";
import { toast } from "sonner";
import { createEstimateWithItemsAction } from "@/app/dashboard/presupuestos/actions";
import { Loader2, Sparkles, Save, UserPlus, Camera, X, Send } from "lucide-react";
import { QuickAddClientDialog } from "@/components/clients/quick-add-client-dialog";
import { EstimatePreviewEditor, type Partida } from "@/components/estimates/estimate-preview-editor";
import { compressImage, validateImage } from "@/lib/utils/compress-image";
import { computeEstimateTotals } from "@/lib/utils/estimate-totals";

type QuickEstimateFormProps = {
  clients: { id: string; name: string }[];
};

type Photo = {
  base64: string;
  mimeType: string;
};

const MAX_PHOTOS = 5;

export function QuickEstimateForm({ clients: initialClients }: QuickEstimateFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [clients, setClients] = useState(initialClients);
  const [clientId, setClientId] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [partidas, setPartidas] = useState<Partida[]>([]);
  const [margenGlobal, setMargenGlobal] = useState(20);
  const [showNewClient, setShowNewClient] = useState(false);
  const [aiInstruction, setAiInstruction] = useState("");
  const [isModifying, setIsModifying] = useState(false);

  const selectedClientName = clients.find((c) => c.id === clientId)?.name;

  async function handlePhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) {
      toast.error(`Máximo ${MAX_PHOTOS} fotos.`);
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remaining);

    for (const file of filesToProcess) {
      const validationError = validateImage(file);
      if (validationError) {
        toast.error(validationError);
        continue;
      }
      try {
        const photo = await compressImage(file);
        setPhotos((prev) => [...prev, photo]);
      } catch {
        toast.error(`No se pudo procesar "${file.name}".`);
      }
    }

    e.target.value = "";
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleGenerate() {
    if (!descripcion.trim()) {
      toast.error("Describe el trabajo a presupuestar.");
      return;
    }

    setIsGenerating(true);
    setPartidas([]);

    try {
      const photoPayload = photos.map((p) => ({
        base64: p.base64,
        mimeType: p.mimeType,
        zoneName: "General",
      }));

      const response = await fetch("/api/generate-estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          descripcion: descripcion.trim(),
          client_name: selectedClientName || undefined,
          photos: photoPayload.length > 0 ? photoPayload : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Error al generar el presupuesto.");
        return;
      }

      setPartidas(data.partidas);
      if (data.margen_global) setMargenGlobal(data.margen_global);
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

    const name = selectedClientName
      ? `Presupuesto - ${selectedClientName}`
      : "Presupuesto sin nombre";

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Describe el trabajo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Cliente */}
          <div className="space-y-2">
            <Label htmlFor="quick_client">Cliente (opcional)</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <NativeSelect
                  id="quick_client"
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
                onClick={() => setShowNewClient(true)}
                title="Nuevo cliente"
              >
                <UserPlus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="quick_descripcion">Descripción del trabajo</Label>
            <Textarea
              id="quick_descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej: Reforma integral baño 3x2m. Quitar bañera y poner plato de ducha. Alicatar paredes y suelo. Cambiar sanitarios y grifería. Instalar mampara."
              rows={5}
              className="resize-none"
            />
          </div>

          {/* Fotos */}
          <div className="space-y-2">
            <Label>Fotos (opcional)</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handlePhotos}
            />
            {photos.length > 0 && (
              <div className="flex gap-3 flex-wrap">
                {photos.map((photo, i) => (
                  <div key={i} className="relative">
                    <img
                      src={`data:${photo.mimeType};base64,${photo.base64}`}
                      alt={`Foto ${i + 1}`}
                      className="h-24 w-24 sm:h-20 sm:w-20 rounded-md object-cover border"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {photos.length < MAX_PHOTOS && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="mr-2 h-4 w-4" />
                Añadir foto ({photos.length}/{MAX_PHOTOS})
              </Button>
            )}
            <p className="text-xs text-slate-500">
              La IA analizará las fotos para generar un presupuesto más preciso.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Generar con IA — sticky en móvil */}
      <div className="sticky bottom-4 z-40">
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !descripcion.trim()}
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
