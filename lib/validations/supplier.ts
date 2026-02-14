import { z } from "zod";

export const supplierSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio."),
  type: z.enum(["material", "labor", "service", "other"]),
  contact_name: z.string().or(z.literal("")).transform((v) => v || null),
  email: z
    .string()
    .email("Formato de email inválido.")
    .or(z.literal(""))
    .transform((v) => v || null),
  phone: z
    .string()
    .min(6, "El teléfono es demasiado corto.")
    .or(z.literal(""))
    .transform((v) => v || null),
  address: z.string().or(z.literal("")).transform((v) => v || null),
  city: z.string().or(z.literal("")).transform((v) => v || null),
  tax_id: z.string().or(z.literal("")).transform((v) => v || null),
  notes: z.string().or(z.literal("")).transform((v) => v || null),
});
