/**
 * Utilidades para validación de datos
 */

/**
 * Valida un email
 * @param email - Email a validar
 * @returns true si es válido, false en caso contrario
 */
export function isValidEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.toLowerCase());
}

/**
 * Valida un teléfono español
 * @param phone - Teléfono a validar
 * @param minLength - Longitud mínima (por defecto 6)
 * @returns true si es válido, false en caso contrario
 */
export function isValidPhone(
  phone: string | null | undefined,
  minLength: number = 6
): boolean {
  if (!phone) return false;
  const cleaned = phone.replace(/[\s-]/g, "");
  return cleaned.length >= minLength && /^\d+$/.test(cleaned);
}

/**
 * Valida un código postal español
 * @param postalCode - Código postal a validar
 * @returns true si es válido, false en caso contrario
 */
export function isValidPostalCode(
  postalCode: string | null | undefined
): boolean {
  if (!postalCode) return false;
  return /^\d{5}$/.test(postalCode.trim());
}

/**
 * Valida un número positivo
 * @param value - Valor a validar
 * @param min - Valor mínimo (por defecto 0)
 * @param max - Valor máximo (opcional)
 * @returns true si es válido, false en caso contrario
 */
export function isValidNumber(
  value: string | number | null | undefined,
  min: number = 0,
  max?: number
): boolean {
  if (value === null || value === undefined) return false;
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return false;
  if (num < min) return false;
  if (max !== undefined && num > max) return false;
  return true;
}

/**
 * Valida un porcentaje (0-100)
 * @param value - Valor a validar
 * @returns true si es válido, false en caso contrario
 */
export function isValidPercentage(
  value: string | number | null | undefined
): boolean {
  return isValidNumber(value, 0, 100);
}

/**
 * Valida que una fecha sea posterior a otra
 * @param date1 - Primera fecha
 * @param date2 - Segunda fecha
 * @returns true si date1 es posterior a date2
 */
export function isDateAfter(
  date1: string | Date | null | undefined,
  date2: string | Date | null | undefined
): boolean {
  if (!date1 || !date2) return false;
  const d1 = typeof date1 === "string" ? new Date(date1) : date1;
  const d2 = typeof date2 === "string" ? new Date(date2) : date2;
  return d1 > d2;
}

/**
 * Valida que una fecha sea anterior a otra
 * @param date1 - Primera fecha
 * @param date2 - Segunda fecha
 * @returns true si date1 es anterior a date2
 */
export function isDateBefore(
  date1: string | Date | null | undefined,
  date2: string | Date | null | undefined
): boolean {
  if (!date1 || !date2) return false;
  const d1 = typeof date1 === "string" ? new Date(date1) : date1;
  const d2 = typeof date2 === "string" ? new Date(date2) : date2;
  return d1 < d2;
}

/**
 * Valida que un string no esté vacío
 * @param value - Valor a validar
 * @param trim - Si debe hacer trim antes de validar (por defecto true)
 * @returns true si no está vacío, false en caso contrario
 */
export function isNotEmpty(
  value: string | null | undefined,
  trim: boolean = true
): boolean {
  if (!value) return false;
  return trim ? value.trim().length > 0 : value.length > 0;
}

/**
 * Valida que un valor esté en una lista de valores permitidos
 * @param value - Valor a validar
 * @param allowedValues - Lista de valores permitidos
 * @returns true si está en la lista, false en caso contrario
 */
export function isInList<T>(
  value: T | null | undefined,
  allowedValues: readonly T[]
): boolean {
  if (value === null || value === undefined) return false;
  return allowedValues.includes(value);
}

/**
 * Obtiene un valor de FormData de forma segura
 * @param formData - FormData
 * @param key - Clave
 * @param defaultValue - Valor por defecto
 * @returns Valor del FormData o valor por defecto
 */
export function getFormDataValue(
  formData: FormData,
  key: string,
  defaultValue: string = ""
): string {
  return (formData.get(key) as string | null)?.trim() ?? defaultValue;
}

/**
 * Obtiene un número de FormData de forma segura
 * @param formData - FormData
 * @param key - Clave
 * @param defaultValue - Valor por defecto
 * @returns Número del FormData o valor por defecto
 */
export function getFormDataNumber(
  formData: FormData,
  key: string,
  defaultValue: number | null = null
): number | null {
  const value = getFormDataValue(formData, key);
  if (!value) return defaultValue;
  const num = parseFloat(value);
  return isNaN(num) ? defaultValue : num;
}

/**
 * Obtiene un booleano de FormData de forma segura
 * @param formData - FormData
 * @param key - Clave
 * @returns true si el valor es "true", "on" o "1", false en caso contrario
 */
export function getFormDataBoolean(formData: FormData, key: string): boolean {
  const value = formData.get(key);
  return value === "true" || value === "on" || value === "1";
}

