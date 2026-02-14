import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-amber-50/30 dark:from-slate-900 dark:to-slate-800 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Crear Cuenta</CardTitle>
          <CardDescription>
            Regístrate para comenzar a usar Refolder
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RegisterForm />
          <div className="text-center text-sm text-slate-600 dark:text-slate-400">
            ¿Ya tienes cuenta?{" "}
            <Link href="/auth/login" className="text-amber-600 hover:text-amber-700 hover:underline dark:text-amber-400">
              Inicia sesión aquí
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
