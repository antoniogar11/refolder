import { z } from "zod";

export const supplierSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio."),
  type: z.enum(["material", "labor", "service", "other"], {
    error: "Selecciona un tipo de proveedor.",
  }),
  contact_name: z
    .string()
    .transform((v) => v || null),
  phone: z
    .string()
    .min(6, "El teléfono es demasiado corto.")
    .or(z.literal(""))
    .transform((v) => v || null),
  email: z
    .string()
    .email("Formato de email inválido.")
    .or(z.literal(""))
    .transform((v) => v || null),
  address: z
    .string()
    .transform((v) => v || null),
  city: z
    .string()
    .transform((v) => v || null),
  tax_id: z
    .string()
    .transform((v) => v || null),
  notes: z
    .string()
    .transform((v) => v || null),
});

export type SupplierInput = z.input<typeof supplierSchema>;
