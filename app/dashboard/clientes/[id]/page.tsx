import Link from "next/link";
import { redirect } from "next/navigation";

import { deleteClientAction } from "@/app/dashboard/clientes/actions";
import { LogoutButton } from "@/components/auth/logout-button";
import { EditClientSection } from "@/components/clients/edit-client-section";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getClientById } from "@/lib/data/clients";
import { DeleteClientButton } from "@/components/clients/delete-client-button";

type ClientEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ClientEditPage({ params }: ClientEditPageProps) {
  const { id } = await params;
  const client = await getClientById(id);

  if (!client) {
    redirect("/dashboard/clientes");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="border-b bg-white dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Editar Cliente</h1>
            <div className="flex items-center gap-2">
              <Link href="/dashboard/clientes">
                <Button variant="ghost">Volver a Clientes</Button>
              </Link>
              <LogoutButton variant="outline" />
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Editar Cliente</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Modifica la información del cliente</p>
        </div>

        <div className="mb-4 flex items-center justify-end">
          <DeleteClientButton clientId={client.id} clientName={client.name} />
        </div>
        <EditClientSection client={client} />
      </main>
    </div>
  );
}

