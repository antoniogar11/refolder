import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogoutButton } from "@/components/auth/logout-button";

export default function FinanzasPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="border-b bg-white dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Gestión de Finanzas
            </h1>
            <div className="flex items-center gap-2">
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <LogoutButton variant="outline" />
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Finanzas
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Controla ingresos, gastos y estado financiero de tus proyectos
          </p>
        </div>

        {/* Resumen Financiero */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Ingresos Totales</CardDescription>
              <CardTitle className="text-3xl font-bold text-green-600 dark:text-green-400">
                €0
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Este mes: €0
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Gastos Totales</CardDescription>
              <CardTitle className="text-3xl font-bold text-red-600 dark:text-red-400">
                €0
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Este mes: €0
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Balance</CardDescription>
              <CardTitle className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                €0
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Ingresos - Gastos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pendiente de Cobro</CardDescription>
              <CardTitle className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                €0
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Facturas pendientes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Acciones Rápidas */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4">
            <Button>Nuevo Ingreso</Button>
            <Button variant="outline">Nuevo Gasto</Button>
            <Button variant="outline">Nueva Factura</Button>
            <Button variant="outline">Nuevo Pago</Button>
            <Button variant="outline">Ver Reportes</Button>
          </div>
        </div>

        {/* Secciones de Finanzas */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Ingresos</CardTitle>
              <CardDescription>Registro de ingresos y facturación</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-sm">Factura #001</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Cliente: Juan Pérez
                    </p>
                  </div>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    €15,000
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-sm">Factura #002</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Cliente: María García
                    </p>
                  </div>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    €8,500
                  </span>
                </div>
                <div className="pt-2">
                  <Button variant="outline" className="w-full">
                    Ver Todos los Ingresos
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gastos</CardTitle>
              <CardDescription>Control de gastos y compras</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-sm">Materiales</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Proveedor: Materiales S.L.
                    </p>
                  </div>
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    -€3,200
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-sm">Mano de Obra</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Proveedor: Construcciones XYZ
                    </p>
                  </div>
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    -€2,500
                  </span>
                </div>
                <div className="pt-2">
                  <Button variant="outline" className="w-full">
                    Ver Todos los Gastos
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pagos Pendientes</CardTitle>
              <CardDescription>Facturas y pagos por recibir</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-sm">Factura #003</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Vence: 15/12/2024
                    </p>
                  </div>
                  <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                    €5,000
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-sm">Factura #004</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Vence: 20/12/2024
                    </p>
                  </div>
                  <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                    €3,500
                  </span>
                </div>
                <div className="pt-2">
                  <Button variant="outline" className="w-full">
                    Ver Todos los Pendientes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Movimientos Recientes */}
        <Card>
          <CardHeader>
            <CardTitle>Movimientos Recientes</CardTitle>
            <CardDescription>Últimas transacciones registradas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <span className="text-green-600 dark:text-green-400 text-sm">+</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Factura #001 - Cliente: Juan Pérez</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      10/11/2024 - Ingreso
                    </p>
                  </div>
                </div>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  +€15,000
                </span>
              </div>

              <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <span className="text-red-600 dark:text-red-400 text-sm">-</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Compra de Materiales - Materiales S.L.</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      08/11/2024 - Gasto
                    </p>
                  </div>
                </div>
                <span className="font-semibold text-red-600 dark:text-red-400">
                  -€3,200
                </span>
              </div>

              <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <span className="text-green-600 dark:text-green-400 text-sm">+</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Factura #002 - Cliente: María García</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      05/11/2024 - Ingreso
                    </p>
                  </div>
                </div>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  +€8,500
                </span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <span className="text-red-600 dark:text-red-400 text-sm">-</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Mano de Obra - Construcciones XYZ</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      03/11/2024 - Gasto
                    </p>
                  </div>
                </div>
                <span className="font-semibold text-red-600 dark:text-red-400">
                  -€2,500
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

