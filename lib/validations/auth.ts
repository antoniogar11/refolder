import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es obligatorio.")
    .min(3, "El nombre debe tener al menos 3 caracteres."),
  email: z
    .string()
    .min(1, "El email es obligatorio.")
    .email("Formato de email inválido.")
    .transform((v) => v.toLowerCase()),
  password: z
    .string()
    .min(1, "La contraseña es obligatoria.")
    .min(6, "La contraseña debe tener al menos 6 caracteres."),
});

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El email es obligatorio.")
    .email("Formato de email inválido.")
    .transform((v) => v.toLowerCase()),
  password: z.string().min(1, "La contraseña es obligatoria."),
});
