"use client";

import { useState } from "react";
import { toast } from "sonner";
import { updateEstimateStatusAction } from "@/app/dashboard/presupuestos/actions";

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

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value;
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
    <select
      value={status}
      onChange={handleChange}
      className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      {statusOptions.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}
