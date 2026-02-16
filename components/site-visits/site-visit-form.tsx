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
import { Loader2, Plus, Save, Sparkles, UserPlus } from "lucide-react";
import { QuickAddClientDialog } from "@/components/clients/quick-add-client-dialog";
import { ZoneCard, type ZoneData } from "./zone-card";
import { ZoneSuggestions } from "./zone-suggestions";
import { createSiteVisitAction, updateSiteVisitAction } from "@/app/dashboard/visitas/actions";
import type { SiteVisit } from "@/types";

type SiteVisitFormProps = {
  clients: { id: string; name: string }[];
  workTypes: string[];
  visit?: SiteVisit | null;
};

function emptyZone(name = ""): ZoneData {
  return { name, largo: "", ancho: "", alto: "", notes: "", works: [] };
}

function today() {
  return new Date().toISOString().split("T")[0];
}

export function SiteVisitForm({ clients: initialClients, workTypes, visit }: SiteVisitFormProps) {
  const router = useRouter();
  const isEditing = !!visit;

  const [clients, setClients] = useState(initialClients);
  const [clientId, setClientId] = useState(visit?.client_id ?? "");
  const [address, setAddress] = useState(visit?.address ?? "");
  const [visitDate, setVisitDate] = useState(visit?.visit_date ?? today());
  const [generalNotes, setGeneralNotes] = useState(visit?.general_notes ?? "");
  const [zones, setZones] = useState<ZoneData[]>(
    visit?.zones?.map((z) => ({
      name: z.name,
      largo: z.largo?.toString() ?? "",
      ancho: z.ancho?.toString() ?? "",
      alto: z.alto?.toString() ?? "",
      notes: z.notes ?? "",
      works: z.works?.map((w) => ({ work_type: w.work_type, notes: w.notes ?? "" })) ?? [],
    })) ?? [],
  );
  const [saving, setSaving] = useState(false);
  const [savingAndGenerate, setSavingAndGenerate] = useState(false);
  const [showNewClient, setShowNewClient] = useState(false);

  function addZone(name = "") {
    setZones((prev) => [...prev, emptyZone(name)]);
  }

  function updateZone(index: number, zone: ZoneData) {
    setZones((prev) => prev.map((z, i) => (i === index ? zone : z)));
  }

  function removeZone(index: number) {
    setZones((prev) => prev.filter((_, i) => i !== index));
  }

  function buildPayload() {
    return {
      client_id: clientId || null,
      address,
      visit_date: visitDate,
      general_notes: generalNotes || null,
      zones: zones
        .filter((z) => z.name.trim())
        .map((z) => ({
          name: z.name,
          largo: z.largo ? parseFloat(z.largo) : null,
          ancho: z.ancho ? parseFloat(z.ancho) : null,
          alto: z.alto ? parseFloat(z.alto) : null,
          notes: z.notes || null,
          works: z.works,
        })),
    };
  }

  async function handleSave(andGenerate = false) {
    if (!address.trim()) {
      toast.error("La direccion es obligatoria.");
      return;
    }

    if (andGenerate) {
      setSavingAndGenerate(true);
    } else {
      setSaving(true);
    }

    try {
      const payload = buildPayload();

      if (isEditing && visit) {
        const result = await updateSiteVisitAction(visit.id, payload);
        if (result.success) {
          toast.success(result.message);
          if (andGenerate) {
            router.push(`/dashboard/presupuestos/nuevo?visitId=${visit.id}`);
          } else {
            router.push(`/dashboard/visitas/${visit.id}`);
          }
        } else {
          toast.error(result.message);
        }
      } else {
        const result = await createSiteVisitAction(payload);
        if (result.success && result.visitId) {
          toast.success(result.message);
          if (andGenerate) {
            router.push(`/dashboard/presupuestos/nuevo?visitId=${result.visitId}`);
          } else {
            router.push(`/dashboard/visitas/${result.visitId}`);
          }
        } else {
          toast.error(result.message);
        }
      }
    } catch {
      toast.error("Error al guardar la visita.");
    } finally {
      setSaving(false);
      setSavingAndGenerate(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <Card>
        <CardHeader>
          <CardTitle>Datos de la visita</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sv-client">Cliente (opcional)</Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <NativeSelect
                    id="sv-client"
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
            <div className="space-y-2">
              <Label htmlFor="sv-date">Fecha de la visita</Label>
              <Input
                id="sv-date"
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sv-address">Direccion de la obra *</Label>
            <Input
              id="sv-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Calle, numero, piso"
            />
          </div>
        </CardContent>
      </Card>

      {/* Zonas */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Zonas ({zones.length})</h3>
          <Button type="button" onClick={() => addZone()} size="sm">
            <Plus className="mr-1 h-4 w-4" />
            Anadir zona
          </Button>
        </div>

        <ZoneSuggestions
          onSelect={(name) => addZone(name)}
          existingNames={zones.map((z) => z.name)}
        />

        {zones.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-sm text-slate-500">
              Anade zonas para registrar medidas y trabajos necesarios
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

      {/* Observaciones generales */}
      <Card>
        <CardHeader>
          <CardTitle>Observaciones generales</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={generalNotes}
            onChange={(e) => setGeneralNotes(e.target.value)}
            placeholder="Estado de la instalacion electrica, acceso para material, necesidad de licencias, etc."
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Acciones */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          onClick={() => handleSave(false)}
          disabled={saving || savingAndGenerate}
          className="flex-1"
          size="lg"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Guardar visita
            </>
          )}
        </Button>
        <Button
          onClick={() => handleSave(true)}
          disabled={saving || savingAndGenerate}
          variant="outline"
          className="flex-1 border-amber-300 text-amber-700 hover:bg-amber-50"
          size="lg"
        >
          {savingAndGenerate ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Guardar y generar presupuesto
            </>
          )}
        </Button>
      </div>

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
