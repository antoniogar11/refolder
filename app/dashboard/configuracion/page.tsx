import { getOrCreateCompany } from "@/lib/data/companies";
import { CompanyForm } from "@/components/company/company-form";

export default async function ConfiguracionPage() {
  const company = await getOrCreateCompany();

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          Configuración
        </h2>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Gestiona los datos de tu empresa para presupuestos y documentos
        </p>
      </div>
      {company ? (
        <CompanyForm company={company} />
      ) : (
        <p className="text-slate-500">Error al cargar los datos de la empresa.</p>
      )}
    </div>
  );
}
