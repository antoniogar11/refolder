import Link from "next/link";
import { Users, Building2, FileText, CircleDollarSign, CheckCircle2, Circle, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDashboardStats } from "@/lib/data/dashboard";
import { StatusBadge } from "@/components/dashboard/status-badge";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const isNewUser =
    stats.totalClients === 0 &&
    stats.totalProjects === 0 &&
    stats.totalEstimates === 0;

  if (isNewUser) {
    return (
      <div>
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            Panel de Control
          </h2>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="h-6 w-6 text-amber-500" />
              Bienvenido a Refolder!
            </CardTitle>
            <p className="text-slate-500 dark:text-slate-400">
              Sigue estos pasos para crear tu primer presupuesto:
            </p>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              <WelcomeStep
                number={1}
                done={stats.totalClients > 0}
                title="Registra tu primer cliente"
                description="Anade los datos de tu primer cliente para poder asignarlo a proyectos y presupuestos."
                href="/dashboard/clientes"
              />
              <WelcomeStep
                number={2}
                done={stats.totalProjects > 0}
                title="Crea un proyecto"
                description="Organiza tu trabajo creando un proyecto asociado a un cliente."
                href="/dashboard/proyectos"
              />
              <WelcomeStep
                number={3}
                done={stats.totalEstimates > 0}
                title="Genera tu primer presupuesto con IA"
                description="Describe el trabajo y la IA generara las partidas automaticamente."
                href="/dashboard/presupuestos/nuevo"
              />
            </ol>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
          Panel de Control
        </h2>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Gestiona tus proyectos, clientes y presupuestos desde aqui
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="border-t-4 border-t-amber-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Clientes
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <Users className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Proyectos Activos
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProjects}</div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-sky-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Presupuestos Pendientes
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-sky-50 flex items-center justify-center">
              <FileText className="h-4 w-4 text-sky-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingEstimates}</div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Presupuestos Aceptados
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <CircleDollarSign className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.acceptedEstimatesTotal)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Proyectos recientes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Proyectos recientes
            </CardTitle>
            <Link
              href="/dashboard/proyectos"
              className="text-sm text-amber-600 hover:text-amber-700 font-medium"
            >
              Ver todos
            </Link>
          </CardHeader>
          <CardContent>
            {stats.recentProjects.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No hay proyectos todavia.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Proyecto</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentProjects.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <Link
                          href={`/dashboard/proyectos/${p.id}`}
                          className="font-medium hover:text-amber-600"
                        >
                          {p.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm text-slate-500 dark:text-slate-400">
                        {p.client?.name ?? "-"}
                      </TableCell>
                      <TableCell>
                        <StatusBadge type="project" status={p.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Presupuestos recientes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Presupuestos recientes
            </CardTitle>
            <Link
              href="/dashboard/presupuestos"
              className="text-sm text-amber-600 hover:text-amber-700 font-medium"
            >
              Ver todos
            </Link>
          </CardHeader>
          <CardContent>
            {stats.recentEstimates.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No hay presupuestos todavia.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Presupuesto</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentEstimates.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell>
                        <Link
                          href={`/dashboard/presupuestos/${e.id}`}
                          className="font-medium hover:text-amber-600"
                        >
                          {e.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(e.total_amount)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge type="estimate" status={e.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function WelcomeStep({
  number,
  done,
  title,
  description,
  href,
}: {
  number: number;
  done: boolean;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="flex items-start gap-4 rounded-lg border p-4 transition-colors hover:border-amber-300 hover:bg-amber-50/50 dark:hover:border-amber-700 dark:hover:bg-amber-950/20"
      >
        <div className="shrink-0 pt-0.5">
          {done ? (
            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
          ) : (
            <Circle className="h-6 w-6 text-slate-300 dark:text-slate-600" />
          )}
        </div>
        <div>
          <p className="font-medium text-slate-900 dark:text-white">
            Paso {number}: {title}
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </div>
      </Link>
    </li>
  );
}
