import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getSiteVisitById } from "@/lib/data/site-visits";
import { deleteSiteVisitAction } from "@/app/dashboard/visitas/actions";
import { DeleteEntityButton } from "@/components/shared/delete-entity-button";
import { Edit, Sparkles, FileText, MapPin, Calendar, User } from "lucide-react";
import type { SiteVisitStatus } from "@/types";

const statusConfig: Record<SiteVisitStatus, { label: string; className: string }> = {
  pendiente: { label: "Pendiente", className: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  presupuestado: { label: "Presupuestado", className: "bg-green-100 text-green-800 border-green-300" },
  vinculado: { label: "Vinculado", className: "bg-blue-100 text-blue-800 border-blue-300" },
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function VisitaDetailPage({ params }: Props) {
  const { id } = await params;
  const visit = await getSiteVisitById(id);

  if (!visit) {
    redirect("/dashboard/visitas");
  }

  const config = statusConfig[visit.status];

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-xl">{visit.address}</CardTitle>
                <Badge variant="outline" className={config.className}>
                  {config.label}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
                {visit.client && (
                  <span className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    <Link
                      href={`/dashboard/clientes/${visit.client.id}`}
                      className="hover:text-amber-600 underline"
                    >
                      {visit.client.name}
                    </Link>
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(visit.visit_date).toLocaleDateString("es-ES", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
            <DeleteEntityButton
              entityId={visit.id}
              entityName={visit.address}
              redirectPath="/dashboard/visitas"
              onDelete={deleteSiteVisitAction}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Link href={`/dashboard/visitas/nueva?editId=${visit.id}`}>
              <Button variant="outline" size="sm">
                <Edit className="mr-1 h-4 w-4" />
                Editar visita
              </Button>
            </Link>
            {visit.status === "pendiente" && (
              <Link href="/dashboard/presupuestos/nuevo">
                <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">
                  <Sparkles className="mr-1 h-4 w-4" />
                  Generar presupuesto
                </Button>
              </Link>
            )}
            {visit.estimate && (
              <Link href={`/dashboard/presupuestos/${visit.estimate.id}`}>
                <Button variant="outline" size="sm">
                  <FileText className="mr-1 h-4 w-4" />
                  Ver presupuesto
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Zonas */}
      {visit.zones && visit.zones.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            Zonas ({visit.zones.length})
          </h3>
          {visit.zones.map((zone) => {
            const dimensions = [
              zone.largo ? `${zone.largo}m` : null,
              zone.ancho ? `${zone.ancho}m` : null,
              zone.alto ? `${zone.alto}m` : null,
            ]
              .filter(Boolean)
              .join(" x ");

            return (
              <Card key={zone.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    {zone.name}
                    {dimensions && (
                      <span className="text-xs font-normal text-slate-500">
                        ({dimensions})
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Trabajos */}
                  {zone.works && zone.works.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                        Trabajos
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {zone.works.map((work) => (
                          <div key={work.id} className="inline-block">
                            <Badge
                              variant="outline"
                              className="bg-amber-50 border-amber-200 text-amber-800"
                            >
                              {work.work_type}
                            </Badge>
                            {work.notes && (
                              <p className="text-xs text-slate-500 mt-1 ml-1">
                                {work.notes}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notas de zona */}
                  {zone.notes && (
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                        Notas
                      </p>
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        {zone.notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Observaciones generales */}
      {visit.general_notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Observaciones generales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
              {visit.general_notes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
