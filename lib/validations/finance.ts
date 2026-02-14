import { z } from "zod";

export const financeTransactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  category: z.string().min(1, "La categoría es obligatoria."),
  description: z.string().min(1, "La descripción es obligatoria."),
  amount: z
    .string()
    .transform((v) => parseFloat(v))
    .pipe(z.number().positive("El importe debe ser mayor que 0.")),
  transaction_date: z.string().min(1, "La fecha es obligatoria."),
  payment_method: z.string().or(z.literal("")).transform((v) => v || null),
  reference: z.string().or(z.literal("")).transform((v) => v || null),
  notes: z.string().or(z.literal("")).transform((v) => v || null),
  project_id: z.string().or(z.literal("")).transform((v) => v || null),
  client_id: z.string().or(z.literal("")).transform((v) => v || null),
});
