import { redirect } from "next/navigation";

import { deleteClientAction } from "@/app/dashboard/clientes/actions";
import { EditClientForm } from "@/components/clients/edit-client-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getClientById } from "@/lib/data/clients";
import { DeleteEntityButton } from "@/components/shared/delete-entity-button";

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
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Editar Cliente
        </h2>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Modifica la información del cliente
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{client.name}</CardTitle>
              <CardDescription>Modifica los datos del cliente</CardDescription>
            </div>
            <DeleteEntityButton
              entityId={client.id}
              entityName={client.name}
              redirectPath="/dashboard/clientes"
              onDelete={deleteClientAction}
            />
          </div>
        </CardHeader>
        <CardContent>
          <EditClientForm client={client} />
        </CardContent>
      </Card>
    </div>
  );
}
