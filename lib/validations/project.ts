import { z } from "zod";

export const projectSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio."),
  client_id: z.string().min(1, "Selecciona un cliente."),
  description: z
    .string()
    .transform((v) => v || null),
  address: z.string().min(1, "La dirección es obligatoria."),
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
