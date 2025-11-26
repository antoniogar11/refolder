import { redirect } from "next/navigation";
import Link from "next/link";

import { LogoutButton } from "@/components/auth/logout-button";
import { NewEstimateSection } from "@/components/estimates/new-estimate-section";
import { EstimatesList } from "@/components/estimates/estimates-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getEstimates } from "@/lib/data/estimates";
import { getProjects } from "@/lib/data/projects";
import { getClientsForSelect } from "@/lib/data/projects";
import { hasWorkerPermission, isCompanyAdmin } from "@/lib/data/companies";
import { formatCurrency } from "@/lib/utils/format";

export default async function PresupuestosPage() {
  const isAdmin = await isCompanyAdmin();
  const canViewEstimates = isAdmin || await hasWorkerPermission("estimates:read");

  if (!canViewEstimates) {
    redirect("/dashboard");
  }

  const estimates = await getEstimates();
  const projects = await getProjects();
  const clients = await getClientsForSelect();

  // Calcular estadísticas
  const totalEstimates = estimates.length;
  const totalAmount = estimates.reduce((sum, e) => sum + e.total, 0);
  const acceptedEstimates = estimates.filter((e) => e.status === "accepted");
  const acceptedAmount = acceptedEstimates.reduce((sum, e) => sum + e.total, 0);

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
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Presupuestos</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Crea y gestiona presupuestos para tus obras y clientes
          </p>
        </div>

        {/* Resumen */}
        <div className="mb-8 grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Presupuestos</CardDescription>
              <CardTitle className="text-3xl font-bold text-gray-600 dark:text-gray-400">
                {totalEstimates}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Valor Total</CardDescription>
              <CardTitle className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(totalAmount)}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Presupuestos Aceptados</CardDescription>
              <CardTitle className="text-3xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(acceptedAmount)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {acceptedEstimates.length} presupuesto{acceptedEstimates.length !== 1 ? "s" : ""} aceptado{acceptedEstimates.length !== 1 ? "s" : ""}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Formulario de Nuevo Presupuesto */}
        <Card className="mb-8 border border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle>Nuevo Presupuesto</CardTitle>
            <CardDescription>Crea un nuevo presupuesto para un cliente o proyecto</CardDescription>
          </CardHeader>
          <CardContent>
            <NewEstimateSection projects={projects} clients={clients} />
          </CardContent>
        </Card>

        {/* Lista de Presupuestos */}
        <Card className="border border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle>Presupuestos</CardTitle>
            <CardDescription>Todos tus presupuestos</CardDescription>
          </CardHeader>
          <CardContent>
            <EstimatesList estimates={estimates} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}


