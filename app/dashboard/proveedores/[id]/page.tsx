import { redirect } from "next/navigation";

import { deleteSupplierAction } from "@/app/dashboard/proveedores/actions";
import { SupplierForm } from "@/components/suppliers/supplier-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupplierById } from "@/lib/data/suppliers";
import { DeleteEntityButton } from "@/components/shared/delete-entity-button";

type SupplierEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function SupplierEditPage({ params }: SupplierEditPageProps) {
  const { id } = await params;
  const supplier = await getSupplierById(id);

  if (!supplier) {
    redirect("/dashboard/proveedores");
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Editar Proveedor</h2>
        <p className="mt-1 text-gray-600 dark:text-gray-400">Modifica la información del proveedor</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{supplier.name}</CardTitle>
              <CardDescription>Modifica los datos del proveedor</CardDescription>
            </div>
            <DeleteEntityButton
              entityId={supplier.id}
              entityName={supplier.name}
              redirectPath="/dashboard/proveedores"
              onDelete={deleteSupplierAction}
            />
          </div>
        </CardHeader>
        <CardContent>
          <SupplierForm supplier={supplier} />
        </CardContent>
      </Card>
    </div>
  );
}
