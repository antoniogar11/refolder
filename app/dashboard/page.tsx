import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogoutButton } from "@/components/auth/logout-button";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="border-b bg-white dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Refolder Dashboard
            </h1>
            <div className="flex items-center gap-2">
              <Link href="/">
                <Button variant="ghost">Inicio</Button>
              </Link>
              <LogoutButton variant="outline" />
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Panel de Control
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Gestiona tus obras, clientes y presupuestos desde aquí
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Obras</CardTitle>
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
              <CardTitle>Clientes</CardTitle>
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
              <CardTitle>Presupuestos</CardTitle>
              <CardDescription>Gestionar presupuestos</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/presupuestos">
                <Button className="w-full">Ver Presupuestos</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Proveedores</CardTitle>
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
              <CardTitle>Finanzas</CardTitle>
              <CardDescription>Control de ingresos y gastos</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/finanzas">
                <Button className="w-full">Ver Finanzas</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Obras Activas</span>
                  <span className="font-semibold text-gray-900 dark:text-white">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Clientes</span>
                  <span className="font-semibold text-gray-900 dark:text-white">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Presupuestos Pendientes</span>
                  <span className="font-semibold text-gray-900 dark:text-white">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Balance Financiero</span>
                  <span className="font-semibold text-gray-900 dark:text-white">€0</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline">
                Nueva Obra
              </Button>
              <Button className="w-full" variant="outline">
                Nuevo Cliente
              </Button>
              <Button className="w-full" variant="outline">
                Crear Presupuesto
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

