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
            <span>Ahorra horas en cada presupuesto</span>
          </div>
          <h1 className="mb-6 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight max-w-4xl mx-auto">
            <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-200 dark:to-slate-300 bg-clip-text text-transparent">
              Presupuestos con IA y control real de tus obras
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-4">
            Genera presupuestos profesionales con IA en minutos y controla, en
            tiempo real, si realmente ganas dinero en cada obra.
          </p>
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-xl mx-auto mb-8">
            Pensado para empresas de reformas, constructoras pequeñas y
            autónomos que hoy todavía trabajan con Excel y plantillas de Word.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button className="text-lg px-8 py-6 bg-amber-500 hover:bg-amber-600 text-white">
                Empezar gratis ahora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" className="px-6 py-6">
                Ver ejemplo de panel
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-xs md:text-sm text-slate-500 dark:text-slate-400">
            Sin tarjeta de crédito · Cancela cuando quieras
          </p>
        </section>

        {/* Para quién es */}
        <section className="py-12">
          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
                  Jefes de obra y empresas de reformas
                </CardTitle>
                <CardDescription className="text-sm">
                  Que gestionan varias obras a la vez y necesitan saber rápido
                  qué proyectos son rentables y cuáles se están desviando.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
                  Autónomos de la construcción
                </CardTitle>
                <CardDescription className="text-sm">
                  Que quieren dejar de perder horas con Excel y plantillas de
                  Word y enviar presupuestos cuidados que se entiendan a la
                  primera.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
                  Estudios pequeños y interioristas
                </CardTitle>
                <CardDescription className="text-sm">
                  Que necesitan una visión sencilla de clientes, proyectos,
                  presupuestos enviados y aceptados, sin montar un ERP enorme.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* Features */}
        <section className="py-16">
          <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-3">
            Todo el ciclo de tu obra en un solo lugar
          </h2>
          <p className="text-center text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto">
            De la primera visita al cliente hasta el cierre económico del
            proyecto. Refolder une presupuestos, ejecución y control de
            beneficio.
          </p>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-2 hover:border-slate-300 dark:hover:border-slate-700 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                  <Users className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                </div>
                <CardTitle className="text-lg">Gestión de clientes</CardTitle>
                <CardDescription className="text-sm">
                  Toda la información fiscal y de contacto de tus clientes,
                  ligada a sus proyectos y presupuestos.
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
                  Registra gastos, ingresos y horas de mano de obra. Ve de un
                  vistazo si cada obra va en verde o en rojo.
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
                  Describe la reforma y deja que la IA proponga partidas
                  desglosadas con precios alineados con el mercado español.
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
                  Genera PDFs limpios y profesionales que tus clientes entienden
                  sin llamadas de aclaración.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* Cómo funciona */}
        <section className="py-16">
          <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-12">
            Cómo pasas de “no me da la vida” a “lo tengo todo controlado”
          </h2>
          <div className="grid gap-8 md:grid-cols-5">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-slate-900 text-white flex items-center justify-center text-xl font-bold mb-4">
                1
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                Registra tu cliente
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Nombre, CIF, dirección y datos de contacto. Todo ordenado para
                reutilizar en futuros proyectos.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-slate-900 text-white flex items-center justify-center text-xl font-bold mb-4">
                2
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                Describe la obra
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Tipo de reforma, metros, calidades… igual que se lo explicarías
                al cliente por teléfono o en la visita.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-slate-900 text-white flex items-center justify-center text-xl font-bold mb-4">
                3
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                Genera el presupuesto con IA
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                La IA propone partidas y precios. Tú revisas, ajustas márgenes y
                añades tus conceptos habituales.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-slate-900 text-white flex items-center justify-center text-xl font-bold mb-4">
                4
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                Envía el PDF
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Exporta un PDF limpio con tu imagen de marca, listo para enviar
                por WhatsApp o email.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-amber-500 text-white flex items-center justify-center text-xl font-bold mb-4">
                5
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                Controla la obra en tiempo real
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Registra gastos e ingresos y compara siempre presupuesto vs
                coste real para saber tu beneficio de verdad.
              </p>
            </div>
          </div>
        </section>

        {/* Por qué ahora usas Excel */}
        <section className="py-16">
          <div className="grid gap-10 lg:grid-cols-2 items-start">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                De hojas sueltas y Excels a tenerlo todo en un panel
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                La mayoría de empresas de reformas trabajan con una mezcla de
                WhatsApp, notas en papel, plantillas de Word y Excels que nadie
                actualiza. Resultado: presupuestos que se pierden, márgenes que
                se escapan y cero visibilidad real.
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                Refolder está pensado justo para ese escenario: mínimo tiempo de
                configuración, sin tecnicismos, y con los datos clave delante de
                ti cada vez que entras al panel.
              </p>
            </div>
            <Card className="border-2 border-dashed">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-500" />
                  Menos tiempo delante del ordenador
                </CardTitle>
                <CardDescription>
                  Lo que hoy te lleva 1–2 horas entre Excel, copiar/pegar y
                  revisar números, aquí se convierte en minutos.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                <ul className="space-y-2">
                  <li>• Presupuesto inicial en minutos con ayuda de IA.</li>
                  <li>
                    • Sin pelearte con fórmulas: totales e impuestos calculados
                    automáticamente.
                  </li>
                  <li>
                    • Misma herramienta para presupuestar y controlar el avance
                    económico.
                  </li>
                </ul>
              </CardContent>
            </Card>
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
