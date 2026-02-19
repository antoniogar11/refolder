import { getAllClients } from "@/lib/data/clients";
import { getWorkTypes } from "@/lib/data/work-types";
import { NewEstimateForm } from "@/components/estimates/new-estimate-form";

export default async function NuevoPresupuestoPage() {
  const [clients, workTypes] = await Promise.all([
    getAllClients(),
    getWorkTypes(),
  ]);

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
          Nuevo Presupuesto
        </h2>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Registra las zonas y trabajos necesarios para generar un presupuesto con IA
        </p>
      </div>
      <NewEstimateForm
        clients={clients}
        workTypes={workTypes.map((wt) => wt.name)}
      />
    </div>
  );
}
