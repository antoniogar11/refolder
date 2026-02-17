import { throwQueryError } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";
import type { PrecioReferencia } from "@/types";

/**
 * Busca precios de referencia usando búsqueda full-text en español.
 */
export async function searchPreciosReferencia(
  query: string,
  limit: number = 10
): Promise<PrecioReferencia[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("precios_referencia")
    .select("*")
    .textSearch("search_vector", query, { type: "websearch", config: "spanish" })
    .limit(limit);

  if (error) throwQueryError("searchPreciosReferencia", error);
  return data ?? [];
}

/**
 * Obtiene precios de referencia filtrados por categoría.
 */
export async function getPreciosByCategoria(
  categoria: string
): Promise<PrecioReferencia[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("precios_referencia")
    .select("*")
    .eq("categoria", categoria)
    .order("descripcion");

  if (error) throwQueryError("getPreciosByCategoria", error);
  return data ?? [];
}

/**
 * Busca precios de referencia relevantes para una descripción de obra.
 * Extrae palabras clave y busca coincidencias para enriquecer el prompt de IA.
 */
export async function matchPreciosForDescription(
  descripcion: string,
  limit: number = 30
): Promise<PrecioReferencia[]> {
  const supabase = await createClient();

  // Extraer palabras clave significativas (ignorar palabras cortas y comunes)
  const stopWords = new Set([
    "de", "del", "la", "el", "en", "y", "con", "para", "por", "una", "un",
    "los", "las", "se", "que", "al", "es", "lo", "su", "a", "o", "e",
  ]);

  const keywords = descripcion
    .toLowerCase()
    .replace(/[^\wáéíóúñü\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  if (keywords.length === 0) return [];

  // Buscar con las palabras clave más relevantes (máx 8)
  const searchQuery = keywords.slice(0, 8).join(" | ");

  const { data, error } = await supabase
    .from("precios_referencia")
    .select("*")
    .textSearch("search_vector", searchQuery, { config: "spanish" })
    .limit(limit);

  if (error) {
    console.error("[matchPreciosForDescription]", error);
    return [];
  }

  return data ?? [];
}

/**
 * Obtiene todas las categorías disponibles en la tabla de precios.
 */
export async function getAllCategorias(): Promise<string[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("precios_referencia")
    .select("categoria")
    .order("categoria");

  if (error) throwQueryError("getAllCategorias", error);

  const unique = [...new Set((data ?? []).map((d) => d.categoria))];
  return unique;
}
