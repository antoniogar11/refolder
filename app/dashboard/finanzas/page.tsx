import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { getEstimates } from "@/lib/data/estimates";
import { getDashboardStats } from "@/lib/data/dashboard";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(amount);
}

export default async function FinanzasPage() {
  const [stats, { estimates }] = await Promise.all([
    getDashboardStats(),
    getEstimates({ page: 1 }),
  ]);

  const acceptedTotal = estimates
    .filter((e) => e.status === "accepted")
    .reduce((sum, e) => sum + e.total_amount, 0);
  const pendingTotal = estimates
    .filter((e) => e.status === "sent")
    .reduce((sum, e) => sum + e.total_amount, 0);
  const rejectedTotal = estimates
    .filter((e) => e.status === "rejected")
    .reduce((sum, e) => sum + e.total_amount, 0);
  const draftTotal = estimates
    .filter((e) => e.status === "draft")
    .reduce((sum, e) => sum + e.total_amount, 0);

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Finanzas</h2>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Resumen financiero basado en presupuestos
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Aceptados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(acceptedTotal)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(pendingTotal)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Rechazados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(rejectedTotal)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Borradores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {formatCurrency(draftTotal)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Presupuestos recientes</CardTitle>
        </CardHeader>
        <CardContent>
          {estimates.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              No hay presupuestos registrados aun.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Presupuesto</TableHead>
                  <TableHead>Obra</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Importe</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {estimates.slice(0, 10).map((estimate) => (
                  <TableRow key={estimate.id}>
                    <TableCell className="font-medium">{estimate.name}</TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-400">
                      {estimate.project?.name || "-"}
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-400">
                      {estimate.project?.client?.name || "-"}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(estimate.total_amount)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge type="estimate" status={estimate.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
