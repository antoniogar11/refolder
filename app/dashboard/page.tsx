import Link from "next/link";
import { Users, Building2, FileText, CircleDollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardStats } from "@/lib/data/dashboard";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Panel de Control
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Gestiona tus obras, clientes y presupuestos desde aquí
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Clientes
            </CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Obras Activas
            </CardTitle>
            <Building2 className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProjects}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Presupuestos Pendientes
            </CardTitle>
            <FileText className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingEstimates}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Presupuestos Aceptados
            </CardTitle>
            <CircleDollarSign className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.acceptedEstimatesTotal)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Obras
            </CardTitle>
            <CardDescription>Gestionar proyectos</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/obras">
              <Button className="w-full">Ver Obras</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Clientes
            </CardTitle>
            <CardDescription>Base de datos de clientes</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/clientes">
              <Button className="w-full">Ver Clientes</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Presupuestos
            </CardTitle>
            <CardDescription>Gestionar presupuestos</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/presupuestos">
              <Button className="w-full">Ver Presupuestos</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Proveedores y Finanzas ocultos temporalmente - módulos no prioritarios para MVP */}
        {/* <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Proveedores
            </CardTitle>
            <CardDescription>Gestionar proveedores</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/proveedores">
              <Button className="w-full">Ver Proveedores</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Finanzas
            </CardTitle>
            <CardDescription>Control de ingresos y gastos</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/finanzas">
              <Button className="w-full">Ver Finanzas</Button>
            </Link>
          </CardContent>
        </Card> */}
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Link href="/dashboard/obras">
              <Button variant="outline">Nueva Obra</Button>
            </Link>
            <Link href="/dashboard/clientes">
              <Button variant="outline">Nuevo Cliente</Button>
            </Link>
            <Link href="/dashboard/presupuestos">
              <Button variant="outline">Crear Presupuesto</Button>
            </Link>
            {/* <Link href="/dashboard/proveedores">
              <Button variant="outline">Nuevo Proveedor</Button>
            </Link> */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
