/**
 * Sistema centralizado de manejo de errores
 */

export type AppError = {
  code: string;
  message: string;
  details?: unknown;
};

export type ActionResult<T = unknown> = {
  status: "success" | "error";
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
};

/**
 * Crea un resultado de error estandarizado
 */
export function createError(
  code: string,
  message: string,
  details?: unknown
): AppError {
  return { code, message, details };
}

/**
 * Crea un resultado de acción con error
 */
export function createErrorResult(
  message: string,
  errors?: Record<string, string[]>
): ActionResult {
  return {
    status: "error",
    message,
    errors,
  };
}

/**
 * Crea un resultado de acción con éxito
 */
export function createSuccessResult<T>(
  data?: T,
  message?: string
): ActionResult<T> {
  return {
    status: "success",
    message,
    data,
  };
}

/**
 * Errores comunes de la aplicación
 */
export const AppErrors = {
  UNAUTHORIZED: createError(
    "UNAUTHORIZED",
    "No estás autenticado. Por favor, inicia sesión."
  ),
  FORBIDDEN: createError(
    "FORBIDDEN",
    "No tienes permisos para realizar esta acción."
  ),
  NOT_FOUND: createError("NOT_FOUND", "Recurso no encontrado."),
  VALIDATION_ERROR: createError(
    "VALIDATION_ERROR",
    "Los datos proporcionados no son válidos."
  ),
  DATABASE_ERROR: createError(
    "DATABASE_ERROR",
    "Error al acceder a la base de datos."
  ),
  NETWORK_ERROR: createError(
    "NETWORK_ERROR",
    "Error de conexión. Por favor, intenta de nuevo."
  ),
  UNKNOWN_ERROR: createError(
    "UNKNOWN_ERROR",
    "Ha ocurrido un error inesperado."
  ),
} as const;

/**
 * Convierte un error de Supabase a un error de la aplicación
 */
export function handleSupabaseError(error: unknown): AppError {
  if (error && typeof error === "object" && "message" in error) {
    const supabaseError = error as { message: string; code?: string };
    return createError(
      supabaseError.code || "DATABASE_ERROR",
      supabaseError.message || AppErrors.DATABASE_ERROR.message,
      error
    );
  }
  return AppErrors.UNKNOWN_ERROR;
}

/**
 * Convierte un error a un mensaje legible para el usuario
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return AppErrors.UNKNOWN_ERROR.message;
}

/**
 * Verifica si un error es de un tipo específico
 */
export function isErrorType(error: unknown, code: string): boolean {
  if (error && typeof error === "object" && "code" in error) {
    return (error as { code: string }).code === code;
  }
  return false;
}

