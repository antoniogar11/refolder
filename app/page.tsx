import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, Sparkles, FileDown, Check, ArrowRight, Clock } from "lucide-react";

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
                <Button variant="ghost" size="sm">Iniciar Sesión</Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">Registrarse Gratis</Button>
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
            <span>Presupuestos con Inteligencia Artificial</span>
          </div>
          <h1 className="mb-6 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight max-w-4xl mx-auto">
            <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-200 dark:to-slate-300 bg-clip-text text-transparent">
              Presupuesta con IA y controla tus obras en tiempo real
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8">
            Genera presupuestos con IA en minutos, registra gastos e ingresos por proyecto y compara el coste real con lo presupuestado. Todo en una sola plataforma.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="text-lg px-8 py-6 bg-amber-500 hover:bg-amber-600 text-white">
                Empezar Gratis <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="py-16">
          <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-12">
            Todo lo que necesitas para presupuestar y controlar tus obras
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-2 hover:border-slate-300 dark:hover:border-slate-700 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                  <Users className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                </div>
                <CardTitle className="text-lg">Gestión de Clientes</CardTitle>
                <CardDescription className="text-sm">Base de datos completa de tus clientes con datos fiscales, dirección y contacto.</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-amber-200 dark:hover:border-amber-800 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center mb-3">
                  <Building2 className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <CardTitle className="text-lg">Control de Proyectos</CardTitle>
                <CardDescription className="text-sm">Registra gastos e ingresos, compara presupuesto vs coste real con barra de progreso visual y controla tu beneficio.</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-amber-300 dark:hover:border-amber-700 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-3">
                  <Sparkles className="h-6 w-6 text-amber-700 dark:text-amber-400" />
                </div>
                <CardTitle className="text-lg">Presupuestos con IA</CardTitle>
                <CardDescription className="text-sm">Describe el trabajo y la IA genera partidas desglosadas con precios del mercado español.</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center mb-3">
                  <FileDown className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <CardTitle className="text-lg">Exportar a PDF</CardTitle>
                <CardDescription className="text-sm">Genera PDFs profesionales listos para enviar a tus clientes.</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16">
          <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-12">
            Cómo funciona
          </h2>
          <div className="grid gap-8 md:grid-cols-5">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-slate-900 text-white flex items-center justify-center text-xl font-bold mb-4">
                1
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Registra tu cliente</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Añade los datos de tu cliente: nombre, CIF, dirección...</p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-slate-900 text-white flex items-center justify-center text-xl font-bold mb-4">
                2
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Describe el trabajo</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Indica el tipo de obra, dimensiones y detalles del trabajo a realizar</p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-slate-900 text-white flex items-center justify-center text-xl font-bold mb-4">
                3
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Genera con IA</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">La IA crea las partidas con precios reales del mercado español</p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-slate-900 text-white flex items-center justify-center text-xl font-bold mb-4">
                4
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Exporta y envía</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Descarga el presupuesto en PDF profesional listo para tu cliente</p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-amber-500 text-white flex items-center justify-center text-xl font-bold mb-4">
                5
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Controla la obra</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Registra gastos e ingresos para ver tu beneficio real en tiempo real</p>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-16">
          <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-4">
            Planes y precios
          </h2>
          <p className="text-center text-slate-600 dark:text-slate-400 mb-12">
            Empieza gratis, escala cuando lo necesites
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
                <CardDescription>Para empezar a presupuestar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span>3 presupuestos/mes</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span>Gestión de clientes</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span>Gestión de proyectos</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span>Exportación PDF básica</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span>1 usuario</span>
                </div>
                <Link href="/auth/register" className="block pt-4">
                  <Button variant="outline" className="w-full">Empezar Gratis</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Pro plan */}
            <Card className="border-2 border-amber-500 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                Recomendado
              </div>
              <CardHeader>
                <CardTitle className="text-xl">Pro</CardTitle>
                <div className="mt-2">
                  <span className="text-4xl font-bold">19,90€</span>
                  <span className="text-slate-500">/mes</span>
                </div>
                <CardDescription>Para profesionales</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  <span>Presupuestos ilimitados</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  <span>IA ilimitada</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  <span>Control de costes por proyecto</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  <span>Registro de horas de mano de obra</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  <span>Soporte prioritario</span>
                </div>
                <Link href="/auth/register" className="block pt-4">
                  <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white">Empezar prueba gratuita</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 text-center">
          <div className="rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">
              Empieza a presupuestar con IA hoy
            </h2>
            <p className="text-slate-300 mb-8 max-w-xl mx-auto">
              Únete a los profesionales de la construcción que ya ahorran horas en cada presupuesto.
            </p>
            <Link href="/auth/register">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold">
                Crear cuenta gratis <ArrowRight className="ml-2 h-5 w-5" />
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
