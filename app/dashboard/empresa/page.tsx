import { redirect } from "next/navigation";
import { getUserCompany, isCompanyAdmin, getCompanyMembers } from "@/lib/data/companies";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogoutButton } from "@/components/auth/logout-button";
import Link from "next/link";
import { CompanyMembersList } from "@/components/company/company-members-list";
import { AddMemberForm } from "@/components/company/add-member-form";

export default async function EmpresaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  let company = await getUserCompany();
  let isAdmin = await isCompanyAdmin();
  let members = await getCompanyMembers();

  // Si no tiene empresa, intentar crearla automáticamente
  if (!company) {
    const { createCompany } = await import("@/lib/data/companies");
    const userMetadata = user.user_metadata;
    const userName = userMetadata?.full_name || user.email?.split("@")[0] || "Usuario";
    const companyName = `${userName}'s Company`;
    
    const result = await createCompany(companyName);
    if (result.company) {
      // Recargar los datos
      company = await getUserCompany();
      isAdmin = await isCompanyAdmin();
      members = await getCompanyMembers();
    } else {
      // Si falla, mostrar error con más información
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <nav className="border-b bg-white dark:bg-gray-800">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Mi Empresa</h1>
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
            <Card>
              <CardHeader>
                <CardTitle>No tienes una empresa</CardTitle>
                <CardDescription>Error al crear la empresa automáticamente</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                  <p className="text-sm font-medium text-red-800 dark:text-red-300">
                    Error: {result.error || "Error desconocido"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      );
    }
  }

  // Si después de intentar crear aún no hay empresa, mostrar mensaje
  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <nav className="border-b bg-white dark:bg-gray-800">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Mi Empresa</h1>
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
          <Card>
            <CardHeader>
              <CardTitle>No tienes una empresa</CardTitle>
              <CardDescription>Se debería haber creado automáticamente al registrarte</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Si acabas de registrarte, recarga la página. Si el problema persiste, contacta con soporte.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="border-b bg-white dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Mi Empresa</h1>
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
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{company.name}</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Gestiona los administradores y trabajadores de tu empresa
          </p>
        </div>

        {/* Añadir miembro (solo admins) */}
        {isAdmin && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Añadir Miembro</CardTitle>
              <CardDescription>
                Invita a un administrador o trabajador a tu empresa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AddMemberForm companyId={company.id} />
            </CardContent>
          </Card>
        )}

        {/* Lista de miembros */}
        <Card>
          <CardHeader>
            <CardTitle>Miembros de la Empresa</CardTitle>
            <CardDescription>
              Administradores y trabajadores con acceso a tu empresa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CompanyMembersList members={members} isAdmin={isAdmin} companyId={company.id} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
