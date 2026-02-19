"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CostsTable } from "@/components/projects/costs-table";
import { AddCostForm } from "@/components/projects/add-cost-form";
import { IncomeTable } from "@/components/projects/income-table";
import { AddIncomeForm } from "@/components/projects/add-income-form";
import { HoursTable } from "@/components/projects/hours-table";
import { AddHoursForm } from "@/components/projects/add-hours-form";
import { WorkerRatesManager } from "@/components/projects/worker-rates-manager";
import type { ProjectCost, ProjectHour, ProjectTask, WorkerRate } from "@/types";

type ProjectDetailTabsProps = {
  projectId: string;
  gastos: ProjectCost[];
  ingresos: ProjectCost[];
  hours: ProjectHour[];
  workerRates: WorkerRate[];
  tasks?: ProjectTask[];
};

export function ProjectDetailTabs({
  projectId,
  gastos,
  ingresos,
  hours,
  workerRates,
  tasks = [],
}: ProjectDetailTabsProps) {
  return (
    <Tabs defaultValue="gastos" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="gastos">
          Gastos ({gastos.length})
        </TabsTrigger>
        <TabsTrigger value="ingresos">
          Ingresos ({ingresos.length})
        </TabsTrigger>
        <TabsTrigger value="horas">
          Horas ({hours.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="gastos" className="space-y-4 mt-4">
        <AddCostForm projectId={projectId} />
        <CostsTable costs={gastos} projectId={projectId} />
      </TabsContent>

      <TabsContent value="ingresos" className="space-y-4 mt-4">
        <AddIncomeForm projectId={projectId} />
        <IncomeTable incomes={ingresos} projectId={projectId} />
      </TabsContent>

      <TabsContent value="horas" className="space-y-4 mt-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <AddHoursForm projectId={projectId} workerRates={workerRates} tasks={tasks} />
          <WorkerRatesManager rates={workerRates} />
        </div>
        <HoursTable hours={hours} projectId={projectId} />
      </TabsContent>
    </Tabs>
  );
}
