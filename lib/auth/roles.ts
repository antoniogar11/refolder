/**
 * Sistema de roles y permisos - Server Side
 * Para uso en componentes cliente, importa desde @/lib/auth/roles-client
 */

// Re-exportar tipos y constantes desde el archivo cliente-safe
export type { UserRole } from './roles-client';
export { ROLES, getAvailableRoles, getRoleInfo } from './roles-client';
import type { UserRole } from './roles-client';
import { ROLES } from './roles-client';

/**
 * Obtiene el rol de un usuario
 */
export async function getUserRole(userId: string): Promise<UserRole | null> {
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    // Si no tiene rol asignado, devolver 'user' por defecto
    return 'user';
  }

  return data.role as UserRole;
}

/**
 * Verifica si un usuario tiene un rol específico
 */
export async function userHasRole(userId: string, role: UserRole): Promise<boolean> {
  const userRole = await getUserRole(userId);
  return userRole === role;
}

/**
 * Verifica si un usuario tiene un permiso específico
 */
export async function userHasPermission(userId: string, permission: string): Promise<boolean> {
  const role = await getUserRole(userId);
  if (!role) return false;

  const rolePermissions = ROLES[role].permissions;
  
  // Verificar permiso exacto
  if (rolePermissions.includes(permission)) {
    return true;
  }

  // Verificar permiso con wildcard (ej: 'projects:*' incluye 'projects:read')
  const [resource] = permission.split(':');
  if (rolePermissions.includes(`${resource}:*`)) {
    return true;
  }

  return false;
}

/**
 * Verifica si un usuario puede realizar una acción en un recurso
 */
export async function canPerformAction(
  userId: string,
  resource: string,
  action: 'read' | 'write' | 'delete'
): Promise<boolean> {
  const permission = `${resource}:${action}`;
  return userHasPermission(userId, permission);
}


