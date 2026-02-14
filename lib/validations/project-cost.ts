import { z } from "zod";

export const projectCostSchema = z.object({
  descripcion: z.string().min(1, "La descripción es obligatoria."),
  categoria: z.enum(["material", "mano_de_obra", "subcontrata", "transporte", "otros"], {
    error: "Selecciona una categoría.",
  }),
  importe: z
    .string()
    .min(1, "El importe es obligatorio.")
    .transform((v) => parseFloat(v))
    .pipe(z.number().positive("El importe debe ser positivo.")),
  fecha: z
    .string()
    .min(1, "La fecha es obligatoria."),
  notas: z
    .string()
    .transform((v) => v || null),
});

export type ProjectCostInput = z.input<typeof projectCostSchema>;
