import { redirect } from "next/navigation";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { DeleteEntityButton } from "@/components/shared/delete-entity-button";
import { getEstimateById } from "@/lib/data/estimates";
import { getEstimateItems } from "@/lib/data/estimate-items";
import { getOrCreateCompany } from "@/lib/data/companies";
import { deleteEstimateAction } from "@/app/dashboard/presupuestos/actions";
import { EstimateItemsEditor } from "@/components/estimates/estimate-items-editor";
import { EstimateStatusSelect } from "@/components/estimates/estimate-status-select";
import { ExportPDFButton } from "@/components/estimates/export-pdf-button";
import { formatCurrency } from "@/lib/utils/format";
import { roundCurrency } from "@/lib/utils";

type EstimateDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EstimateDetailPage({ params }: EstimateDetailPageProps) {
  const { id } = await params;
  const [estimate, items, company] = await Promise.all([
    getEstimateById(id),
    getEstimateItems(id),
    getOrCreateCompany(),
  ]);

  if (!estimate) {
    redirect("/dashboard/presupuestos");
  }

  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const iva = roundCurrency(subtotal * 0.21);
  const total = roundCurrency(subtotal + iva);

  return (
    <div className="max-w-5xl">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            {estimate.name}
          </h2>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Proyecto:{" "}
            {estimate.project ? (
              <Link
                href={`/dashboard/proyectos/${estimate.project.id}`}
                className="hover:text-amber-600 underline"
              >
                {estimate.project.name}
              </Link>
            ) : (
              "Sin asignar"
            )}
            {(estimate.client || estimate.project?.client) && (
              <>
                {" "}&middot; Cliente:{" "}
                <Link
                  href={`/dashboard/clientes/${(estimate.client || estimate.project?.client)?.id}`}
                  className="hover:text-amber-600 underline"
                >
                  {(estimate.client || estimate.project?.client)?.name}
                </Link>
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportPDFButton estimate={estimate} items={items} company={company} />
          <EstimateStatusSelect estimateId={estimate.id} currentStatus={estimate.status} />
          <DeleteEntityButton
            entityId={estimate.id}
            entityName={estimate.name}
            redirectPath="/dashboard/presupuestos"
            onDelete={deleteEstimateAction}
          />
        </div>
      </div>

      <EstimateItemsEditor
        estimateId={estimate.id}
        initialItems={items}
        estimateTotal={estimate.total_amount}
      />
    </div>
  );
}
