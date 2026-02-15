"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, CircleDollarSign, FileText } from "lucide-react";

type ProjectPageTabsProps = {
  datosTab: React.ReactNode;
  finanzasTab: React.ReactNode;
  presupuestosTab: React.ReactNode;
};

export function ProjectPageTabs({
  datosTab,
  finanzasTab,
  presupuestosTab,
}: ProjectPageTabsProps) {
  return (
    <Tabs defaultValue="finanzas" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="finanzas" className="flex items-center gap-2">
          <CircleDollarSign className="h-4 w-4" />
          <span className="hidden sm:inline">Finanzas</span>
        </TabsTrigger>
        <TabsTrigger value="presupuestos" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Presupuestos</span>
        </TabsTrigger>
        <TabsTrigger value="datos" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">Datos</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="finanzas" className="space-y-6 mt-6">
        {finanzasTab}
      </TabsContent>

      <TabsContent value="presupuestos" className="space-y-6 mt-6">
        {presupuestosTab}
      </TabsContent>

      <TabsContent value="datos" className="space-y-6 mt-6">
        {datosTab}
      </TabsContent>
    </Tabs>
  );
}
