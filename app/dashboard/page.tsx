import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogoutButton } from "@/components/auth/logout-button";
import { getUserRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";
import { hasWorkerPermission, isCompanyAdmin } from "@/lib/data/companies";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userRole: string | null = null;
  if (user) {
    userRole = await getUserRole(user.id);
  }

  const isAdmin = userRole === "admin";
  const isCompanyAdminUser = await isCompanyAdmin();

  // Verificar permisos para cada sección
  const canViewProjects = isCompanyAdminUser || await hasWorkerPermission("projects:read");
  const canViewClients = isCompanyAdminUser || await hasWorkerPermission("clients:read");
  const canViewEstimates = isCompanyAdminUser || await hasWorkerPermission("estimates:read");
  const canViewInvoices = isCompanyAdminUser || await hasWorkerPermission("invoices:read");
  const canViewFinances = isCompanyAdminUser || await hasWorkerPermission("finances:read");
  const canViewTimeTracking = isCompanyAdminUser || await hasWorkerPermission("time-tracking:read");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 pb-20 md:pb-8">
      {/* Header mejorado */}
      <nav className="sticky top-0 z-40 border-b border-gray-200/80 dark:border-gray-800/80 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:dark:bg-gray-900/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/50">
                <span className="text-lg font-bold">R</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Refolder
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/">
                <Button variant="ghost" size="sm" className="hidden sm:flex">
                  Inicio
                </Button>
              </Link>
              <LogoutButton variant="outline" />
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
            Panel de Control
          </h2>
          <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Gestiona tus obras, clientes y presupuestos desde aquí
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {canViewProjects && (
            <Card className="group relative overflow-hidden border-2 border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/10 dark:hover:shadow-blue-500/20">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <CardHeader className="relative">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">📁</span>
                  <CardTitle className="text-lg font-semibold">Obras</CardTitle>
                </div>
                <CardDescription className="text-sm">Gestionar proyectos</CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <Link href="/dashboard/obras">
                  <Button className="w-full touch-target font-medium shadow-sm hover:shadow-md transition-shadow">
                    Ver Obras
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {canViewClients && (
            <Card className="group relative overflow-hidden border-2 border-gray-200 dark:border-gray-800 hover:border-green-300 dark:hover:border-green-700 transition-all duration-200 hover:shadow-lg hover:shadow-green-500/10 dark:hover:shadow-green-500/20">
              <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-transparent dark:from-green-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <CardHeader className="relative">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">👥</span>
                  <CardTitle className="text-lg font-semibold">Clientes</CardTitle>
                </div>
                <CardDescription className="text-sm">Base de datos de clientes</CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <Link href="/dashboard/clientes">
                  <Button className="w-full touch-target font-medium shadow-sm hover:shadow-md transition-shadow">
                    Ver Clientes
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {canViewEstimates && (
            <Card className="group relative overflow-hidden border-2 border-gray-200 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/10 dark:hover:shadow-purple-500/20">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <CardHeader className="relative">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">📄</span>
                  <CardTitle className="text-lg font-semibold">Presupuestos</CardTitle>
                </div>
                <CardDescription className="text-sm">Gestionar presupuestos</CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <Link href="/dashboard/presupuestos">
                  <Button className="w-full touch-target font-medium shadow-sm hover:shadow-md transition-shadow">
                    Ver Presupuestos
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {canViewInvoices && (
            <Card className="group relative overflow-hidden border-2 border-gray-200 dark:border-gray-800 hover:border-orange-300 dark:hover:border-orange-700 transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/10 dark:hover:shadow-orange-500/20">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-transparent dark:from-orange-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <CardHeader className="relative">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">🧾</span>
                  <CardTitle className="text-lg font-semibold">Facturas</CardTitle>
                </div>
                <CardDescription className="text-sm">Gestionar facturas</CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <Link href="/dashboard/facturas">
                  <Button className="w-full touch-target font-medium shadow-sm hover:shadow-md transition-shadow">
                    Ver Facturas
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          <Card className="group relative overflow-hidden border-2 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200 hover:shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent dark:from-gray-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            <CardHeader className="relative">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">🏭</span>
                <CardTitle className="text-lg font-semibold">Proveedores</CardTitle>
              </div>
              <CardDescription className="text-sm">Gestionar proveedores</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <Link href="/dashboard/proveedores">
                <Button className="w-full touch-target font-medium shadow-sm hover:shadow-md transition-shadow">
                  Ver Proveedores
                </Button>
              </Link>
            </CardContent>
          </Card>

          {canViewFinances && (
            <Card className="group relative overflow-hidden border-2 border-gray-200 dark:border-gray-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/10 dark:hover:shadow-emerald-500/20">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <CardHeader className="relative">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">💰</span>
                  <CardTitle className="text-lg font-semibold">Finanzas</CardTitle>
                </div>
                <CardDescription className="text-sm">Control de ingresos y gastos</CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <Link href="/dashboard/finanzas">
                  <Button className="w-full touch-target font-medium shadow-sm hover:shadow-md transition-shadow">
                    Ver Finanzas
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {canViewTimeTracking && (
            <Card className="group relative overflow-hidden border-2 border-gray-200 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/20">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent dark:from-indigo-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <CardHeader className="relative">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">⏰</span>
                  <CardTitle className="text-lg font-semibold">Control Horario</CardTitle>
                </div>
                <CardDescription className="text-sm">Registra y gestiona el tiempo de trabajo</CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <Link href="/dashboard/control-horario">
                  <Button className="w-full touch-target font-medium shadow-sm hover:shadow-md transition-shadow">
                    Ver Control Horario
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {isCompanyAdminUser && (
            <Card className="group relative overflow-hidden border-2 border-gray-200 dark:border-gray-800 hover:border-red-300 dark:hover:border-red-700 transition-all duration-200 hover:shadow-lg hover:shadow-red-500/10 dark:hover:shadow-red-500/20">
              <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-transparent dark:from-red-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <CardHeader className="relative">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">🏢</span>
                  <CardTitle className="text-lg font-semibold">Mi Empresa</CardTitle>
                </div>
                <CardDescription className="text-sm">Gestiona administradores y trabajadores</CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <Link href="/dashboard/empresa">
                  <Button className="w-full touch-target font-medium shadow-sm hover:shadow-md transition-shadow" variant="outline">
                    Gestionar Empresa
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="mt-6 sm:mt-8 grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
          <Card className="border-2 border-gray-200 dark:border-gray-800 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <span className="text-xl">📊</span>
                Estadísticas Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Obras Activas</span>
                  <span className="font-bold text-lg sm:text-xl text-gray-900 dark:text-white">0</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Clientes</span>
                  <span className="font-bold text-lg sm:text-xl text-gray-900 dark:text-white">0</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Presupuestos Pendientes</span>
                  <span className="font-bold text-lg sm:text-xl text-gray-900 dark:text-white">0</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-t border-gray-200 dark:border-gray-800 pt-3">
                  <span className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300">Balance Financiero</span>
                  <span className="font-bold text-lg sm:text-xl text-blue-600 dark:text-blue-400">€0</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200 dark:border-gray-800 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <span className="text-xl">⚡</span>
                Acciones Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3">
              <Link href="/dashboard/obras?action=new">
                <Button className="w-full touch-target font-medium shadow-sm hover:shadow-md transition-all" variant="outline">
                  Nueva Obra
                </Button>
              </Link>
              <Link href="/dashboard/clientes?action=new">
                <Button className="w-full touch-target font-medium shadow-sm hover:shadow-md transition-all" variant="outline">
                  Nuevo Cliente
                </Button>
              </Link>
              <Link href="/dashboard/presupuestos?action=new">
                <Button className="w-full touch-target font-medium shadow-sm hover:shadow-md transition-all" variant="outline">
                  Crear Presupuesto
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

