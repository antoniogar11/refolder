"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type WorkTypeCheckboxProps = {
  workType: string;
  checked: boolean;
  notes: string;
  onToggle: (checked: boolean) => void;
  onNotesChange: (notes: string) => void;
};

export function WorkTypeCheckbox({
  workType,
  checked,
  notes,
  onToggle,
  onNotesChange,
}: WorkTypeCheckboxProps) {
  return (
    <div>
      <label
        className={cn(
          "flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors",
          checked
            ? "border-amber-300 bg-amber-50/50 dark:border-amber-700 dark:bg-amber-950/20"
            : "hover:bg-slate-50 dark:hover:bg-slate-800/50",
        )}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onToggle(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
        />
        <span className="text-sm font-medium">{workType}</span>
      </label>
      {checked && (
        <div className="mt-2 ml-7">
          <Input
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Notas (ej: quiere plato de ducha donde la banera)"
            className="text-sm"
          />
        </div>
      )}
    </div>
  );
}
