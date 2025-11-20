import Link from "next/link";
import { redirect } from "next/navigation";

import { LogoutButton } from "@/components/auth/logout-button";
import { EditProjectSection } from "@/components/projects/edit-project-section";
import { DeleteProjectButton } from "@/components/projects/delete-project-button";
import { TasksList } from "@/components/tasks/tasks-list";
import { NewTaskSection } from "@/components/tasks/new-task-section";
import { ProjectFinances } from "@/components/finances/project-finances";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getProjectById, getClientsForSelect, getProjects } from "@/lib/data/projects";
import { getTasksByProjectId } from "@/lib/data/tasks";
import {
  getFinanceTransactionsByProjectId,
  getProjectFinanceSummary,
} from "@/lib/data/finances";
import { getTimeEntriesByProjectId, getProjectTimeSummary } from "@/lib/data/time-tracking";
import { NewTimeEntrySection } from "@/components/time-tracking/new-time-entry-section";
import { TimeEntriesList } from "@/components/time-tracking/time-entries-list";
import { formatDuration } from "@/lib/utils";
import { getCompanyWorkers, isCompanyAdmin } from "@/lib/data/companies";
import { createClient } from "@/lib/supabase/server";
import { getAllTasks } from "@/lib/data/tasks";

type ProjectEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProjectEditPage({ params }: ProjectEditPageProps) {
  const { id } = await params;
  const project = await getProjectById(id);
  const clients = await getClientsForSelect();
  const tasks = await getTasksByProjectId(id);
  
  // Manejar errores al cargar transacciones financieras
  let projectTransactions: Awaited<ReturnType<typeof getFinanceTransactionsByProjectId>> = [];
  let projectFinanceSummary: Awaited<ReturnType<typeof getProjectFinanceSummary>> = {
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
  };
  let financeError: string | null = null;

  try {
    projectTransactions = await getFinanceTransactionsByProjectId(id);
    projectFinanceSummary = await getProjectFinanceSummary(id);
  } catch (error) {
    console.error("Error loading finance data:", error);
    financeError = error instanceof Error ? error.message : "Error desconocido al cargar las finanzas";
  }

  // Obtener registros de tiempo del proyecto
  const timeEntries = await getTimeEntriesByProjectId(id);
  const timeSummary = await getProjectTimeSummary(id);
  
  // Obtener trabajadores para el formulario de registro de tiempo
  const allWorkers = await getCompanyWorkers();
  const isAdmin = await isCompanyAdmin();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const workersWithoutCurrentUser = user
    ? allWorkers.filter((worker) => worker.user_id !== user.id)
    : allWorkers;
  
  // Obtener nombre del usuario actual
  let currentUserName: string | undefined = undefined;
  if (user) {
    const result = await supabase.rpc('get_user_data', {
      user_uuid: user.id
    }).single();
    
    const userData = result.data as { id: string; email: string; name: string | null; full_name: string | null } | null;
    currentUserName = userData?.name || userData?.full_name || user.email?.split('@')[0];
  }
  
  // Obtener todas las tareas para el formulario
  const allTasks = await getAllTasks();

  const allProjects = await getProjects();

  if (!project) {
    redirect("/dashboard/obras");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="border-b bg-white dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Editar Obra</h1>
            <div className="flex items-center gap-2">
              <Link href="/dashboard/obras">
                <Button variant="ghost">Volver a Obras</Button>
              </Link>
              <LogoutButton variant="outline" />
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Editar Obra</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Modifica la información de la obra</p>
        </div>

        <div className="mb-8">
          <div className="mb-4 flex items-center justify-end">
            <DeleteProjectButton projectId={project.id} projectName={project.name} />
          </div>
          <EditProjectSection project={project} clients={clients} />
        </div>

        <div className="space-y-6">
          <Card className="border border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle>Gestión de Tareas</CardTitle>
              <CardDescription>Administra las tareas de esta obra</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <NewTaskSection projectId={project.id} />

              <div className="border-t border-gray-200 pt-6 dark:border-gray-800">
                <TasksList tasks={tasks} projectId={project.id} />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle>Control Horario del Proyecto</CardTitle>
              <CardDescription>Registra y gestiona el tiempo trabajado en esta obra</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Resumen de horas */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Horas</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatDuration(timeSummary.totalMinutes)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Horas (numérico)</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {timeSummary.totalHours.toFixed(2)} h
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Registros</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {timeSummary.entryCount}
                    </p>
                  </div>
                </div>
              </div>

              {/* Formulario para añadir registro */}
              <div className="border-t border-gray-200 pt-6 dark:border-gray-800">
                <NewTimeEntrySection
                  projects={allProjects}
                  tasks={allTasks}
                  companyMembers={workersWithoutCurrentUser}
                  isAdmin={isAdmin}
                  currentUserName={currentUserName}
                  defaultProjectId={id}
                />
              </div>

              {/* Lista de registros */}
              {timeEntries.length > 0 && (
                <div className="border-t border-gray-200 pt-6 dark:border-gray-800">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                    Registros de Tiempo ({timeEntries.length})
                  </h3>
                  <TimeEntriesList entries={timeEntries} />
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle>Finanzas del Proyecto</CardTitle>
              <CardDescription>Gestiona los ingresos y gastos de esta obra</CardDescription>
            </CardHeader>
            <CardContent>
              {financeError ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-600 dark:text-red-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-red-800 dark:text-red-300">
                        Error al cargar las finanzas
                      </h3>
                      <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                        {financeError}
                      </p>
                      {financeError.includes("tabla") && (
                        <p className="mt-2 text-xs text-red-600 dark:text-red-500">
                          Por favor, ejecuta el script SQL{" "}
                          <code className="rounded bg-red-100 px-1 py-0.5 dark:bg-red-900/40">
                            sql/create_finance_transactions_table.sql
                          </code>{" "}
                          en tu base de datos de Supabase.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <ProjectFinances
                  project={project}
                  transactions={projectTransactions}
                  summary={projectFinanceSummary}
                  projects={allProjects}
                  clients={clients}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

