import { cn } from "@/lib/utils";

const projectStatusConfig: Record<string, { label: string; className: string }> = {
  planning: { label: "Planificacion", className: "status-planning" },
  in_progress: { label: "En Curso", className: "status-in-progress" },
  paused: { label: "Pausada", className: "status-paused" },
  completed: { label: "Finalizada", className: "status-completed" },
  cancelled: { label: "Cancelada", className: "status-cancelled" },
};

const estimateStatusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: "Borrador", className: "status-draft" },
  sent: { label: "Enviado", className: "status-sent" },
  accepted: { label: "Aceptado", className: "status-accepted" },
  rejected: { label: "Rechazado", className: "status-rejected" },
};

type StatusBadgeProps = {
  type: "project" | "estimate";
  status: string;
};

export function StatusBadge({ type, status }: StatusBadgeProps) {
  const config = type === "project" ? projectStatusConfig : estimateStatusConfig;
  const item = config[status] ?? { label: status, className: "" };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        item.className
      )}
    >
      {item.label}
    </span>
  );
}
