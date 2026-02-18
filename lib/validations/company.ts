import { z } from "zod";

export const companySchema = z.object({
  name: z.string().min(1, "El nombre de la empresa es obligatorio."),
  tax_id: z
    .string()
    .or(z.literal(""))
    .transform((v) => v || null),
  address: z
    .string()
    .or(z.literal(""))
    .transform((v) => v || null),
  city: z
    .string()
    .or(z.literal(""))
    .transform((v) => v || null),
  province: z
    .string()
    .or(z.literal(""))
    .transform((v) => v || null),
  postal_code: z
    .string()
    .regex(/^\d{5}$/, "El código postal debe tener 5 dígitos.")
    .or(z.literal(""))
    .transform((v) => v || null),
  phone: z
    .string()
    .or(z.literal(""))
    .transform((v) => v || null),
  email: z
    .string()
    .email("Formato de email inválido.")
    .or(z.literal(""))
    .transform((v) => v || null),
  subtitle: z
    .string()
    .or(z.literal(""))
    .transform((v) => v || null),
});
