"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { updateCompanyAction } from "@/app/dashboard/configuracion/actions";
import type { Company } from "@/types";
import { Building2, Save, Loader2 } from "lucide-react";

type CompanyFormProps = {
  company: Company;
};

export function CompanyForm({ company }: CompanyFormProps) {
  const [state, formAction, isPending] = useActionState(updateCompanyAction, { status: "idle" as const });

  return (
    <form action={formAction} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-amber-500" />
            Datos de la Empresa
          </CardTitle>
          <CardDescription>
            Esta información aparecerá en tus presupuestos y documentos PDF
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la empresa *</Label>
              <Input
                id="name"
                name="name"
                defaultValue={company.name}
                placeholder="Ej: Reformas García S.L."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax_id">CIF / NIF</Label>
              <Input
                id="tax_id"
                name="tax_id"
                defaultValue={company.tax_id || ""}
                placeholder="Ej: B12345678"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle">Descripción / Actividad</Label>
            <Input
              id="subtitle"
              name="subtitle"
              defaultValue={company.subtitle || ""}
              placeholder="Ej: Reformas integrales y fontanería"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email de contacto</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={company.email || ""}
                placeholder="info@tuempresa.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={company.phone || ""}
                placeholder="Ej: 612 345 678"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              name="address"
              defaultValue={company.address || ""}
              placeholder="Ej: Calle Mayor 15, 2ºB"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="city">Ciudad</Label>
              <Input
                id="city"
                name="city"
                defaultValue={company.city || ""}
                placeholder="Ej: Madrid"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="province">Provincia</Label>
              <Input
                id="province"
                name="province"
                defaultValue={company.province || ""}
                placeholder="Ej: Madrid"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postal_code">Código Postal</Label>
              <Input
                id="postal_code"
                name="postal_code"
                defaultValue={company.postal_code || ""}
                placeholder="Ej: 28001"
              />
            </div>
          </div>

          {state?.status === "success" && (
            <p className="text-sm text-emerald-600 dark:text-emerald-400">{state.message}</p>
          )}
          {state?.status === "error" && (
            <p className="text-sm text-red-600 dark:text-red-400">{state.message}</p>
          )}

          <Button type="submit" disabled={isPending} className="bg-amber-500 hover:bg-amber-600 text-white">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar Cambios
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
