"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { toast } from "sonner";
import { createCostAction } from "@/app/dashboard/proyectos/cost-actions";
import { createHourAction } from "@/app/dashboard/proyectos/hour-actions";
import {
  createWorkerRateAction,
  deleteWorkerRateAction,
} from "@/app/dashboard/proyectos/worker-rate-actions";
import {
  ArrowLeft,
  Receipt,
  TrendingUp,
  Clock,
  Loader2,
  Plus,
  Trash2,
  Settings,
  Check,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import { roundCurrency } from "@/lib/utils";
import type { WorkerRate, Project } from "@/types";

type EntryType = "gasto" | "ingreso" | "horas";

type QuickAddDialogProps = {
  projects: Pick<Project, "id" | "name">[];
  workerRates: WorkerRate[];
  children: React.ReactNode;
};

const COST_CATEGORIES = [
  { value: "material", label: "Material" },
  { value: "mano_de_obra", label: "Mano de obra" },
  { value: "subcontrata", label: "Subcontrata" },
  { value: "transporte", label: "Transporte" },
  { value: "otros", label: "Otros" },
];

const INCOME_CATEGORIES = [
  { value: "pago_cliente", label: "Pago de cliente" },
  { value: "certificacion", label: "Certificaci\u00f3n" },
  { value: "otros", label: "Otros" },
];

export function QuickAddDialog({
  projects,
  workerRates: initialWorkerRates,
  children,
}: QuickAddDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [entryType, setEntryType] = useState<EntryType | null>(null);
  const [saving, setSaving] = useState(false);

  // Worker rates state (can change if user adds/removes inline)
  const [workerRates, setWorkerRates] = useState(initialWorkerRates);

  // Form fields
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("");
  const [importe, setImporte] = useState("");
  const [fecha, setFecha] = useState(() => new Date().toISOString().split("T")[0]);
  const [notas, setNotas] = useState("");

  // Hours-specific
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>([]);
  const [horas, setHoras] = useState("");
  const [customWorkerName, setCustomWorkerName] = useState("");
  const [customTarifa, setCustomTarifa] = useState("");
  const [useCustomWorker, setUseCustomWorker] = useState(false);

  // Worker management
  const [showWorkerManager, setShowWorkerManager] = useState(false);
  const [newWorkerName, setNewWorkerName] = useState("");
  const [newWorkerTarifa, setNewWorkerTarifa] = useState("");
  const [savingWorker, setSavingWorker] = useState(false);
  const [deletingWorkerId, setDeletingWorkerId] = useState<string | null>(null);

  // Project selection
  const [selectedProjectId, setSelectedProjectId] = useState("");

  const resetState = useCallback(() => {
    setStep(1);
    setEntryType(null);
    setDescripcion("");
    setCategoria("");
    setImporte("");
    setFecha(new Date().toISOString().split("T")[0]);
    setNotas("");
    setSelectedWorkers([]);
    setHoras("");
    setCustomWorkerName("");
    setCustomTarifa("");
    setUseCustomWorker(false);
    setShowWorkerManager(false);
    setSelectedProjectId("");
    setSaving(false);
  }, []);

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      setOpen(newOpen);
      if (!newOpen) resetState();
    },
    [resetState]
  );

  // Cost preview for hours
  const hoursPreview = useMemo(() => {
    const h = parseFloat(horas);
    if (isNaN(h) || h <= 0) return [];

    if (useCustomWorker) {
      const t = parseFloat(customTarifa);
      if (isNaN(t) || t <= 0) return [];
      return [
        {
          name: customWorkerName || "Manual",
          tarifa: t,
          horas: h,
          coste: roundCurrency(t * h),
        },
      ];
    }

    return selectedWorkers
      .map((wId) => {
        const w = workerRates.find((r) => r.id === wId);
        if (!w) return null;
        return {
          name: w.nombre,
          tarifa: w.tarifa_hora,
          horas: h,
          coste: roundCurrency(w.tarifa_hora * h),
        };
      })
      .filter(Boolean) as { name: string; tarifa: number; horas: number; coste: number }[];
  }, [horas, selectedWorkers, workerRates, useCustomWorker, customTarifa, customWorkerName]);

  const totalHoursCost = useMemo(
    () => hoursPreview.reduce((sum, p) => sum + p.coste, 0),
    [hoursPreview]
  );

  function toggleWorker(id: string) {
    setSelectedWorkers((prev) =>
      prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]
    );
  }

  function selectType(type: EntryType) {
    setEntryType(type);
    if (type === "gasto") setCategoria("material");
    else if (type === "ingreso") setCategoria("pago_cliente");
    setStep(2);
  }

  function canAdvanceToStep3(): boolean {
    if (!entryType) return false;

    if (entryType === "horas") {
      const h = parseFloat(horas);
      if (isNaN(h) || h <= 0 || !descripcion.trim()) return false;
      if (useCustomWorker) {
        const t = parseFloat(customTarifa);
        return !isNaN(t) && t > 0;
      }
      return selectedWorkers.length > 0;
    }

    const imp = parseFloat(importe);
    return !!(descripcion.trim() && !isNaN(imp) && imp > 0);
  }

  async function handleSave() {
    if (!selectedProjectId || !entryType) return;
    setSaving(true);

    try {
      if (entryType === "gasto" || entryType === "ingreso") {
        const result = await createCostAction(selectedProjectId, {
          descripcion,
          categoria,
          importe,
          fecha,
          notas,
          tipo: entryType,
        });
        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error(result.message);
          setSaving(false);
          return;
        }
      } else {
        // Horas — create one entry per worker
        const entries = useCustomWorker
          ? [{ nombre: customWorkerName || "Manual", tarifa: customTarifa }]
          : selectedWorkers.map((wId) => {
              const w = workerRates.find((r) => r.id === wId);
              return { nombre: w!.nombre, tarifa: w!.tarifa_hora.toString() };
            });

        let allSuccess = true;
        for (const entry of entries) {
          const result = await createHourAction(selectedProjectId, {
            descripcion,
            categoria_trabajador: entry.nombre,
            tarifa_hora: entry.tarifa,
            horas,
            fecha,
            notas,
          });
          if (!result.success) {
            toast.error(`Error (${entry.nombre}): ${result.message}`);
            allSuccess = false;
            break;
          }
        }

        if (allSuccess) {
          const count = entries.length;
          toast.success(
            count > 1
              ? `${count} registros de horas creados correctamente.`
              : "Horas registradas correctamente."
          );
        } else {
          setSaving(false);
          return;
        }
      }

      router.refresh();
      handleOpenChange(false);
    } catch {
      toast.error("Error al guardar el registro.");
      setSaving(false);
    }
  }

  async function handleAddWorker(e: React.FormEvent) {
    e.preventDefault();
    if (!newWorkerName.trim() || !newWorkerTarifa) return;
    setSavingWorker(true);

    try {
      const result = await createWorkerRateAction({
        nombre: newWorkerName,
        tarifa_hora: newWorkerTarifa,
      });
      if (result.success) {
        toast.success(result.message);
        setNewWorkerName("");
        setNewWorkerTarifa("");
        // Refresh to get updated rates
        router.refresh();
        // Optimistic update
        const tempId = `temp-${Date.now()}`;
        setWorkerRates((prev) => [
          ...prev,
          {
            id: tempId,
            user_id: "",
            nombre: newWorkerName,
            tarifa_hora: parseFloat(newWorkerTarifa),
            created_at: new Date().toISOString(),
          },
        ]);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Error al guardar trabajador.");
    } finally {
      setSavingWorker(false);
    }
  }

  async function handleDeleteWorker(rateId: string) {
    setDeletingWorkerId(rateId);
    try {
      const result = await deleteWorkerRateAction(rateId);
      if (result.success) {
        toast.success(result.message);
        setWorkerRates((prev) => prev.filter((r) => r.id !== rateId));
        setSelectedWorkers((prev) => prev.filter((id) => id !== rateId));
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Error al eliminar trabajador.");
    } finally {
      setDeletingWorkerId(null);
    }
  }

  // Dynamic titles
  const stepTitles: Record<number, string> = {
    1: "Registro r\u00e1pido",
    2: entryType === "gasto"
      ? "Nuevo gasto"
      : entryType === "ingreso"
        ? "Nuevo ingreso"
        : "Registrar horas",
    3: "Asignar a proyecto",
  };

  const stepDescriptions: Record<number, string> = {
    1: "\u00bfQu\u00e9 quieres registrar?",
    2: "Rellena los datos",
    3: "Paso 3 de 3",
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {children}
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
                className="rounded-md p-1 hover:bg-slate-100 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <div>
              <DialogTitle>{stepTitles[step]}</DialogTitle>
              <DialogDescription>{stepDescriptions[step]}</DialogDescription>
            </div>
          </div>
          {/* Step indicator */}
          <div className="flex gap-1.5 pt-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  s <= step
                    ? entryType === "gasto"
                      ? "bg-amber-500"
                      : entryType === "ingreso"
                        ? "bg-emerald-500"
                        : entryType === "horas"
                          ? "bg-violet-500"
                          : "bg-slate-300"
                    : "bg-slate-200"
                }`}
              />
            ))}
          </div>
        </DialogHeader>

        {/* STEP 1: Type Selection */}
        {step === 1 && (
          <div className="space-y-3 pt-2">
            {projects.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-slate-200 p-6 text-center">
                <p className="text-sm text-slate-500 mb-3">
                  Primero necesitas crear un proyecto para poder registrar movimientos.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleOpenChange(false);
                    router.push("/dashboard/proyectos");
                  }}
                >
                  Ir a proyectos
                </Button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => selectType("gasto")}
                  className="flex w-full items-center gap-4 rounded-xl border-2 border-amber-200 bg-amber-50 p-4 text-left transition-colors hover:bg-amber-100 hover:border-amber-300"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white">
                    <Receipt className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-amber-900">Gasto</p>
                    <p className="text-sm text-amber-700">Material, mano de obra, transporte...</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => selectType("ingreso")}
                  className="flex w-full items-center gap-4 rounded-xl border-2 border-emerald-200 bg-emerald-50 p-4 text-left transition-colors hover:bg-emerald-100 hover:border-emerald-300"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-white">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-emerald-900">Ingreso</p>
                    <p className="text-sm text-emerald-700">Pago de cliente, certificaci\u00f3n...</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => selectType("horas")}
                  className="flex w-full items-center gap-4 rounded-xl border-2 border-violet-200 bg-violet-50 p-4 text-left transition-colors hover:bg-violet-100 hover:border-violet-300"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-violet-500 text-white">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-violet-900">Horas</p>
                    <p className="text-sm text-violet-700">Registrar horas de trabajo</p>
                  </div>
                </button>
              </>
            )}
          </div>
        )}

        {/* STEP 2: Form */}
        {step === 2 && entryType && (
          <div className="space-y-4 pt-2">
            {/* Gasto / Ingreso form */}
            {(entryType === "gasto" || entryType === "ingreso") && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="qa-descripcion" className="text-sm">
                    Descripci\u00f3n
                  </Label>
                  <Input
                    id="qa-descripcion"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder={
                      entryType === "gasto"
                        ? "Ej. Azulejos ba\u00f1o principal"
                        : "Ej. Primer pago reforma"
                    }
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="qa-categoria" className="text-sm">
                      Categor\u00eda
                    </Label>
                    <NativeSelect
                      id="qa-categoria"
                      value={categoria}
                      onChange={(e) => setCategoria(e.target.value)}
                    >
                      {(entryType === "gasto" ? COST_CATEGORIES : INCOME_CATEGORIES).map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </NativeSelect>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="qa-importe" className="text-sm">
                      Importe (EUR)
                    </Label>
                    <Input
                      id="qa-importe"
                      type="number"
                      step="0.01"
                      value={importe}
                      onChange={(e) => setImporte(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="qa-fecha" className="text-sm">
                      Fecha
                    </Label>
                    <Input
                      id="qa-fecha"
                      type="date"
                      value={fecha}
                      onChange={(e) => setFecha(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="qa-notas" className="text-sm">
                      Notas
                    </Label>
                    <Input
                      id="qa-notas"
                      value={notas}
                      onChange={(e) => setNotas(e.target.value)}
                      placeholder="Opcional"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Hours form */}
            {entryType === "horas" && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="qa-descripcion-h" className="text-sm">
                    Descripci\u00f3n del trabajo
                  </Label>
                  <Input
                    id="qa-descripcion-h"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Ej. Instalaci\u00f3n tuber\u00edas ba\u00f1o"
                    autoFocus
                  />
                </div>

                {/* Worker selection */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Trabajadores</Label>
                    <button
                      type="button"
                      onClick={() => setShowWorkerManager(!showWorkerManager)}
                      className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors"
                    >
                      <Settings className="h-3 w-3" />
                      Gestionar
                    </button>
                  </div>

                  {/* Worker manager inline */}
                  {showWorkerManager && (
                    <div className="rounded-lg border bg-slate-50 p-3 space-y-3">
                      <p className="text-xs font-medium text-slate-600">
                        Tarifas guardadas
                      </p>
                      {workerRates.map((rate) => (
                        <div
                          key={rate.id}
                          className="flex items-center justify-between rounded-md bg-white border px-2.5 py-1.5"
                        >
                          <div className="text-sm">
                            <span className="font-medium">{rate.nombre}</span>
                            <span className="ml-1.5 text-slate-500">
                              {formatCurrency(rate.tarifa_hora)}/h
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteWorker(rate.id)}
                            disabled={deletingWorkerId === rate.id}
                            className="p-1 text-slate-400 hover:text-rose-500 transition-colors disabled:opacity-50"
                          >
                            {deletingWorkerId === rate.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      ))}
                      <form onSubmit={handleAddWorker} className="flex items-end gap-2">
                        <div className="flex-1 space-y-1">
                          <Label className="text-xs">Nombre</Label>
                          <Input
                            value={newWorkerName}
                            onChange={(e) => setNewWorkerName(e.target.value)}
                            placeholder="Ej. Fontanero"
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="w-24 space-y-1">
                          <Label className="text-xs">EUR/h</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={newWorkerTarifa}
                            onChange={(e) => setNewWorkerTarifa(e.target.value)}
                            placeholder="0.00"
                            className="h-8 text-sm"
                          />
                        </div>
                        <Button type="submit" size="sm" disabled={savingWorker} className="h-8">
                          {savingWorker ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Plus className="h-3 w-3" />
                          )}
                        </Button>
                      </form>
                    </div>
                  )}

                  {/* Worker checkboxes */}
                  {!useCustomWorker && workerRates.length > 0 && (
                    <div className="space-y-1.5">
                      {workerRates.map((rate) => (
                        <label
                          key={rate.id}
                          className={`flex items-center gap-3 rounded-lg border-2 px-3 py-2.5 cursor-pointer transition-colors ${
                            selectedWorkers.includes(rate.id)
                              ? "border-violet-400 bg-violet-50"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                              selectedWorkers.includes(rate.id)
                                ? "border-violet-500 bg-violet-500 text-white"
                                : "border-slate-300"
                            }`}
                          >
                            {selectedWorkers.includes(rate.id) && (
                              <Check className="h-3 w-3" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium">{rate.nombre}</span>
                          </div>
                          <span className="text-sm text-slate-500">
                            {formatCurrency(rate.tarifa_hora)}/h
                          </span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Toggle custom worker */}
                  <button
                    type="button"
                    onClick={() => {
                      setUseCustomWorker(!useCustomWorker);
                      if (!useCustomWorker) setSelectedWorkers([]);
                    }}
                    className="text-xs text-slate-500 hover:text-slate-700 underline transition-colors"
                  >
                    {useCustomWorker ? "Usar trabajadores guardados" : "Introducir tarifa manual"}
                  </button>

                  {/* Custom worker inputs */}
                  {useCustomWorker && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-sm">Nombre</Label>
                        <Input
                          value={customWorkerName}
                          onChange={(e) => setCustomWorkerName(e.target.value)}
                          placeholder="Ej. Fontanero"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm">Tarifa/h (EUR)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={customTarifa}
                          onChange={(e) => setCustomTarifa(e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="qa-horas" className="text-sm">
                      Horas
                    </Label>
                    <Input
                      id="qa-horas"
                      type="number"
                      step="0.25"
                      value={horas}
                      onChange={(e) => setHoras(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="qa-fecha-h" className="text-sm">
                      Fecha
                    </Label>
                    <Input
                      id="qa-fecha-h"
                      type="date"
                      value={fecha}
                      onChange={(e) => setFecha(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="qa-notas-h" className="text-sm">
                    Notas
                  </Label>
                  <Input
                    id="qa-notas-h"
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    placeholder="Opcional"
                  />
                </div>

                {/* Hours cost preview */}
                {hoursPreview.length > 0 && (
                  <div className="rounded-lg bg-violet-50 border border-violet-200 p-3 space-y-1.5">
                    {hoursPreview.map((p, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-violet-700">
                          {p.name} ({p.horas}h \u00d7 {formatCurrency(p.tarifa)}/h)
                        </span>
                        <span className="font-medium text-violet-900">
                          {formatCurrency(p.coste)}
                        </span>
                      </div>
                    ))}
                    {hoursPreview.length > 1 && (
                      <div className="flex items-center justify-between text-sm border-t border-violet-200 pt-1.5 mt-1.5">
                        <span className="font-medium text-violet-800">Total</span>
                        <span className="font-bold text-violet-900">
                          {formatCurrency(totalHoursCost)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Next button */}
            <Button
              onClick={() => setStep(3)}
              disabled={!canAdvanceToStep3()}
              className="w-full"
            >
              Siguiente
            </Button>
          </div>
        )}

        {/* STEP 3: Project Selection */}
        {step === 3 && (
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="qa-project" className="text-sm">
                Proyecto
              </Label>
              <NativeSelect
                id="qa-project"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
              >
                <option value="" disabled>
                  Seleccionar proyecto...
                </option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </NativeSelect>
            </div>

            {/* Summary */}
            <div
              className={`rounded-lg border p-3 text-sm space-y-1 ${
                entryType === "gasto"
                  ? "bg-amber-50 border-amber-200"
                  : entryType === "ingreso"
                    ? "bg-emerald-50 border-emerald-200"
                    : "bg-violet-50 border-violet-200"
              }`}
            >
              <p className="font-medium">Resumen</p>
              <p className="text-slate-600">{descripcion}</p>
              {entryType === "horas" ? (
                <>
                  {hoursPreview.map((p, i) => (
                    <p key={i} className="text-slate-500">
                      {p.name}: {p.horas}h \u2192 {formatCurrency(p.coste)}
                    </p>
                  ))}
                  {hoursPreview.length > 1 && (
                    <p className="font-medium">Total: {formatCurrency(totalHoursCost)}</p>
                  )}
                </>
              ) : (
                <p className="font-medium">{formatCurrency(parseFloat(importe))}</p>
              )}
            </div>

            <Button
              onClick={handleSave}
              disabled={saving || !selectedProjectId}
              className="w-full"
            >
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Guardar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
