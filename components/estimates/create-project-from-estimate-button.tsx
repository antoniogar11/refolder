"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createProjectFromEstimateAction } from "@/app/dashboard/presupuestos/create-project-action";
import { FolderPlus, Loader2 } from "lucide-react";

type CreateProjectFromEstimateButtonProps = {
  estimateId: string;
};

export function CreateProjectFromEstimateButton({ estimateId }: CreateProjectFromEstimateButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const result = await createProjectFromEstimateAction(estimateId);
      if (result.success && result.projectId) {
        toast.success(result.message);
        router.push(`/dashboard/proyectos/${result.projectId}`);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Error de conexión al crear el proyecto.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? (
        <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Creando...</>
      ) : (
        <><FolderPlus className="mr-1 h-4 w-4" /> Crear proyecto</>
      )}
    </Button>
  );
}
