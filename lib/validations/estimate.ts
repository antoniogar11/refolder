import { z } from "zod";

export const estimateSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio."),
  project_id: z.string().min(1, "Selecciona una obra."),
  description: z
    .string()
    .transform((v) => v || null),
  total_amount: z
    .string()
    .min(1, "El importe es obligatorio.")
    .transform((v) => parseFloat(v))
    .pipe(z.number().positive("El importe debe ser positivo.")),
  status: z.enum(["draft", "sent", "accepted", "rejected"], {
    error: "Selecciona un estado.",
  }),
  valid_until: z
    .string()
    .transform((v) => v || null),
});

export type EstimateInput = z.input<typeof estimateSchema>;
