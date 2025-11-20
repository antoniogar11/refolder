import Link from "next/link";
import { redirect } from "next/navigation";

import { LogoutButton } from "@/components/auth/logout-button";
import { EditTransactionForm } from "@/components/finances/edit-transaction-form";
import { DeleteTransactionButton } from "@/components/finances/delete-transaction-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getFinanceTransactionById } from "@/lib/data/finances";
import { getProjects } from "@/lib/data/projects";
import { getClientsForSelect } from "@/lib/data/projects";

type TransactionEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function TransactionEditPage({ params }: TransactionEditPageProps) {
  const { id } = await params;
  const transaction = await getFinanceTransactionById(id);
  const projects = await getProjects();
  const clients = await getClientsForSelect();

  if (!transaction) {
    redirect("/dashboard/finanzas");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="border-b bg-white dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Editar Transacción</h1>
            <div className="flex items-center gap-2">
              <Link href="/dashboard/finanzas">
                <Button variant="ghost">Volver a Finanzas</Button>
              </Link>
              <LogoutButton variant="outline" />
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Editar Transacción</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Modifica la información de la transacción</p>
        </div>

        <Card className="border border-gray-200 dark:border-gray-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {transaction.description || transaction.category} -{" "}
                  {new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(
                    transaction.amount,
                  )}
                </CardTitle>
                <CardDescription>Modifica los datos de la transacción</CardDescription>
              </div>
              <DeleteTransactionButton
                transactionId={transaction.id}
                transactionDescription={transaction.description || transaction.category}
              />
            </div>
          </CardHeader>
          <CardContent>
            <EditTransactionForm transaction={transaction} projects={projects} clients={clients} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

