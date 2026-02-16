import { getAllClients } from "@/lib/data/clients";
import { getSiteVisitById } from "@/lib/data/site-visits";
import { NewEstimateForm } from "@/components/estimates/new-estimate-form";

type Props = {
  searchParams: Promise<{ visitId?: string }>;
};

function buildDescriptionFromVisit(visit: NonNullable<Awaited<ReturnType<typeof getSiteVisitById>>>) {
  const lines: string[] = [];

  lines.push(`Reforma en ${visit.address}`);
  lines.push("");

  if (visit.zones) {
    for (const zone of visit.zones) {
      const dimensions = [
        zone.largo ? `${zone.largo}` : null,
        zone.ancho ? `${zone.ancho}` : null,
        zone.alto ? `${zone.alto}` : null,
      ]
        .filter(Boolean)
        .join("m x ");

      const header = dimensions
        ? `${zone.name} (${dimensions}m):`
        : `${zone.name}:`;

      lines.push(header);

      if (zone.works && zone.works.length > 0) {
        for (const work of zone.works) {
          const line = work.notes
            ? `- ${work.work_type}: ${work.notes}`
            : `- ${work.work_type}`;
          lines.push(line);
        }
      }

      if (zone.notes) {
        lines.push(`  Nota: ${zone.notes}`);
      }

      lines.push("");
    }
  }

  if (visit.general_notes) {
    lines.push(`Observaciones generales: ${visit.general_notes}`);
  }

  return lines.join("\n").trim();
}

export default async function NuevoPresupuestoPage({ searchParams }: Props) {
  const params = await searchParams;
  const [clients, visit] = await Promise.all([
    getAllClients(),
    params.visitId ? getSiteVisitById(params.visitId) : null,
  ]);

  const prefilledDescription = visit ? buildDescriptionFromVisit(visit) : undefined;
  const prefilledClientId = visit?.client_id ?? undefined;

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
          Nuevo Presupuesto
        </h2>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          {visit
            ? `Generando presupuesto a partir de la visita en ${visit.address}`
            : "Genera un presupuesto profesional con IA"}
        </p>
      </div>
      <NewEstimateForm
        clients={clients}
        prefilledDescription={prefilledDescription}
        prefilledClientId={prefilledClientId}
        visitId={params.visitId}
      />
    </div>
  );
}
