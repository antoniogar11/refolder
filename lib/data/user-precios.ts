import { createClient } from "@/lib/supabase/server";
import type { UserPrecio } from "@/types";

/**
 * Stopwords en español para filtrar palabras irrelevantes.
 */
const STOP_WORDS = new Set([
  "de", "del", "la", "el", "en", "y", "con", "para", "por", "una", "un",
  "los", "las", "se", "que", "al", "es", "lo", "su", "a", "o", "e",
]);

/**
 * Extrae keywords significativas de un texto.
 */
function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\wáéíóúñü\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

/**
 * Busca precios del usuario relevantes para una descripción de trabajo.
 * Usa full-text search en español, igual que precios-referencia.
 */
export async function matchUserPricesForDescription(
  userId: string,
  descripcion: string,
  limit: number = 15,
): Promise<UserPrecio[]> {
  const supabase = await createClient();

  const keywords = extractKeywords(descripcion);
  if (keywords.length === 0) return [];

  // Buscar con las palabras clave más relevantes (máx 8)
  const searchQuery = keywords.slice(0, 8).join(" | ");

  const { data, error } = await supabase
    .from("user_precios")
    .select("*")
    .eq("user_id", userId)
    .textSearch("search_vector", searchQuery, { config: "spanish" })
    .order("veces_usado", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[matchUserPricesForDescription]", error);
    return [];
  }

  return data ?? [];
}

/**
 * Guarda o actualiza los precios del usuario a partir de las partidas de un presupuesto.
 * Usa UPSERT: si ya existe categoría+descripción, actualiza precio y suma veces_usado.
 */
export async function saveUserPricesFromPartidas(
  userId: string,
  partidas: {
    categoria: string;
    descripcion: string;
    unidad: string;
    precio_coste: number;
  }[],
): Promise<void> {
  const supabase = await createClient();

  for (const p of partidas) {
    if (!p.precio_coste || p.precio_coste <= 0) continue;

    // Intentar actualizar si ya existe
    const { data: existing } = await supabase
      .from("user_precios")
      .select("id, veces_usado")
      .eq("user_id", userId)
      .eq("categoria", p.categoria)
      .eq("descripcion", p.descripcion)
      .maybeSingle();

    if (existing) {
      // Actualizar precio y sumar uso
      await supabase
        .from("user_precios")
        .update({
          precio_coste: p.precio_coste,
          unidad: p.unidad,
          veces_usado: existing.veces_usado + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      // Insertar nuevo
      await supabase.from("user_precios").insert({
        user_id: userId,
        categoria: p.categoria,
        descripcion: p.descripcion,
        unidad: p.unidad,
        precio_coste: p.precio_coste,
        veces_usado: 1,
      });
    }
  }
}

/**
 * Construye una sección de texto para inyectar en el prompt de IA
 * con los precios habituales del usuario.
 */
export function buildUserPricesSection(precios: UserPrecio[]): string {
  if (precios.length === 0) return "";

  let section = "\n\nPRECIOS HABITUALES DE ESTE PROFESIONAL:\nEste usuario ha usado estos precios en presupuestos anteriores. Úsalos como referencia prioritaria cuando las partidas coincidan:\n";

  for (const p of precios) {
    section += `- ${p.descripcion} (${p.unidad}): ${Number(p.precio_coste).toFixed(2)} EUR`;
    if (p.veces_usado > 1) {
      section += ` (usado ${p.veces_usado} veces)`;
    }
    section += "\n";
  }

  section += "\nSi alguna partida del presupuesto coincide con estos precios habituales, usa el precio del usuario en vez del genérico del mercado.\n";

  return section;
}
