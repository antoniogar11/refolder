import { z } from "zod";

export const workerRateSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio."),
  tarifa_hora: z
    .string()
    .min(1, "La tarifa es obligatoria.")
    .transform((v) => parseFloat(v))
    .pipe(z.number().positive("La tarifa debe ser positiva.")),
});

export type WorkerRateInput = z.input<typeof workerRateSchema>;
