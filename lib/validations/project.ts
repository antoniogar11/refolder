import { z } from "zod";

export const projectSchema = z.object({
  name: z.string().transform((v) => v || "Proyecto sin nombre"),
  client_id: z.string().transform((v) => v || null).nullable().optional(),
  description: z
    .string()
    .transform((v) => v || null),
  address: z.string().transform((v) => v || null).nullable().optional(),
  status: z.enum(["planning", "in_progress", "paused", "completed", "cancelled"], {
    error: "Selecciona un estado.",
  }),
  start_date: z
    .string()
    .transform((v) => v || null),
  estimated_end_date: z
    .string()
    .transform((v) => v || null),
  total_budget: z
    .string()
    .transform((v) => (v ? parseFloat(v) : null))
    .pipe(
      z.number().positive("El presupuesto debe ser positivo.").nullable(),
    ),
});

export type ProjectInput = z.input<typeof projectSchema>;
