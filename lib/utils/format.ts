/**
 * Utilidades para formateo de datos
 */

/**
 * Formatea una fecha en formato español
 * @param dateString - Fecha en formato string o null
 * @param options - Opciones de formateo
 * @returns Fecha formateada o "-" si es null
 */
export function formatDate(
  dateString: string | null | undefined,
  options?: {
    style?: "long" | "short" | "medium";
    includeTime?: boolean;
  }
): string {
  if (!dateString) return "-";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "-";

  const style = options?.style || "long";
  const includeTime = options?.includeTime || false;

  const dateOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: style === "long" ? "long" : style === "short" ? "short" : "numeric",
    day: "numeric",
    ...(includeTime && {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };

  return new Intl.DateTimeFormat("es-ES", dateOptions).format(date);
}

/**
 * Formatea un número como moneda en euros
 * @param amount - Cantidad a formatear o null
 * @param options - Opciones de formateo
 * @returns Moneda formateada o "-" si es null
 */
export function formatCurrency(
  amount: number | null | undefined,
  options?: {
    currency?: string;
    showZero?: boolean;
  }
): string {
  if (amount === null || amount === undefined) {
    return options?.showZero ? formatCurrency(0, options) : "-";
  }

  const currency = options?.currency || "EUR";
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Formatea un número con separadores de miles
 * @param number - Número a formatear
 * @param decimals - Número de decimales (por defecto 2)
 * @returns Número formateado
 */
export function formatNumber(
  number: number | null | undefined,
  decimals: number = 2
): string {
  if (number === null || number === undefined) return "-";
  return new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number);
}

/**
 * Formatea un porcentaje
 * @param value - Valor del porcentaje (0-100)
 * @param decimals - Número de decimales (por defecto 2)
 * @returns Porcentaje formateado
 */
export function formatPercentage(
  value: number | null | undefined,
  decimals: number = 2
): string {
  if (value === null || value === undefined) return "-";
  return `${formatNumber(value, decimals)}%`;
}

/**
 * Formatea un teléfono español
 * @param phone - Número de teléfono
 * @returns Teléfono formateado
 */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return "-";
  // Eliminar espacios y guiones
  const cleaned = phone.replace(/[\s-]/g, "");
  // Formatear como XXX XXX XXX
  if (cleaned.length === 9) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  return phone;
}


