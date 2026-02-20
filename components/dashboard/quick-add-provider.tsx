import { getAllProjects } from "@/lib/data/projects";
import { getWorkerRates } from "@/lib/data/worker-rates";
import { QuickAddDialog } from "./quick-add-dialog";
import { DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";

type QuickAddProviderProps = {
  variant: "sidebar" | "fab";
};

export async function QuickAddProvider({ variant }: QuickAddProviderProps) {
  const [projects, workerRates] = await Promise.all([
    getAllProjects(),
    getWorkerRates(),
  ]);

  if (variant === "fab") {
    return (
      <QuickAddDialog projects={projects} workerRates={workerRates}>
        <DialogTrigger asChild>
          <button
            type="button"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500 text-white shadow-lg shadow-amber-500/30 hover:bg-amber-600 active:scale-90 transition-all"
            aria-label="Registro r\u00e1pido"
          >
            <Plus className="h-7 w-7" strokeWidth={2.5} />
          </button>
        </DialogTrigger>
      </QuickAddDialog>
    );
  }

  // Sidebar variant
  return (
    <QuickAddDialog projects={projects} workerRates={workerRates}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-lg bg-amber-500 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-amber-600 active:scale-[0.98]"
        >
          <Plus className="h-5 w-5" />
          Registro r\u00e1pido
        </button>
      </DialogTrigger>
    </QuickAddDialog>
  );
}
