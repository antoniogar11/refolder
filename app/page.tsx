import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  Building2,
  Sparkles,
  FileDown,
  Check,
  ArrowRight,
  Clock,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-slate-900 flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                Refolder
              </span>
            </div>
            <nav className="flex items-center gap-3">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  Iniciar sesión
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">Empezar gratis</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <section className="py-16 lg:py-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            <span>Presupuestos claros y rápidos para tus obras</span>
          </div>
          <h1 className="mb-6 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight max-w-4xl mx-auto">
            <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-200 dark:to-slate-300 bg-clip-text text-transparent">
              Presupuesta mejor y controla el dinero de cada obra
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-4">
            Genera presupuestos profesionales en minutos y sigue el coste real
            de cada proyecto sin pelearte con Excel.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button className="text-lg px-8 py-6 bg-amber-500 hover:bg-amber-600 text-white">
                Crear cuenta gratuita
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" className="px-6 py-6">
                Ver ejemplo de panel
              </Button>
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="py-16">
          <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-3">
            Lo básico para llevar tus obras al día
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-2 hover:border-slate-300 dark:hover:border-slate-700 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                  <Users className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                </div>
                <CardTitle className="text-lg">Gestión de clientes</CardTitle>
                <CardDescription className="text-sm">
                  Ten en un mismo sitio los datos de tus clientes y sus obras.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-amber-200 dark:hover:border-amber-800 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center mb-3">
                  <Building2 className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <CardTitle className="text-lg">Control de proyectos</CardTitle>
                <CardDescription className="text-sm">
                  Apunta gastos, ingresos y estado de cada obra sin complicarte.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-amber-300 dark:hover:border-amber-700 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-3">
                  <Sparkles className="h-6 w-6 text-amber-700 dark:text-amber-400" />
                </div>
                <CardTitle className="text-lg">Presupuestos con IA</CardTitle>
                <CardDescription className="text-sm">
                  Escribe en lenguaje natural y deja que te proponga partidas
                  que luego puedes ajustar.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center mb-3">
                  <FileDown className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <CardTitle className="text-lg">PDF listo para enviar</CardTitle>
                <CardDescription className="text-sm">
                  Descarga un presupuesto limpio y ordenado para mandarlo por
                  email o WhatsApp.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* Cómo funciona */}
        <section className="py-16">
          <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-10">
            Cómo se usa en el día a día
          </h2>
          <div className="grid gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="mx-auto h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center text-lg font-bold mb-3">
                1
              </div>
              <p className="font-semibold text-slate-900 dark:text-white mb-1">
                Creas el cliente
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Guardas sus datos básicos y lo dejas listo para futuras obras.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center text-lg font-bold mb-3">
                2
              </div>
              <p className="font-semibold text-slate-900 dark:text-white mb-1">
                Describes la reforma
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Tipo de trabajo, metros y detalles principales.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center text-lg font-bold mb-3">
                3
              </div>
              <p className="font-semibold text-slate-900 dark:text-white mb-1">
                Generas el presupuesto
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Revisas partidas, ajustas precios y descargas el PDF.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-10 w-10 rounded-full bg-amber-500 text-white flex items-center justify-center text-lg font-bold mb-3">
                4
              </div>
              <p className="font-semibold text-slate-900 dark:text-white mb-1">
                Sigues la obra
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Apuntas gastos e ingresos y ves si la obra va bien o se está
                yendo de presupuesto.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-16">
          <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-4">
            Planes pensados para empezar rápido
          </h2>
          <p className="text-center text-slate-600 dark:text-slate-400 mb-12">
            Empieza gratis, valida si encaja en tu forma de trabajar y solo
            paga cuando lo uses de verdad en el día a día.
          </p>
          <div className="grid gap-8 md:grid-cols-2 max-w-3xl mx-auto">
            {/* Free plan */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-xl">Gratis</CardTitle>
                <div className="mt-2">
                  <span className="text-4xl font-bold">0€</span>
                  <span className="text-slate-500">/mes</span>
                </div>
                <CardDescription>
                  Para probar Refolder con tus primeros proyectos.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span>Hasta 3 presupuestos al mes</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span>Gestión básica de clientes y proyectos</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span>Exportación PDF sencilla</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span>1 usuario</span>
                </div>
                <Link href="/auth/register" className="block pt-4">
                  <Button variant="outline" className="w-full">
                    Empezar gratis
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Pro plan */}
            <Card className="border-2 border-amber-500 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                Recomendado para el día a día
              </div>
              <CardHeader>
                <CardTitle className="text-xl">Pro</CardTitle>
                <div className="mt-2">
                  <span className="text-4xl font-bold">19,90€</span>
                  <span className="text-slate-500">/mes</span>
                </div>
                <CardDescription>Para profesionales que viven de la obra.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  <span>Presupuestos e IA ilimitados</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  <span>Control de costes detallado por proyecto</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  <span>Registro de horas de mano de obra</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  <span>Histórico completo de clientes, proyectos y obras</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  <span>Soporte prioritario</span>
                </div>
                <Link href="/auth/register" className="block pt-4">
                  <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                    Empezar prueba gratuita
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA final */}
        <section className="py-16 text-center">
          <div className="rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">
              Haz tu próximo presupuesto con Refolder
            </h2>
            <p className="text-slate-300 mb-8 max-w-xl mx-auto">
              Prueba Refolder en tu próxima reforma y compara cuánto tardas en
              hacer el presupuesto y qué visibilidad tienes sobre el beneficio
              de la obra.
            </p>
            <Link href="/auth/register">
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8 py-6 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold"
              >
                Crear cuenta gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <p className="mt-4 text-xs text-slate-400">
              Si no te encaja, puedes borrar tu cuenta en cualquier momento.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm mt-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-slate-500 dark:text-slate-400">
            <p>&copy; 2026 Refolder. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
