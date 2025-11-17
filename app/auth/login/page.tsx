import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Iniciar Sesión</CardTitle>
          <CardDescription>
            Ingresa tus credenciales para acceder a Refolder
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <LoginForm />
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            ¿No tienes cuenta?{" "}
            <Link href="/auth/register" className="text-blue-600 hover:underline dark:text-blue-400">
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

