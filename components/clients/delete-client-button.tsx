"use client";

import { deleteClientAction } from "@/app/dashboard/clientes/actions";
import { DeleteEntityButton } from "@/components/shared/delete-entity-button";

type DeleteClientButtonProps = {
  clientId: string;
  clientName: string;
};

export function DeleteClientButton({ clientId, clientName }: DeleteClientButtonProps) {
  return (
    <DeleteEntityButton
      entityId={clientId}
      entityName={clientName}
      redirectPath="/dashboard/clientes"
      onDelete={deleteClientAction}
    />
  );
}
