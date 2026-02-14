import { getAllClients } from "@/lib/data/clients";
import { NewEstimateForm } from "@/components/estimates/new-estimate-form";

export default async function NuevoPresupuestoPage() {
  const clients = await getAllClients();

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
          Nuevo Presupuesto
        </h2>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Genera un presupuesto profesional con IA
        </p>
      </div>
      <NewEstimateForm clients={clients} />
    </div>
  );
}
