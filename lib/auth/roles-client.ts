/**
 * Sistema de roles y permisos - Cliente Safe
 * Este archivo contiene solo tipos y constantes que pueden ser usados en componentes cliente
 */

export type UserRole = 'admin' | 'manager' | 'user' | 'viewer';

export const ROLES: Record<UserRole, { label: string; description: string; permissions: string[] }> = {
  admin: {
    label: 'Administrador',
    description: 'Acceso completo al sistema. Puede gestionar usuarios, roles y todos los recursos.',
    permissions: [
      'users:read',
      'users:write',
      'users:delete',
      'roles:read',
      'roles:write',
      'projects:read',
      'projects:write',
      'projects:delete',
      'clients:read',
      'clients:write',
      'clients:delete',
      'finances:read',
      'finances:write',
      'finances:delete',
      'tasks:read',
      'tasks:write',
      'tasks:delete',
    ],
  },
  manager: {
    label: 'Gestor',
    description: 'Puede gestionar proyectos, clientes y finanzas. No puede gestionar usuarios ni roles.',
    permissions: [
      'projects:read',
      'projects:write',
      'projects:delete',
      'clients:read',
      'clients:write',
      'clients:delete',
      'finances:read',
      'finances:write',
      'finances:delete',
      'tasks:read',
      'tasks:write',
      'tasks:delete',
    ],
  },
  user: {
    label: 'Usuario',
    description: 'Puede ver y editar sus propios proyectos y recursos asignados.',
    permissions: [
      'projects:read',
      'projects:write',
      'clients:read',
      'clients:write',
      'finances:read',
      'finances:write',
      'tasks:read',
      'tasks:write',
    ],
  },
  viewer: {
    label: 'Visualizador',
    description: 'Solo puede ver información. No puede crear ni editar recursos.',
    permissions: [
      'projects:read',
      'clients:read',
      'finances:read',
      'tasks:read',
    ],
  },
};

/**
 * Obtiene todos los roles disponibles
 */
export function getAvailableRoles(): UserRole[] {
  return Object.keys(ROLES) as UserRole[];
}

/**
 * Obtiene información de un rol
 */
export function getRoleInfo(role: UserRole) {
  return ROLES[role];
}

