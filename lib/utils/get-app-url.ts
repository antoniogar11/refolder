/**
 * Obtiene la URL de la aplicación
 * Usa NEXT_PUBLIC_APP_URL si está definida, sino usa localhost por defecto
 * 
 * Para probar desde móvil, actualiza .env.local:
 * NEXT_PUBLIC_APP_URL=http://192.168.0.21:3000
 */
export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
}

