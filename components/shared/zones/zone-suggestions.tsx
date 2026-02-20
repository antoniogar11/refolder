"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

const SUGGESTED_ZONES = [
  "Baño",
  "Cocina",
  "Salón",
  "Dormitorio",
  "Pasillo",
  "Terraza",
];

type ZoneSuggestionsProps = {
  onSelect: (name: string) => void;
  existingNames: string[];
};

function getNextName(baseName: string, existingNames: string[]) {
  const lower = existingNames.map((n) => n.toLowerCase());
  if (!lower.includes(baseName.toLowerCase())) return baseName;
  let i = 2;
  while (lower.includes(`${baseName} ${i}`.toLowerCase())) i++;
  return `${baseName} ${i}`;
}

export function ZoneSuggestions({ onSelect, existingNames }: ZoneSuggestionsProps) {
  const [open, setOpen] = useState(false);
  const [customName, setCustomName] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function handleSelect(baseName: string) {
    const name = getNextName(baseName, existingNames);
    onSelect(name);
    setOpen(false);
  }

  function handleCustom() {
    const trimmed = customName.trim();
    if (!trimmed) return;
    const name = getNextName(trimmed, existingNames);
    onSelect(name);
    setCustomName("");
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <Button type="button" onClick={() => setOpen(!open)} size="sm">
        <Plus className="mr-1 h-4 w-4" />
        Añadir zona
      </Button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 w-56 rounded-md border bg-white p-2 shadow-md space-y-1">
          {SUGGESTED_ZONES.map((name) => (
            <button
              key={name}
              type="button"
              className="w-full text-left px-3 py-2 text-sm rounded hover:bg-slate-100 transition-colors"
              onClick={() => handleSelect(name)}
            >
              {name}
            </button>
          ))}
          <div className="border-t pt-2 mt-1">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCustom();
              }}
              className="flex gap-1"
            >
              <Input
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Otra zona..."
                className="h-8 text-sm"
              />
              <Button type="submit" size="sm" variant="outline" className="h-8 shrink-0">
                <Plus className="h-3 w-3" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
