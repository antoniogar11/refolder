import { redirect } from "next/navigation";
import Link from "next/link";

import { deleteClientAction } from "@/app/dashboard/clientes/actions";
import { EditClientForm } from "@/components/clients/edit-client-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { getClientById } from "@/lib/data/clients";
import { getProjectsByClientId } from "@/lib/data/projects";
import { DeleteEntityButton } from "@/components/shared/delete-entity-button";

type ClientEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ClientEditPage({ params }: ClientEditPageProps) {
  const { id } = await params;
  const [client, projects] = await Promise.all([
    getClientById(id),
    getProjectsByClientId(id),
  ]);

  if (!client) {
    redirect("/dashboard/clientes");
  }

  return (
    <div className="max-w-5xl">
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

      {/* Obras de este cliente */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Obras de este cliente ({projects.length})</CardTitle>
            <Link href="/dashboard/obras">
              <Button size="sm">Nueva Obra</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Este cliente no tiene obras registradas.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Presupuesto</TableHead>
                  <TableHead>Inicio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <Link
                        href={`/dashboard/obras/${project.id}`}
                        className="font-medium text-gray-900 dark:text-white hover:text-blue-600"
                      >
                        {project.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <StatusBadge type="project" status={project.status} />
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-400">
                      {project.total_budget
                        ? new Intl.NumberFormat("es-ES", {
                            style: "currency",
                            currency: "EUR",
                          }).format(project.total_budget)
                        : "-"}
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-400">
                      {project.start_date || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
