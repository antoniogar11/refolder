/**
 * Custom error class for data layer errors.
 * Thrown from lib/data/ functions so that Next.js error boundaries (error.tsx) catch them.
 */
export class DataLayerError extends Error {
  code: "UNAUTHENTICATED" | "NOT_FOUND" | "QUERY_ERROR" | "UNKNOWN";
  context?: string;

  constructor(
    code: DataLayerError["code"],
    message: string,
    context?: string,
  ) {
    super(message);
    this.name = "DataLayerError";
    this.code = code;
    this.context = context;
  }
}

/**
 * Logs and throws a DataLayerError. Use this in data layer functions
 * when a Supabase query fails, so the error bubbles up to error.tsx.
 */
export function throwQueryError(
  context: string,
  error: { message: string; code?: string },
): never {
  console.error(`[DataLayer] ${context}:`, error);
  throw new DataLayerError("QUERY_ERROR", error.message, context);
}
