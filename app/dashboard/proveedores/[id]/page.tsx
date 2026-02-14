import { redirect } from "next/navigation";
import { getSupplierById } from "@/lib/data/suppliers";
import { deleteSupplierAction, updateSupplierAction } from "@/app/dashboard/proveedores/actions";
import { DeleteEntityButton } from "@/components/shared/delete-entity-button";
import { EditSupplierForm } from "@/components/suppliers/edit-supplier-form";

type SupplierDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function SupplierDetailPage({ params }: SupplierDetailPageProps) {
  const { id } = await params;
  const supplier = await getSupplierById(id);

  if (!supplier) {
    redirect("/dashboard/proveedores");
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            {supplier.name}
          </h2>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Detalle del proveedor
          </p>
        </div>
        <DeleteEntityButton
          entityId={supplier.id}
          entityName={supplier.name}
          redirectPath="/dashboard/proveedores"
          onDelete={deleteSupplierAction}
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <EditSupplierForm supplier={supplier} updateAction={updateSupplierAction} />
      </div>
    </div>
  );
}
