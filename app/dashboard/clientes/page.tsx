import { redirect } from "next/navigation";
import Link from "next/link";

import { LogoutButton } from "@/components/auth/logout-button";
import { NewClientSection } from "@/components/clients/new-client-section";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getClients } from "@/lib/data/clients";
import { hasWorkerPermission, isCompanyAdmin } from "@/lib/data/companies";

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("es-ES", { year: "numeric", month: "long", day: "numeric" }).format(
    new Date(dateString),
  );
}

export default async function ClientesPage() {
  const isAdmin = await isCompanyAdmin();
  const canViewClients = isAdmin || await hasWorkerPermission("clients:read");

  if (!canViewClients) {
    redirect("/dashboard");
  }

  const clients = await getClients();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="border-b bg-white dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Gestión de Clientes</h1>
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
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Clientes</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Base de datos de todos tus clientes</p>
        </div>

        <NewClientSection />

        {clients.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No tienes clientes todavía</CardTitle>
              <CardDescription>Registra tu primer cliente para comenzar a usarlos en tus proyectos.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Usa el formulario superior para añadir tu primer cliente.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Teléfono
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Localidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    CIF/NIF
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
                {clients.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="whitespace-nowrap px-6 py-4">
                      <Link href={`/dashboard/clientes/${client.id}`} className="block">
                        <div className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                          {client.name}
                        </div>
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <Link href={`/dashboard/clientes/${client.id}`} className="block">
                        <div className="text-sm text-gray-600 dark:text-gray-400">{client.email || "-"}</div>
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <Link href={`/dashboard/clientes/${client.id}`} className="block">
                        <div className="text-sm text-gray-600 dark:text-gray-400">{client.phone || "-"}</div>
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <Link href={`/dashboard/clientes/${client.id}`} className="block">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {[client.postal_code, client.city, client.province].filter(Boolean).join(", ") || "-"}
                        </div>
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <Link href={`/dashboard/clientes/${client.id}`} className="block">
                        <div className="text-sm text-gray-600 dark:text-gray-400">{client.tax_id || "-"}</div>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

