"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { deleteClientAction } from "@/app/dashboard/clientes/actions";
import { Button } from "@/components/ui/button";

type DeleteClientButtonProps = {
  clientId: string;
  clientName: string;
};

export function DeleteClientButton({ clientId, clientName }: DeleteClientButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    const result = await deleteClientAction(clientId);

    if (result.success) {
      router.push("/dashboard/clientes");
      router.refresh();
    } else {
      alert(result.message);
      setIsDeleting(false);
      setShowConfirm(false);
    }
  }

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          ¿Eliminar {clientName}?
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowConfirm(false)}
          disabled={isDeleting}
        >
          Cancelar
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? "Eliminando..." : "Eliminar"}
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={() => setShowConfirm(true)}
      disabled={isDeleting}
    >
      Eliminar Cliente
    </Button>
  );
}

