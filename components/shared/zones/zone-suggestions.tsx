"use client";

import { Button } from "@/components/ui/button";

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

export function ZoneSuggestions({ onSelect, existingNames }: ZoneSuggestionsProps) {
  const available = SUGGESTED_ZONES.filter(
    (z) => !existingNames.some((n) => n.toLowerCase() === z.toLowerCase()),
  );

  if (available.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {available.map((name) => (
        <Button
          key={name}
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onSelect(name)}
          className="text-xs"
        >
          + {name}
        </Button>
      ))}
    </div>
  );
}
