import type { ZoneData } from "@/components/shared/zones/zone-card";

export function buildDescriptionFromZones(
  address: string,
  zones: ZoneData[],
  generalNotes?: string | null,
): string {
  const lines: string[] = [];

  lines.push(`Reforma en ${address}`);
  lines.push("");

  for (const zone of zones) {
    if (!zone.name.trim()) continue;

    const dimensions = [zone.largo, zone.ancho, zone.alto]
      .filter(Boolean)
      .map((v) => String(v))
      .join("m x ");

    const header = dimensions
      ? `${zone.name} (${dimensions}m):`
      : `${zone.name}:`;

    lines.push(header);

    if (zone.works.length > 0) {
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

  if (generalNotes) {
    lines.push(`Observaciones generales: ${generalNotes}`);
  }

  return lines.join("\n").trim();
}
