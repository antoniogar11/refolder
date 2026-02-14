"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type DeleteEntityButtonProps = {
  entityId: string;
  entityName: string;
  redirectPath: string;
  onDelete: (id: string) => Promise<{ success: boolean; message: string }>;
};

export function DeleteEntityButton({
  entityId,
  entityName,
  redirectPath,
  onDelete,
}: DeleteEntityButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    const result = await onDelete(entityId);

    if (result.success) {
      toast.success(result.message);
      router.push(redirectPath);
      router.refresh();
    } else {
      toast.error(result.message);
      setIsDeleting(false);
      setShowConfirm(false);
    }
  }

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          ¿Eliminar {entityName}?
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
    >
      Eliminar
    </Button>
  );
}
