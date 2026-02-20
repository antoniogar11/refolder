import { z } from "zod";

export const estimateSchema = z.object({
  name: z.string().transform((v) => v || "Presupuesto sin nombre"),
  project_id: z.string().transform((v) => v || null).nullable().optional(),
  client_id: z.string().transform((v) => v || null).nullable().optional(),
  description: z
    .string()
    .transform((v) => v || null),
  total_amount: z
    .string()
    .transform((v) => v ? parseFloat(v) : 0)
    .pipe(z.number().min(0, "El importe debe ser positivo.")),
  status: z.enum(["draft", "sent", "accepted", "rejected"], {
    error: "Selecciona un estado.",
  }),
  valid_until: z
    .string()
    .transform((v) => v || null),
});

export type EstimateInput = z.input<typeof estimateSchema>;
