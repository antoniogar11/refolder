"use client";

import { useState } from "react";
import { toast } from "sonner";
import { updateEstimateStatusAction } from "@/app/dashboard/presupuestos/actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statusOptions = [
  { value: "draft", label: "Borrador" },
  { value: "sent", label: "Enviado" },
  { value: "accepted", label: "Aceptado" },
  { value: "rejected", label: "Rechazado" },
];

type EstimateStatusSelectProps = {
  estimateId: string;
  currentStatus: string;
};

export function EstimateStatusSelect({ estimateId, currentStatus }: EstimateStatusSelectProps) {
  const [status, setStatus] = useState(currentStatus);

  async function handleChange(newStatus: string) {
    setStatus(newStatus);
    const result = await updateEstimateStatusAction(estimateId, newStatus);
    if (result.success) {
      toast.success("Estado actualizado");
    } else {
      toast.error(result.message);
      setStatus(currentStatus);
    }
  }

  return (
    <Select value={status} onValueChange={handleChange}>
      <SelectTrigger className="w-[140px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
