"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";

import { updateEstimateAction } from "@/app/dashboard/presupuestos/actions";
import { Button } from "@/components/ui/button";
import { initialEstimateFormState } from "@/lib/forms/estimate-form-state";
import type { EstimateWithRelations } from "@/lib/data/estimates";
import { AIAssistant } from "./ai-assistant";

const inputClasses =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const textareaClasses =
  "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const selectClasses =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

type EstimateItem = {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  notes: string | null;
};

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return (
    <p className="text-sm text-red-600 dark:text-red-400" role="alert">
      {messages.join(" ")}
    </p>
  );
}

function FormMessage({ status, message }: { status: "idle" | "success" | "error"; message?: string }) {
  if (!message || status === "idle") return null;

  const styles =
    status === "error"
      ? "text-sm text-red-600 dark:text-red-400"
      : "text-sm text-green-600 dark:text-green-400";

  return <p className={styles}>{message}</p>;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Guardando..." : "Guardar Cambios"}
    </Button>
  );
}

type EditEstimateFormProps = {
  estimate: EstimateWithRelations;
  projects: Array<{ id: string; name: string }>;
  clients: Array<{ id: string; name: string }>;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function EditEstimateForm({
  estimate,
  projects,
  clients,
  onSuccess,
  onCancel,
}: EditEstimateFormProps) {
  const router = useRouter();
  const [state, formAction] = useActionState(
    (prevState: typeof initialEstimateFormState, formData: FormData) =>
      updateEstimateAction(estimate.id, prevState, formData),
    initialEstimateFormState
  );
  
  const [items, setItems] = useState<EstimateItem[]>(
    estimate.items && estimate.items.length > 0
      ? estimate.items.map((item) => ({
          id: item.id || Date.now().toString() + Math.random(),
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          tax_rate: item.tax_rate || estimate.tax_rate,
          notes: item.notes,
        }))
      : [{ id: "1", description: "", quantity: 1, unit_price: 0, tax_rate: estimate.tax_rate, notes: null }]
  );
  const [description, setDescription] = useState(estimate.description || "");

  useEffect(() => {
    if (state.status === "success") {
      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
      }
    }
  }, [state.status, onSuccess, router]);

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        description: "",
        quantity: 1,
        unit_price: 0,
        tax_rate: estimate.tax_rate,
        notes: null,
      },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof EstimateItem, value: string | number) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const calculateSubtotal = (item: EstimateItem): number => {
    return item.quantity * item.unit_price;
  };

  const calculateTax = (item: EstimateItem): number => {
    return calculateSubtotal(item) * (item.tax_rate / 100);
  };

  const calculateTotal = (item: EstimateItem): number => {
    return calculateSubtotal(item) + calculateTax(item);
  };

  const totalSubtotal = items.reduce((sum, item) => sum + calculateSubtotal(item), 0);
  const totalTax = items.reduce((sum, item) => sum + calculateTax(item), 0);
  const total = totalSubtotal + totalTax;

  const handleCompleteEstimateGenerated = (result: {
    description: string;
    items: Array<{
      description: string;
      quantity: number;
      unit_price: number;
    }>;
  }) => {
    // Actualizar descripción
    setDescription(result.description);

    // Actualizar items con precios y cantidades
    const newItems = result.items.map((item, idx) => ({
      id: `ai-${Date.now()}-${idx}`,
      description: item.description,
      quantity: item.quantity || 1,
      unit_price: item.unit_price || 0,
      tax_rate: estimate.tax_rate,
      notes: null,
    }));
    setItems(newItems.length > 0 ? newItems : [{ id: "1", description: "", quantity: 1, unit_price: 0, tax_rate: estimate.tax_rate, notes: null }]);
  };

  return (
    <form
      id="edit-estimate-form"
      action={formAction}
      className="space-y-6"
      noValidate
    >
      {/* Asistente de IA para generar presupuesto completo */}
      <AIAssistant
        mode="complete"
        onCompleteEstimateGenerated={handleCompleteEstimateGenerated}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">
            Título del Presupuesto *
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            className={inputClasses}
            placeholder="Ej: Reforma de cocina"
            defaultValue={estimate.title}
          />
          <FieldError messages={state.errors?.title} />
        </div>

        <div className="space-y-2">
          <label htmlFor="client_id" className="text-sm font-medium">
            Cliente
          </label>
          <select
            id="client_id"
            name="client_id"
            className={selectClasses}
            defaultValue={estimate.client_id || ""}
          >
            <option value="">Sin cliente asignado</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="project_id" className="text-sm font-medium">
            Proyecto
          </label>
          <select
            id="project_id"
            name="project_id"
            className={selectClasses}
            defaultValue={estimate.project_id || ""}
          >
            <option value="">Sin proyecto asignado</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="status" className="text-sm font-medium">
            Estado
          </label>
          <select id="status" name="status" className={selectClasses} defaultValue={estimate.status}>
            <option value="draft">Borrador</option>
            <option value="sent">Enviado</option>
            <option value="accepted">Aceptado</option>
            <option value="rejected">Rechazado</option>
            <option value="expired">Expirado</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="issue_date" className="text-sm font-medium">
            Fecha de Emisión *
          </label>
          <input
            id="issue_date"
            name="issue_date"
            type="date"
            required
            className={inputClasses}
            defaultValue={estimate.issue_date.split("T")[0]}
          />
          <FieldError messages={state.errors?.issue_date} />
        </div>

        <div className="space-y-2">
          <label htmlFor="validity_date" className="text-sm font-medium">
            Fecha de Validez
          </label>
          <input
            id="validity_date"
            name="validity_date"
            type="date"
            className={inputClasses}
            defaultValue={estimate.validity_date ? estimate.validity_date.split("T")[0] : ""}
          />
          <FieldError messages={state.errors?.validity_date} />
        </div>

        <div className="space-y-2">
          <label htmlFor="tax_rate" className="text-sm font-medium">
            IVA (%) *
          </label>
          <input
            id="tax_rate"
            name="tax_rate"
            type="number"
            step="0.01"
            min="0"
            max="100"
            required
            className={inputClasses}
            defaultValue={estimate.tax_rate}
          />
          <FieldError messages={state.errors?.tax_rate} />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Descripción
        </label>
        <textarea
          id="description"
          name="description"
          className={textareaClasses}
          placeholder="Descripción general del presupuesto"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* Items del Presupuesto */}
      <div className="space-y-4 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Líneas del Presupuesto</h3>
          <Button type="button" onClick={addItem} variant="outline" size="sm">
            + Añadir Línea
          </Button>
        </div>

        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="grid gap-4 rounded-lg border border-gray-200 dark:border-gray-700 p-4 md:grid-cols-6"
            >
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Concepto *
                </label>
                <input
                  type="text"
                  required
                  className={inputClasses}
                  placeholder="Descripción del concepto"
                  value={item.description}
                  onChange={(e) => updateItem(item.id, "description", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Cantidad *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  className={inputClasses}
                  value={item.quantity}
                  onChange={(e) => updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Precio Unitario *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  className={inputClasses}
                  value={item.unit_price}
                  onChange={(e) => updateItem(item.id, "unit_price", parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  IVA (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  className={inputClasses}
                  value={item.tax_rate}
                  onChange={(e) => updateItem(item.id, "tax_rate", parseFloat(e.target.value) || estimate.tax_rate)}
                />
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-1 text-sm">
                  <div className="text-gray-600 dark:text-gray-400">Total:</div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(calculateTotal(item))}
                  </div>
                </div>
                {items.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    ×
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Totales */}
        <div className="mt-4 space-y-2 rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(totalSubtotal)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">IVA:</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(totalTax)}
            </span>
          </div>
          <div className="flex justify-between border-t border-gray-300 dark:border-gray-700 pt-2 text-lg font-bold">
            <span className="text-gray-900 dark:text-white">Total:</span>
            <span className="text-gray-900 dark:text-white">
              {new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(total)}
            </span>
          </div>
        </div>

        <input type="hidden" name="items" value={JSON.stringify(items)} />
      </div>

      <div className="space-y-2">
        <label htmlFor="notes" className="text-sm font-medium">
          Notas
        </label>
        <textarea
          id="notes"
          name="notes"
          className={textareaClasses}
          placeholder="Notas adicionales sobre el presupuesto"
          defaultValue={estimate.notes || ""}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="terms" className="text-sm font-medium">
          Términos y Condiciones
        </label>
        <textarea
          id="terms"
          name="terms"
          className={textareaClasses}
          placeholder="Términos y condiciones del presupuesto"
          defaultValue={estimate.terms || ""}
        />
      </div>

      <FormMessage status={state.status} message={state.message} />
      <div className="flex gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancelar
          </Button>
        )}
        <div className="flex-1">
          <SubmitButton />
        </div>
      </div>
    </form>
  );
}

