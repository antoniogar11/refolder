import { z } from "zod";

export const projectHourSchema = z.object({
  descripcion: z.string().min(1, "La descripción es obligatoria."),
  categoria_trabajador: z.string().min(1, "Selecciona un tipo de trabajador."),
  tarifa_hora: z
    .string()
    .min(1, "La tarifa es obligatoria.")
    .transform((v) => parseFloat(v))
    .pipe(z.number().positive("La tarifa debe ser positiva.")),
  horas: z
    .string()
    .min(1, "Las horas son obligatorias.")
    .transform((v) => parseFloat(v))
    .pipe(z.number().positive("Las horas deben ser positivas.")),
  fecha: z.string().min(1, "La fecha es obligatoria."),
  notas: z.string().transform((v) => v || null),
});

export type ProjectHourInput = z.input<typeof projectHourSchema>;
