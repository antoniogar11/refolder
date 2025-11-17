import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogoutButton } from "@/components/auth/logout-button";

export default function PresupuestosPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="border-b bg-white dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Gestión de Presupuestos
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Presupuestos
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Crea y gestiona presupuestos para tus obras
            </p>
          </div>
          <Button>Nuevo Presupuesto</Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Presupuesto #001</CardTitle>
              <CardDescription>Reforma de cocina - Juan Pérez</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Importe:</span>
                  <span className="font-semibold">€15,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Estado:</span>
                  <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                    Enviado
                  </span>
                </div>
                <div className="pt-4">
                  <Button variant="outline" className="w-full">
                    Ver Detalles
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

