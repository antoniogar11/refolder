/**
 * Middleware y utilidades para requerir roles específicos
 */

import { redirect } from 'next/navigation';
import { getUserRole } from './roles';
import type { UserRole } from './roles';
import { createClient } from '@/lib/supabase/server';

// Re-exportar UserRole para uso en otros archivos
export type { UserRole } from './roles';

/**
 * Verifica que el usuario tenga un rol específico, redirige si no lo tiene
 */
export async function requireRole(allowedRoles: UserRole[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const userRole = await getUserRole(user.id);

  if (!userRole || !allowedRoles.includes(userRole)) {
    redirect('/dashboard?error=insufficient_permissions');
  }

  return { user, role: userRole };
}

/**
 * Verifica que el usuario tenga un permiso específico
 */
export async function requirePermission(permission: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { userHasPermission } = await import('./roles');
  const hasPermission = await userHasPermission(user.id, permission);

  if (!hasPermission) {
    redirect('/dashboard?error=insufficient_permissions');
  }

  return user;
}

