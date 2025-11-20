"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { EditClientForm } from "./edit-client-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Client } from "@/lib/data/clients";

type EditClientSectionProps = {
  client: Client;
};

export function EditClientSection({ client }: EditClientSectionProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);

  const handleSuccess = () => {
    setShowForm(false);
    router.refresh();
  };

  if (!showForm) {
    return (
      <Card className="mb-8 border border-gray-200 dark:border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{client.name}</CardTitle>
              <CardDescription>Información del cliente</CardDescription>
            </div>
            <Button onClick={() => setShowForm(true)} variant="outline">
              Editar Cliente
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {client.email && (
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</p>
                <p className="text-base text-gray-900 dark:text-white">{client.email}</p>
              </div>
            )}
            {client.phone && (
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Teléfono</p>
                <p className="text-base text-gray-900 dark:text-white">{client.phone}</p>
              </div>
            )}
            {(client.city || client.province) && (
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Localidad</p>
                <p className="text-base text-gray-900 dark:text-white">
                  {[client.city, client.province].filter(Boolean).join(", ")}
                </p>
              </div>
            )}
            {client.postal_code && (
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Código Postal</p>
                <p className="text-base text-gray-900 dark:text-white">{client.postal_code}</p>
              </div>
            )}
            {client.address && (
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Dirección</p>
                <p className="text-base text-gray-900 dark:text-white">{client.address}</p>
              </div>
            )}
            {client.tax_id && (
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">CIF/NIF</p>
                <p className="text-base text-gray-900 dark:text-white">{client.tax_id}</p>
              </div>
            )}
            {client.notes && (
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Notas</p>
                <p className="text-base text-gray-900 dark:text-white whitespace-pre-wrap">{client.notes}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8 border border-gray-200 dark:border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Editar Cliente</CardTitle>
            <CardDescription>Modifica los datos del cliente</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
            Cancelar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <EditClientForm client={client} onSuccess={handleSuccess} />
      </CardContent>
    </Card>
  );
}

