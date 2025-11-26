"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { TaxCalculation } from "@/lib/data/taxes";

export function TaxEstimationSection() {
  const [selectedPeriod, setSelectedPeriod] = useState<"current_month" | "current_year" | "custom">("current_month");
  const [calculations, setCalculations] = useState<TaxCalculation | null>(null);
  const [loading, setLoading] = useState(false);

  const calculateTaxes = async () => {
    setLoading(true);
    try {
      const periodParam = selectedPeriod === "current_month" ? "month" : "year";
      const response = await fetch(`/api/taxes/calculate?period=${periodParam}`);
      
      if (!response.ok) {
        throw new Error("Error al calcular impuestos");
      }
      
      const data = await response.json();
      setCalculations(data);
    } catch (error) {
      console.error("Error calculating taxes:", error);
      // En caso de error, mostrar datos vacíos
      setCalculations({
        period: "Sin datos",
        totalIncome: 0,
        totalExpenses: 0,
        netIncome: 0,
        ivaCollected: 0,
        ivaPaid: 0,
        ivaToPay: 0,
        irpfEstimate: 0,
        totalTaxes: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateTaxes();
  }, [selectedPeriod]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Selector de período */}
      <Card>
        <CardHeader>
          <CardTitle>Período de Cálculo</CardTitle>
          <CardDescription>Selecciona el período para calcular los impuestos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedPeriod === "current_month" ? "default" : "outline"}
              onClick={() => setSelectedPeriod("current_month")}
            >
              Mes Actual
            </Button>
            <Button
              variant={selectedPeriod === "current_year" ? "default" : "outline"}
              onClick={() => setSelectedPeriod("current_year")}
            >
              Año Actual
            </Button>
            <Button
              variant={selectedPeriod === "custom" ? "default" : "outline"}
              onClick={() => setSelectedPeriod("custom")}
            >
              Personalizado
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resumen de ingresos y gastos */}
      {calculations && (
        <>
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ingresos Totales</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(calculations.totalIncome)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Gastos Totales</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(calculations.totalExpenses)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Beneficio Neto</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(calculations.netIncome)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Cálculo de IVA */}
          <Card>
            <CardHeader>
              <CardTitle>IVA (Impuesto sobre el Valor Añadido)</CardTitle>
              <CardDescription>21% sobre ingresos y gastos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">IVA Cobrado</p>
                  <p className="text-xl font-semibold text-green-600 dark:text-green-400">
                    {formatCurrency(calculations.ivaCollected)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Sobre {formatCurrency(calculations.totalIncome)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">IVA Pagado</p>
                  <p className="text-xl font-semibold text-red-600 dark:text-red-400">
                    {formatCurrency(calculations.ivaPaid)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Sobre {formatCurrency(calculations.totalExpenses)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">IVA a Pagar</p>
                  <p className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                    {formatCurrency(calculations.ivaToPay)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Diferencia
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estimación de IRPF */}
          <Card>
            <CardHeader>
              <CardTitle>Estimación IRPF (Impuesto sobre la Renta)</CardTitle>
              <CardDescription>Estimación basada en el beneficio neto (20% estimado)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Base imponible estimada:</span>
                  <span className="font-semibold">{formatCurrency(calculations.netIncome)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Tipo estimado:</span>
                  <span className="font-semibold">20%</span>
                </div>
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">IRPF Estimado:</span>
                    <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {formatCurrency(calculations.irpfEstimate)}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  * Esta es una estimación. Consulta con tu asesor fiscal para cálculos exactos.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Resumen total */}
          <Card className="border-2 border-blue-500 dark:border-blue-600">
            <CardHeader>
              <CardTitle className="text-xl">Resumen de Impuestos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">IVA a Pagar:</span>
                  <span className="font-semibold">{formatCurrency(calculations.ivaToPay)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">IRPF Estimado:</span>
                  <span className="font-semibold">{formatCurrency(calculations.irpfEstimate)}</span>
                </div>
                <div className="pt-3 border-t-2 border-gray-300 dark:border-gray-600">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold">Total Impuestos Estimados:</span>
                    <span className="text-3xl font-bold text-red-600 dark:text-red-400">
                      {formatCurrency(calculations.totalTaxes)}
                    </span>
                  </div>
                </div>
                <div className="pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Beneficio después de impuestos:</span>
                    <span className="text-xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(calculations.netIncome - calculations.totalTaxes)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {loading && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400">Calculando impuestos...</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

