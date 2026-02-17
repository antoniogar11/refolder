import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Redondea a 2 decimales (para importes monetarios). */
export function roundCurrency(amount: number): number {
  return Math.round(amount * 100) / 100;
}

export function formatDuration(minutes: number | null): string {
  if (minutes === null) return "En curso";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours} h`;
  return `${hours} h ${mins} min`;
}

/**
 * Calcula el precio de venta a partir de coste y margen.
 * @param cost - Precio de coste
 * @param marginPercent - Margen en porcentaje (ej: 20 para 20%)
 * @returns Precio de venta redondeado a 2 decimales
 */
export function computeSellingPrice(cost: number, marginPercent: number): number {
  return roundCurrency(cost * (1 + marginPercent / 100));
}
