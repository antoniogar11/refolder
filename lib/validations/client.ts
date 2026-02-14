import { z } from "zod";

export const clientSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio."),
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
  address: z
    .string()
    .transform((v) => v || null),
  city: z
    .string()
    .transform((v) => v || null),
  province: z
    .string()
    .transform((v) => v || null),
  postal_code: z
    .string()
    .regex(/^\d{5}$/, "El código postal debe tener 5 dígitos.")
    .or(z.literal(""))
    .transform((v) => v || null),
  tax_id: z
    .string()
    .transform((v) => v || null),
  notes: z
    .string()
    .transform((v) => v || null),
});

export type ClientInput = z.input<typeof clientSchema>;
