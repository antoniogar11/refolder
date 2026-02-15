import { z } from "zod";

const gastoCategorias = ["material", "mano_de_obra", "subcontrata", "transporte", "otros"] as const;
const ingresoCategorias = ["pago_cliente", "certificacion", "otros"] as const;

export const projectCostSchema = z.object({
  descripcion: z.string().min(1, "La descripción es obligatoria."),
  categoria: z.enum([...gastoCategorias, ...ingresoCategorias], {
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
  tipo: z.enum(["gasto", "ingreso"]).default("gasto"),
});

export type ProjectCostInput = z.input<typeof projectCostSchema>;

export const GASTO_CATEGORIAS = gastoCategorias;
export const INGRESO_CATEGORIAS = ingresoCategorias;

export const CATEGORIA_LABELS: Record<string, string> = {
  material: "Material",
  mano_de_obra: "Mano de obra",
  subcontrata: "Subcontrata",
  transporte: "Transporte",
  otros: "Otros",
  pago_cliente: "Pago de cliente",
  certificacion: "Certificación",
};
