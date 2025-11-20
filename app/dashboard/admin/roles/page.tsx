import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth/require-role';
import { getAvailableRoles, getRoleInfo, getUserRole, type UserRole } from '@/lib/auth/roles';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogoutButton } from '@/components/auth/logout-button';
import { ChangeRoleForm } from '@/components/admin/change-role-form';
import Link from 'next/link';

export default async function RolesPage() {
  // Solo admins pueden acceder
  const { user, role } = await requireRole(['admin']);

  const supabase = await createClient();

  // Obtener todos los usuarios con roles desde la tabla user_roles
  // Nota: Para obtener todos los usuarios necesitarías usar la API de admin de Supabase
  // Por ahora, obtenemos solo los usuarios que tienen roles asignados
  const { data: userRoles, error } = await supabase
    .from('user_roles')
    .select('user_id, role');

  if (error) {
    console.error('Error fetching user roles:', error);
  }

  // Obtener información de usuarios desde auth.users usando una función helper
  // Nota: Esto requiere permisos especiales. En producción, considera usar una función RPC
  const usersWithRoles = await Promise.all(
    (userRoles || []).map(async (userRole) => {
      // Obtener email del usuario desde user_metadata o crear un helper
      // Por ahora, solo mostramos el user_id
      return {
        id: userRole.user_id,
        email: userRole.user_id, // Placeholder - necesitarías obtener el email de otra forma
        name: `Usuario ${userRole.user_id.slice(0, 8)}`,
        role: userRole.role as UserRole,
        createdAt: null,
      };
    })
  );

  const roles = getAvailableRoles();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="border-b bg-white dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Gestión de Roles</h1>
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
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Roles y Permisos</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Gestiona los roles y permisos de los usuarios del sistema
          </p>
        </div>

        {/* Información de roles */}
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {roles.map((roleKey) => {
            const roleInfo = getRoleInfo(roleKey);
            return (
              <Card key={roleKey}>
                <CardHeader>
                  <CardTitle className="text-lg">{roleInfo.label}</CardTitle>
                  <CardDescription>{roleKey}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {roleInfo.description}
                  </p>
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    {roleInfo.permissions.length} permisos
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Lista de usuarios */}
        <Card>
          <CardHeader>
            <CardTitle>Usuarios y Roles</CardTitle>
            <CardDescription>Asigna roles a los usuarios del sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Usuario
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Rol Actual
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {usersWithRoles.map((userWithRole) => (
                    <tr key={userWithRole.id} className="border-b">
                      <td className="px-4 py-3 text-sm">{userWithRole.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {userWithRole.email}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {getRoleInfo(userWithRole.role as any).label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <ChangeRoleForm
                          userId={userWithRole.id}
                          currentRole={userWithRole.role as any}
                          userName={userWithRole.name}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

