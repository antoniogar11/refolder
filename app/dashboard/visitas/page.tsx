import Link from "next/link";
import { ClipboardList, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getSiteVisits } from "@/lib/data/site-visits";
import type { SiteVisitStatus } from "@/types";

const statusConfig: Record<SiteVisitStatus, { label: string; className: string }> = {
  pendiente: { label: "Pendiente", className: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  presupuestado: { label: "Presupuestado", className: "bg-green-100 text-green-800 border-green-300" },
  vinculado: { label: "Vinculado", className: "bg-blue-100 text-blue-800 border-blue-300" },
};

type PageProps = {
  searchParams: Promise<{ status?: string; page?: string }>;
};

export default async function VisitasPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const status = params.status;
  const page = parseInt(params.page ?? "1", 10);

  const { visits, total } = await getSiteVisits({ status, page });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            Visitas de Obra
          </h2>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Registra visitas y genera presupuestos a partir de ellas
          </p>
        </div>
        <Link href="/dashboard/visitas/nueva">
          <Button className="bg-amber-500 hover:bg-amber-600 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Nueva visita
          </Button>
        </Link>
      </div>

      {/* Filtros de estado */}
      <div className="flex gap-2 mb-6">
        <Link href="/dashboard/visitas">
          <Button variant={!status ? "default" : "outline"} size="sm">
            Todas
          </Button>
        </Link>
        <Link href="/dashboard/visitas?status=pendiente">
          <Button variant={status === "pendiente" ? "default" : "outline"} size="sm">
            Pendientes
          </Button>
        </Link>
        <Link href="/dashboard/visitas?status=presupuestado">
          <Button variant={status === "presupuestado" ? "default" : "outline"} size="sm">
            Presupuestadas
          </Button>
        </Link>
        <Link href="/dashboard/visitas?status=vinculado">
          <Button variant={status === "vinculado" ? "default" : "outline"} size="sm">
            Vinculadas
          </Button>
        </Link>
      </div>

      {visits.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ClipboardList className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              No hay visitas todavia
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Registra tu primera visita de obra para empezar a generar presupuestos
            </p>
            <Link href="/dashboard/visitas/nueva">
              <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Crear primera visita
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Direccion</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visits.map((visit) => {
                  const config = statusConfig[visit.status];
                  return (
                    <TableRow key={visit.id}>
                      <TableCell>
                        <Link
                          href={`/dashboard/visitas/${visit.id}`}
                          className="font-medium hover:text-amber-600"
                        >
                          {visit.address}
                        </Link>
                      </TableCell>
                      <TableCell className="text-slate-500 dark:text-slate-400">
                        {visit.client?.name ?? "-"}
                      </TableCell>
                      <TableCell className="text-slate-500 dark:text-slate-400">
                        {new Date(visit.visit_date).toLocaleDateString("es-ES")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={config.className}>
                          {config.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
