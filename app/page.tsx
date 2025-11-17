import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Refolder
              </span>
            </div>
            <nav className="hidden md:flex items-center gap-4">
              <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">Iniciar Sesión</Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">Registrarse</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
            <span>✨</span>
            <span>Gestión Integral de Obras y Reformas</span>
          </div>
          <h1 className="mb-6 text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
              Refolder
            </span>
          </h1>
          <p className="mb-4 text-xl md:text-2xl font-semibold text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            SaaS de Gestión para Obras y Reformas
          </p>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
            Sistema completo de gestión para tus proyectos. Controla obras, clientes, presupuestos y proveedores desde un solo lugar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="text-lg px-8 py-6">
                Comenzar Gratis
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                Ver Demo
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-16 mb-16">
          <Card className="border-2 hover:border-blue-300 dark:hover:border-blue-700 transition-colors hover:shadow-lg">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <CardTitle className="text-xl">Dashboard</CardTitle>
              <CardDescription className="text-base">
                Panel principal de control con todas tus métricas y estadísticas en tiempo real
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard">
                <Button className="w-full">Ir al Dashboard</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors hover:shadow-lg">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <CardTitle className="text-xl">Login</CardTitle>
              <CardDescription className="text-base">
                Accede de forma segura a tu cuenta y gestiona todos tus proyectos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/auth/login">
                <Button variant="outline" className="w-full">Iniciar Sesión</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-purple-300 dark:hover:border-purple-700 transition-colors hover:shadow-lg">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <CardTitle className="text-xl">Registro</CardTitle>
              <CardDescription className="text-base">
                Crea tu cuenta gratuita y comienza a gestionar tus obras hoy mismo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/auth/register">
                <Button variant="outline" className="w-full">Registrarse</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="mt-16 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-8 shadow-xl">
          <h2 className="mb-8 text-3xl font-bold text-center text-gray-900 dark:text-white">
            Características Principales
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <span className="text-green-600 dark:text-green-400 text-xl">✓</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Next.js 15.1</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Framework moderno y optimizado</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <span className="text-green-600 dark:text-green-400 text-xl">✓</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">React 19</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Última versión de React</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <span className="text-green-600 dark:text-green-400 text-xl">✓</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">TailwindCSS 3.4</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Diseño responsive y moderno</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <span className="text-green-600 dark:text-green-400 text-xl">✓</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">shadcn/ui</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Componentes UI profesionales</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <span className="text-green-600 dark:text-green-400 text-xl">✓</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">TypeScript</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tipado seguro y robusto</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <span className="text-green-600 dark:text-green-400 text-xl">✓</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Supabase</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Backend y autenticación</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p>© 2024 Refolder. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
