import { redirect } from "next/navigation";

import { deleteEstimateAction } from "@/app/dashboard/presupuestos/actions";
import { EstimateForm } from "@/components/estimates/estimate-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getEstimateById } from "@/lib/data/estimates";
import { getAllProjects } from "@/lib/data/projects";
import { DeleteEntityButton } from "@/components/shared/delete-entity-button";
import { StatusBadge } from "@/components/dashboard/status-badge";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(amount);
}

type EstimateEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EstimateEditPage({ params }: EstimateEditPageProps) {
  const { id } = await params;
  const [estimate, projects] = await Promise.all([
    getEstimateById(id),
    getAllProjects(),
  ]);

  if (!estimate) {
    redirect("/dashboard/presupuestos");
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Editar Presupuesto</h2>
        <p className="mt-1 text-gray-600 dark:text-gray-400">Modifica la informacion del presupuesto</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {estimate.name}
                <StatusBadge type="estimate" status={estimate.status} />
              </CardTitle>
              <CardDescription>
                Obra: {estimate.project?.name || "Sin asignar"} | Importe: {formatCurrency(estimate.total_amount)}
              </CardDescription>
            </div>
            <DeleteEntityButton
              entityId={estimate.id}
              entityName={estimate.name}
              redirectPath="/dashboard/presupuestos"
              onDelete={deleteEstimateAction}
            />
          </div>
        </CardHeader>
        <CardContent>
          <EstimateForm estimate={estimate} projects={projects} />
        </CardContent>
      </Card>
    </div>
  );
}
