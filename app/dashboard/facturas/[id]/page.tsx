import Link from "next/link";
import { redirect } from "next/navigation";

import { LogoutButton } from "@/components/auth/logout-button";
import { InvoiceView } from "@/components/invoices/invoice-view";
import { Button } from "@/components/ui/button";
import { getInvoiceById } from "@/lib/data/invoices";
import { getProjects } from "@/lib/data/projects";
import { getClientsForSelect } from "@/lib/data/projects";

type InvoiceDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const { id } = await params;
  const invoice = await getInvoiceById(id);

  if (!invoice) {
    redirect("/dashboard/facturas");
  }

  const projects = await getProjects();
  const clients = await getClientsForSelect();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="border-b bg-white dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Factura: {invoice.invoice_number}
            </h1>
            <div className="flex items-center gap-2">
              <Link href="/dashboard/facturas">
                <Button variant="ghost">Volver a Facturas</Button>
              </Link>
              <LogoutButton variant="outline" />
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <InvoiceView invoice={invoice} projects={projects} clients={clients} />
      </main>
    </div>
  );
}
