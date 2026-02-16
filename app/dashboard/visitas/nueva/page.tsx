import { getAllClients } from "@/lib/data/clients";
import { getWorkTypes } from "@/lib/data/site-visits";
import { SiteVisitForm } from "@/components/site-visits/site-visit-form";

export default async function NuevaVisitaPage() {
  const [clients, workTypes] = await Promise.all([
    getAllClients(),
    getWorkTypes(),
  ]);

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
          Nueva Visita de Obra
        </h2>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Registra los datos de la visita, zonas y trabajos necesarios
        </p>
      </div>
      <SiteVisitForm
        clients={clients}
        workTypes={workTypes.map((wt) => wt.name)}
      />
    </div>
  );
}
