import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
        Página no encontrada
      </h2>
      <p className="text-slate-600 dark:text-slate-400">
        La página que buscas no existe.
      </p>
      <Link href="/dashboard">
        <Button>Volver al Dashboard</Button>
      </Link>
    </div>
  );
}
