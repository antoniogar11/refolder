/**
 * Convierte un FormData en un objeto plano de strings,
 * aplicando trim a cada valor.
 */
export function parseFormData(formData: FormData): Record<string, string> {
  const result: Record<string, string> = {};
  formData.forEach((value, key) => {
    result[key] = typeof value === "string" ? value.trim() : "";
  });
  return result;
}
