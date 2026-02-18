"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Trash2, Camera } from "lucide-react";
import { WorkTypeCheckbox } from "./work-type-checkbox";
import { toast } from "sonner";

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
};

type ZoneCardProps = {
  zone: ZoneData;
  index: number;
  workTypes: string[];
  onChange: (zone: ZoneData) => void;
  onRemove: () => void;
};

export function ZoneCard({ zone, index, workTypes, onChange, onRemove }: ZoneCardProps) {
  const [collapsed, setCollapsed] = useState(false);

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
            <div className="grid gap-2 sm:grid-cols-2">
              {workTypes.map((wt) => {
                const existing = zone.works.find((w) => w.work_type === wt);
                return (
                  <WorkTypeCheckbox
                    key={wt}
                    workType={wt}
                    checked={!!existing}
                    notes={existing?.notes ?? ""}
                    onToggle={(checked) => toggleWork(wt, checked)}
                    onNotesChange={(notes) => updateWorkNotes(wt, notes)}
                  />
                );
              })}
            </div>
          </div>

          {/* Fotos - placeholder */}
          <div className="space-y-2">
            <Label>Fotos</Label>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => toast.info("Fotos disponible próximamente.")}
            >
              <Camera className="mr-2 h-4 w-4" />
              Añadir foto
            </Button>
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
