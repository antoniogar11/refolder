import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoginForm } from "@/components/auth/login-form";

type LoginPageProps = {
  searchParams: Promise<{ confirmed?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const emailConfirmed = params.confirmed === "true";
  const hasError = params.error === "invalid_token";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-amber-50/30 dark:from-slate-900 dark:to-slate-800 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Iniciar Sesión</CardTitle>
          <CardDescription>
            Ingresa tus credenciales para acceder a Refolder
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {emailConfirmed && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
              <p className="text-sm font-medium text-green-800 dark:text-green-300">
                ✅ Email confirmado correctamente
              </p>
              <p className="mt-1 text-sm text-green-700 dark:text-green-400">
                Ya puedes iniciar sesión con tus credenciales.
              </p>
            </div>
          )}
          {hasError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
              <p className="text-sm font-medium text-red-800 dark:text-red-300">
                ❌ Error al confirmar el email
              </p>
              <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                El enlace de confirmación no es válido o ha expirado. Por favor, solicita un nuevo enlace.
              </p>
            </div>
          )}
          <LoginForm />
          <div className="text-center text-sm text-slate-600 dark:text-slate-400">
            ¿No tienes cuenta?{" "}
            <Link href="/auth/register" className="text-amber-600 hover:text-amber-700 hover:underline dark:text-amber-400">
              Regístrate aquí
            </Link>
          </div>
          <div className="pt-4">
            <Link href="/">
              <Button variant="ghost" className="w-full">
                Volver al Inicio
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
