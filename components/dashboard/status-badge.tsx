import { Badge } from "@/components/ui/badge";

const projectStatusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  planning: { label: "Planificación", variant: "secondary" },
  in_progress: { label: "En Curso", variant: "default" },
  paused: { label: "Pausada", variant: "outline" },
  completed: { label: "Finalizada", variant: "secondary" },
  cancelled: { label: "Cancelada", variant: "destructive" },
};

const estimateStatusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "Borrador", variant: "secondary" },
  sent: { label: "Enviado", variant: "default" },
  accepted: { label: "Aceptado", variant: "secondary" },
  rejected: { label: "Rechazado", variant: "destructive" },
};

const supplierTypeConfig: Record<string, string> = {
  material: "Material",
  labor: "Mano de obra",
  service: "Servicio",
  other: "Otro",
};

type StatusBadgeProps = {
  type: "project" | "estimate";
  status: string;
};

export function StatusBadge({ type, status }: StatusBadgeProps) {
  const config = type === "project" ? projectStatusConfig : estimateStatusConfig;
  const item = config[status] ?? { label: status, variant: "outline" as const };
  return <Badge variant={item.variant}>{item.label}</Badge>;
}

export function SupplierTypeBadge({ type }: { type: string }) {
  return <Badge variant="outline">{supplierTypeConfig[type] ?? type}</Badge>;
}
