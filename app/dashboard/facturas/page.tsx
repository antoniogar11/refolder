import { redirect } from "next/navigation";
import Link from "next/link";

import { LogoutButton } from "@/components/auth/logout-button";
import { NewInvoiceSection } from "@/components/invoices/new-invoice-section";
import { InvoicesList } from "@/components/invoices/invoices-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getInvoices } from "@/lib/data/invoices";
import { getProjects } from "@/lib/data/projects";
import { getClientsForSelect } from "@/lib/data/projects";
import { hasWorkerPermission, isCompanyAdmin } from "@/lib/data/companies";
import { formatCurrency } from "@/lib/utils/format";

export default async function FacturasPage() {
  const isAdmin = await isCompanyAdmin();
  const canViewInvoices = isAdmin || await hasWorkerPermission("invoices:read");

  if (!canViewInvoices) {
    redirect("/dashboard");
  }

  const invoices = await getInvoices();
  const projects = await getProjects();
  const clients = await getClientsForSelect();

  // Calcular estadísticas
  const totalInvoices = invoices.length;
  const totalAmount = invoices.reduce((sum, i) => sum + i.total, 0);
  const paidInvoices = invoices.filter((i) => i.status === "paid");
  const paidAmount = paidInvoices.reduce((sum, i) => sum + i.total, 0);
  const pendingInvoices = invoices.filter((i) => i.status === "sent" || i.status === "overdue");
  const pendingAmount = pendingInvoices.reduce((sum, i) => sum + i.total - i.paid_amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 pb-20 md:pb-8">
      {/* Header mejorado */}
      <nav className="sticky top-0 z-30 border-b border-gray-200/80 dark:border-gray-800/80 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:dark:bg-gray-900/60 md:ml-64">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 sm:h-16 items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <h1 className="text-base sm:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Facturas
              </h1>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <LogoutButton variant="outline" />
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 sm:py-8">
        <div className="mb-4 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
            Facturas
          </h2>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Crea y gestiona facturas para tus obras y clientes
          </p>
        </div>

        {/* Resumen */}
        <div className="mb-4 sm:mb-8 grid gap-3 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="border-2 border-gray-200 dark:border-gray-800 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs sm:text-sm flex items-center gap-1">
                <span className="text-base">📋</span>
                Total Facturas
              </CardDescription>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-700 dark:text-gray-300 mt-1">
                {totalInvoices}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50/50 to-white dark:from-blue-950/30 dark:to-gray-900 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs sm:text-sm flex items-center gap-1">
                <span className="text-base">💵</span>
                Valor Total
              </CardDescription>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                {formatCurrency(totalAmount)}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="border-2 border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50/50 to-white dark:from-green-950/30 dark:to-gray-900 hover:shadow-lg transition-shadow sm:col-span-2 lg:col-span-1">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs sm:text-sm flex items-center gap-1">
                <span className="text-base">✅</span>
                Facturas Pagadas
              </CardDescription>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
                {formatCurrency(paidAmount)}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {paidInvoices.length} factura{paidInvoices.length !== 1 ? "s" : ""} pagada{paidInvoices.length !== 1 ? "s" : ""}
              </p>
              {pendingAmount > 0 && (
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1 font-medium">
                  ⚠️ Pendiente: {formatCurrency(pendingAmount)}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Formulario de Nueva Factura */}
        <Card className="mb-4 sm:mb-8 border-2 border-gray-200 dark:border-gray-800 bg-gradient-to-br from-white to-gray-50/30 dark:from-gray-900 dark:to-gray-800/30">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
              <span className="text-xl">➕</span>
              Nueva Factura
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Crea una nueva factura para un cliente o proyecto</CardDescription>
          </CardHeader>
          <CardContent>
            <NewInvoiceSection projects={projects} clients={clients} />
          </CardContent>
        </Card>

        {/* Lista de Facturas */}
        <Card className="border-2 border-gray-200 dark:border-gray-800 bg-gradient-to-br from-white to-gray-50/30 dark:from-gray-900 dark:to-gray-800/30">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
              <span className="text-xl">📄</span>
              Facturas
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Todas tus facturas</CardDescription>
          </CardHeader>
          <CardContent>
            <InvoicesList invoices={invoices} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

