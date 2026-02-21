"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Trash2, Camera, X } from "lucide-react";
import { WorkTypeCheckbox } from "./work-type-checkbox";
import { toast } from "sonner";
import { compressImage, validateImage } from "@/lib/utils/compress-image";

export type ZonePhoto = {
  base64: string;
  mimeType: string;
};

export type ZoneWork = {
  work_type: string;
  notes: string;
};

export type ZoneData = {
  name: string;
  largo: string;
  ancho: string;
  alto: string;
  notes: string;
  works: ZoneWork[];
  photos: ZonePhoto[];
};

type ZoneCardProps = {
  zone: ZoneData;
  index: number;
  workTypes: string[];
  onChange: (zone: ZoneData) => void;
  onRemove: () => void;
};

const MAX_PHOTOS = 3;

export function ZoneCard({ zone, index, workTypes, onChange, onRemove }: ZoneCardProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [showAllWorks, setShowAllWorks] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeWorksCount = zone.works.length;
  const dimensions = [zone.largo, zone.ancho, zone.alto].filter(Boolean).join("x");
  const summary = [
    activeWorksCount > 0 ? `${activeWorksCount} trabajos` : null,
    dimensions ? `${dimensions}m` : null,
  ]
    .filter(Boolean)
    .join(", ");

  function toggleWork(workType: string, checked: boolean) {
    if (checked) {
      onChange({
        ...zone,
        works: [...zone.works, { work_type: workType, notes: "" }],
      });
    } else {
      onChange({
        ...zone,
        works: zone.works.filter((w) => w.work_type !== workType),
      });
    }
  }

  function updateWorkNotes(workType: string, notes: string) {
    onChange({
      ...zone,
      works: zone.works.map((w) =>
        w.work_type === workType ? { ...w, notes } : w,
      ),
    });
  }

  async function handlePhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    const currentCount = zone.photos?.length ?? 0;
    const remaining = MAX_PHOTOS - currentCount;

    if (remaining <= 0) {
      toast.error(`Máximo ${MAX_PHOTOS} fotos por zona.`);
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
        onChange({
          ...zone,
          photos: [...(zone.photos ?? []), photo],
        });
      } catch {
        toast.error(`No se pudo procesar "${file.name}".`);
      }
    }

    // Reset input so the same file can be re-selected
    e.target.value = "";
  }

  function removePhoto(photoIndex: number) {
    onChange({
      ...zone,
      photos: (zone.photos ?? []).filter((_, i) => i !== photoIndex),
    });
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="flex items-center gap-2 text-left flex-1"
            onClick={() => setCollapsed(!collapsed)}
          >
            <CardTitle className="text-base">
              {zone.name || `Zona ${index + 1}`}
            </CardTitle>
            {collapsed && summary && (
              <span className="text-xs text-slate-500 font-normal">
                — {summary}
              </span>
            )}
            {collapsed ? (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            ) : (
              <ChevronUp className="h-4 w-4 text-slate-400" />
            )}
          </button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {!collapsed && (
        <CardContent className="space-y-4">
          {/* Nombre de zona */}
          <div className="space-y-2">
            <Label>Nombre de la zona</Label>
            <Input
              value={zone.name}
              onChange={(e) => onChange({ ...zone, name: e.target.value })}
              placeholder="Ej: Baño principal"
            />
          </div>

          {/* Medidas */}
          <div>
            <Label>Medidas (metros)</Label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              <Input
                type="number"
                step="0.01"
                value={zone.largo}
                onChange={(e) => onChange({ ...zone, largo: e.target.value })}
                placeholder="Largo"
              />
              <Input
                type="number"
                step="0.01"
                value={zone.ancho}
                onChange={(e) => onChange({ ...zone, ancho: e.target.value })}
                placeholder="Ancho"
              />
              <Input
                type="number"
                step="0.01"
                value={zone.alto}
                onChange={(e) => onChange({ ...zone, alto: e.target.value })}
                placeholder="Alto"
              />
            </div>
          </div>

          {/* Trabajos */}
          <div className="space-y-2">
            <Label>Trabajos necesarios</Label>

            {/* Trabajos seleccionados siempre visibles */}
            {zone.works.length > 0 && (
              <div className="grid gap-2 sm:grid-cols-2">
                {zone.works.map((w) => (
                  <WorkTypeCheckbox
                    key={w.work_type}
                    workType={w.work_type}
                    checked
                    notes={w.notes}
                    onToggle={() => toggleWork(w.work_type, false)}
                    onNotesChange={(notes) => updateWorkNotes(w.work_type, notes)}
                  />
                ))}
              </div>
            )}

            {/* Botón para mostrar/ocultar todos los trabajos */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setShowAllWorks(!showAllWorks)}
            >
              {showAllWorks ? "Ocultar lista" : `Añadir trabajos (${workTypes.length} disponibles)`}
            </Button>

            {/* Lista completa de no seleccionados */}
            {showAllWorks && (
              <div className="grid gap-2 sm:grid-cols-2">
                {workTypes
                  .filter((wt) => !zone.works.some((w) => w.work_type === wt))
                  .map((wt) => (
                    <WorkTypeCheckbox
                      key={wt}
                      workType={wt}
                      checked={false}
                      notes=""
                      onToggle={(checked) => toggleWork(wt, checked)}
                      onNotesChange={() => {}}
                    />
                  ))}
              </div>
            )}
          </div>

          {/* Fotos */}
          <div className="space-y-2">
            <Label>Fotos de la zona</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handlePhotos}
            />
            {(zone.photos?.length ?? 0) > 0 && (
              <div className="flex gap-3 flex-wrap">
                {zone.photos.map((photo, i) => (
                  <div key={i} className="relative">
                    <img
                      src={`data:${photo.mimeType};base64,${photo.base64}`}
                      alt={`Foto ${i + 1} de ${zone.name}`}
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
            {(zone.photos?.length ?? 0) < MAX_PHOTOS && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="mr-2 h-4 w-4" />
                Añadir foto ({zone.photos?.length ?? 0}/{MAX_PHOTOS})
              </Button>
            )}
            <p className="text-xs text-slate-500">
              La IA analizará las fotos para generar un presupuesto más preciso.
            </p>
          </div>

          {/* Notas de zona */}
          <div className="space-y-2">
            <Label>Notas de la zona</Label>
            <Textarea
              value={zone.notes}
              onChange={(e) => onChange({ ...zone, notes: e.target.value })}
              placeholder="Observaciones de esta zona"
              rows={2}
            />
          </div>
        </CardContent>
      )}
    </Card>
  );
}
