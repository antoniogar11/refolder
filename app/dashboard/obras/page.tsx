import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogoutButton } from "@/components/auth/logout-button";

export default function ObrasPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="border-b bg-white dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Gestión de Obras
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
              Obras
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Gestiona todos tus proyectos de obras y reformas
            </p>
          </div>
          <Button>Nueva Obra</Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Obra de Ejemplo</CardTitle>
              <CardDescription>Reforma de cocina - Cliente: Juan Pérez</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Estado:</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    En Curso
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Presupuesto:</span>
                  <span className="font-semibold">€15,000</span>
                </div>
                <div className="pt-4">
                  <Button variant="outline" className="w-full">
                    Ver Detalles
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sin Obras</CardTitle>
              <CardDescription>No hay obras registradas aún</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Crea tu primera obra para comenzar a gestionar tus proyectos
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

