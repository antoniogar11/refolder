import { redirect } from "next/navigation";
import Link from "next/link";

import { LogoutButton } from "@/components/auth/logout-button";
import { NewTimeEntrySection } from "@/components/time-tracking/new-time-entry-section";
import { TimeEntriesList } from "@/components/time-tracking/time-entries-list";
import { TimeSummarySection } from "@/components/time-tracking/time-summary-section";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTimeEntries, getTimeSummary } from "@/lib/data/time-tracking";
import { formatDuration } from "@/lib/utils";
import { getProjects, getClientsForSelect } from "@/lib/data/projects";
import { getAllTasks } from "@/lib/data/tasks";
import { getCompanyWorkers, isCompanyAdmin, hasWorkerPermission } from "@/lib/data/companies";
import { createClient } from "@/lib/supabase/server";

export default async function ControlHorarioPage() {
  const isAdmin = await isCompanyAdmin();
  const canViewTimeTracking = isAdmin || await hasWorkerPermission("time-tracking:read");

  if (!canViewTimeTracking) {
    redirect("/dashboard");
  }

  const entries = await getTimeEntries();
  const summary = await getTimeSummary();
  const projects = await getProjects();
  const tasks = await getAllTasks();
  
  // Obtener todos los trabajadores (dueño + miembros, sin duplicados)
  const allWorkers = await getCompanyWorkers();
  
  // Obtener usuario actual y filtrarlo de la lista (porque ya tenemos "Yo mismo" como opción)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const workersWithoutCurrentUser = user
    ? allWorkers.filter((worker) => worker.user_id !== user.id)
    : allWorkers;
  
  // Obtener nombre del usuario actual para mostrarlo en lugar de "Yo mismo"
  let currentUserName: string | undefined = undefined;
  if (user) {
    const result = await supabase.rpc('get_user_data', {
      user_uuid: user.id
    }).single();
    
    const userData = result.data as { id: string; email: string; name: string | null; full_name: string | null } | null;
    currentUserName = userData?.name || userData?.full_name || user.email?.split('@')[0];
  }

  // Calcular totales del mes actual
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyEntries = entries.filter(
    (e) =>
      new Date(e.entry_date).getMonth() === currentMonth &&
      new Date(e.entry_date).getFullYear() === currentYear &&
      e.duration_minutes !== null,
  );
  const monthlyMinutes = monthlyEntries.reduce((sum, e) => sum + (e.duration_minutes || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="border-b bg-white dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Control Horario</h1>
            <div className="flex items-center gap-2">
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <LogoutButton variant="outline" />
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Control Horario</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Registra y gestiona el tiempo dedicado a tus proyectos y tareas
          </p>
        </div>

        {/* Resumen de Tiempo */}
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total de Horas</CardDescription>
              <CardTitle className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {summary.totalHours.toFixed(1)} h
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {summary.totalMinutes} minutos totales
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Hoy</CardDescription>
              <CardTitle className="text-3xl font-bold text-green-600 dark:text-green-400">
                {summary.todayHours.toFixed(1)} h
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {summary.todayMinutes} minutos hoy
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Este Mes</CardDescription>
              <CardTitle className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {Math.round((monthlyMinutes / 60) * 100) / 100} h
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {monthlyMinutes} minutos este mes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Registros</CardDescription>
              <CardTitle className="text-3xl font-bold text-gray-600 dark:text-gray-400">
                {entries.length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-600 dark:text-gray-400">Total registrados</p>
            </CardContent>
          </Card>
        </div>

        {/* Resumen de Horas */}
        <TimeSummarySection entries={entries} projects={projects} />

        {/* Formulario de Nuevo Registro */}
        <Card className="mb-8 border border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle>Nuevo Registro de Tiempo</CardTitle>
            <CardDescription>Registra el tiempo dedicado a un proyecto o tarea</CardDescription>
          </CardHeader>
          <CardContent>
            <NewTimeEntrySection 
              projects={projects} 
              tasks={tasks} 
              companyMembers={workersWithoutCurrentUser}
              isAdmin={isAdmin}
              currentUserName={currentUserName}
            />
          </CardContent>
        </Card>

        {/* Lista de Registros */}
        <Card className="border border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle>Registros de Tiempo</CardTitle>
            <CardDescription>Todos tus registros de tiempo</CardDescription>
          </CardHeader>
          <CardContent>
            <TimeEntriesList entries={entries} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

