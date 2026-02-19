import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  Building2,
  FileDown,
  ArrowRight,
  Euro,
  Clock,
  ClipboardList,
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
          <h1 className="mb-6 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight max-w-4xl mx-auto">
            <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-200 dark:to-slate-300 bg-clip-text text-transparent">
              Deja de hacer presupuestos en Excel
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8">
            Refolder te ayuda a montar presupuestos de obra, exportarlos en PDF
            y después controlar si la obra te está saliendo rentable o no.
          </p>
          <Link href="/auth/register">
            <Button className="text-lg px-8 py-6 bg-amber-500 hover:bg-amber-600 text-white">
              Crear cuenta gratis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </section>

        {/* Features */}
        <section className="py-16">
          <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-10">
            Qué puedes hacer con Refolder
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-2 hover:border-slate-300 dark:hover:border-slate-700 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center mb-3">
                  <ClipboardList className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <CardTitle className="text-lg">Presupuestos rápidos</CardTitle>
                <CardDescription className="text-sm">
                  Describe la reforma y te genera las partidas con precios de
                  referencia. Tú ajustas lo que haga falta y listo.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center mb-3">
                  <FileDown className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <CardTitle className="text-lg">PDF para el cliente</CardTitle>
                <CardDescription className="text-sm">
                  Exporta el presupuesto en PDF con tus datos de empresa,
                  partidas desglosadas e IVA. Listo para enviar.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-amber-200 dark:hover:border-amber-800 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center mb-3">
                  <Euro className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <CardTitle className="text-lg">Control de costes</CardTitle>
                <CardDescription className="text-sm">
                  Apunta gastos e ingresos de cada obra y ve en tiempo real si
                  vas ganando o perdiendo dinero.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-slate-300 dark:hover:border-slate-700 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                  <Clock className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                </div>
                <CardTitle className="text-lg">Horas de mano de obra</CardTitle>
                <CardDescription className="text-sm">
                  Registra horas por trabajador con su tarifa. Sabes cuánto te
                  está costando la mano de obra en cada proyecto.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-slate-300 dark:hover:border-slate-700 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                  <Users className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                </div>
                <CardTitle className="text-lg">Clientes organizados</CardTitle>
                <CardDescription className="text-sm">
                  Todos tus clientes con sus datos, obras anteriores y
                  presupuestos en un mismo sitio.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-slate-300 dark:hover:border-slate-700 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                  <Building2 className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                </div>
                <CardTitle className="text-lg">Proyectos claros</CardTitle>
                <CardDescription className="text-sm">
                  Cada obra con su presupuesto, sus gastos, sus horas y su
                  estado. Todo junto, sin hojas de cálculo.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* Cómo funciona */}
        <section className="py-16">
          <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-10">
            Así de simple
          </h2>
          <div className="grid gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="mx-auto h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center text-lg font-bold mb-3">
                1
              </div>
              <p className="font-semibold text-slate-900 dark:text-white mb-1">
                Añades el cliente
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Nombre, teléfono, dirección. Lo básico.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center text-lg font-bold mb-3">
                2
              </div>
              <p className="font-semibold text-slate-900 dark:text-white mb-1">
                Describes la obra
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Qué hay que hacer, metros, tipo de reforma.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center text-lg font-bold mb-3">
                3
              </div>
              <p className="font-semibold text-slate-900 dark:text-white mb-1">
                Sacas el presupuesto
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Ajustas precios si quieres y lo descargas en PDF.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-10 w-10 rounded-full bg-amber-500 text-white flex items-center justify-center text-lg font-bold mb-3">
                4
              </div>
              <p className="font-semibold text-slate-900 dark:text-white mb-1">
                Controlas la obra
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Vas apuntando gastos y horas para saber si la obra te sale
                rentable.
              </p>
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="py-16 text-center">
          <div className="rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">
              Pruébalo con tu próxima reforma
            </h2>
            <p className="text-slate-300 mb-8 max-w-xl mx-auto">
              Crea tu cuenta, monta un presupuesto y decide si te compensa.
              Sin compromiso, sin tarjeta.
            </p>
            <Link href="/auth/register">
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8 py-6 bg-amber-500 hover:bg-amber-600 text-white font-semibold"
              >
                Crear cuenta gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
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
