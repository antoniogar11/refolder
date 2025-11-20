"use server";

import { revalidatePath } from "next/cache";

import type { TimeEntryFormState } from "@/lib/forms/time-entry-form-state";
import { initialTimeEntryFormState } from "@/lib/forms/time-entry-form-state";
import { createClient } from "@/lib/supabase/server";

type TimeEntryPayload = {
  project_id: string | null;
  task_id: string | null;
  assigned_user_id: string | null;
  entry_date: string;
  start_time: string | null;
  end_time: string | null;
  description: string | null;
  notes: string | null;
};

function calculateEndTimeFromHours(startTime: string, hours: number): string {
  const [hoursStr, minutesStr] = startTime.split(":");
  const startHours = parseInt(hoursStr, 10);
  const startMinutes = parseInt(minutesStr, 10);
  
  const totalMinutes = Math.round(hours * 60);
  const totalStartMinutes = startHours * 60 + startMinutes;
  const endMinutes = totalStartMinutes + totalMinutes;
  
  const endHours = Math.floor(endMinutes / 60) % 24;
  const endMins = endMinutes % 60;
  
  return `${String(endHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")}`;
}

function validateTimeEntry(
  formData: FormData,
): { data?: TimeEntryPayload; errors?: Record<string, string[]> } {
  const errors: Record<string, string[]> = {};

  const entryDate = (formData.get("entry_date") as string | null)?.trim() ?? "";
  const startTime = (formData.get("start_time") as string | null)?.trim() ?? "";
  const endTime = (formData.get("end_time") as string | null)?.trim() ?? "";
  const hoursWorked = (formData.get("hours_worked") as string | null)?.trim() ?? "";
  const description = (formData.get("description") as string | null)?.trim() ?? "";
  const notes = (formData.get("notes") as string | null)?.trim() ?? "";
  const projectId = (formData.get("project_id") as string | null)?.trim() ?? "";
  const taskId = (formData.get("task_id") as string | null)?.trim() ?? "";
  const assignedUserId = (formData.get("assigned_user_id") as string | null)?.trim() ?? "";

  if (!entryDate) {
    errors.entry_date = ["La fecha es obligatoria."];
  }

  let finalStartTime: string | null = startTime || null;
  let finalEndTime: string | null = endTime || null;

  // Si se proporcionan horas trabajadas
  if (hoursWorked) {
    const hoursNum = parseFloat(hoursWorked);
    if (isNaN(hoursNum) || hoursNum <= 0) {
      errors.hours_worked = ["Las horas trabajadas deben ser un número mayor a 0."];
    } else {
      // Si hay hora de inicio, calcular hora de fin automáticamente
      if (startTime) {
        finalEndTime = calculateEndTimeFromHours(startTime, hoursNum);
      } else {
        // Si no hay hora de inicio, no podemos calcular la hora de fin
        // En este caso, guardamos solo las horas y dejamos start_time y end_time como null
        // El duration_minutes se calculará en el trigger de la base de datos
        finalStartTime = null;
        finalEndTime = null;
      }
    }
  }

  // Si no se proporcionan horas trabajadas, validar inicio/fin
  if (!hoursWorked) {
    // Si se proporciona hora de fin, debe haber hora de inicio
    if (endTime && !startTime) {
      errors.start_time = ["La hora de inicio es obligatoria cuando se especifica hora de fin."];
    }

    // Validar que end_time sea mayor que start_time si ambos están presentes
    if (endTime && startTime) {
      const start = new Date(`2000-01-01T${startTime}`);
      const end = new Date(`2000-01-01T${endTime}`);
      if (end <= start) {
        errors.end_time = ["La hora de fin debe ser mayor que la hora de inicio."];
      }
    }
  }

  // Validación: debe haber al menos una forma de calcular el tiempo
  // Si no hay horas trabajadas, debe haber hora de inicio
  if (!hoursWorked && !startTime) {
    errors.hours_worked = ["Debes especificar las horas trabajadas o la hora de inicio."];
    errors.start_time = ["Debes especificar la hora de inicio o las horas trabajadas."];
  }
  
  // Si hay horas trabajadas pero no hay hora de inicio ni fin, está bien (solo horas)
  // Si hay horas trabajadas y hora de inicio, calcular hora de fin automáticamente (ya hecho arriba)
  // Si hay horas trabajadas y hora de fin pero no inicio, error
  if (hoursWorked && endTime && !startTime) {
    errors.start_time = ["La hora de inicio es necesaria cuando se especifica hora de fin."];
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  // Si solo se proporcionan horas sin hora de inicio, necesitamos almacenar las horas de alguna forma
  // Podemos usar un campo oculto o calcular con una hora por defecto
  // Por ahora, guardamos las horas en minutos en duration_minutes directamente
  // Pero necesitamos modificar la lógica para manejar este caso

  return {
    data: {
      project_id: projectId || null,
      task_id: taskId || null,
      assigned_user_id: assignedUserId || null,
      entry_date: entryDate,
      start_time: finalStartTime,
      end_time: finalEndTime,
      description: description || null,
      notes: notes || null,
    },
  };
}

export async function createTimeEntryAction(
  _: TimeEntryFormState,
  formData: FormData,
): Promise<TimeEntryFormState> {
  const validation = validateTimeEntry(formData);

  if (validation.errors) {
    return {
      status: "error",
      message: "Revisa los campos.",
      errors: validation.errors,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      status: "error",
      message: "No estás autenticado. Por favor, inicia sesión.",
    };
  }

  const formDataPayload = { ...validation.data! };
  const hoursWorked = (formData.get("hours_worked") as string | null)?.trim() ?? "";
  
  // Validar permisos para asignar trabajador
  if (formDataPayload.assigned_user_id && formDataPayload.assigned_user_id !== user.id) {
    // Verificar si es admin de la empresa
    const { data: company } = await supabase
      .from("companies")
      .select("id")
      .eq("owner_id", user.id)
      .single();
    
    if (!company) {
      const { data: member } = await supabase
        .from("company_members")
        .select("company_id, role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();
      
      if (!member) {
        return {
          status: "error",
          message: "No tienes permisos para crear registros para otros trabajadores.",
        };
      }
    }
    
    // Verificar que el trabajador asignado pertenece a la misma empresa
    let creatorCompanyId: string | null = null;
    
    if (company) {
      creatorCompanyId = company.id;
    } else {
      const { data: member } = await supabase
        .from("company_members")
        .select("company_id")
        .eq("user_id", user.id)
        .single();
      
      if (member) {
        creatorCompanyId = member.company_id;
      }
    }
    
    if (!creatorCompanyId) {
      return {
        status: "error",
        message: "No perteneces a ninguna empresa.",
      };
    }
    
    // Verificar que el trabajador asignado pertenece a la misma empresa
    const { data: assignedUserAsOwner } = await supabase
      .from("companies")
      .select("id")
      .eq("owner_id", formDataPayload.assigned_user_id)
      .eq("id", creatorCompanyId)
      .single();
    
    const { data: assignedUserAsMember } = await supabase
      .from("company_members")
      .select("company_id")
      .eq("user_id", formDataPayload.assigned_user_id)
      .eq("company_id", creatorCompanyId)
      .single();
    
    if (!assignedUserAsOwner && !assignedUserAsMember) {
      return {
        status: "error",
        message: "El trabajador asignado no pertenece a tu empresa.",
      };
    }
  }
  
  // Si assigned_user_id está vacío, establecerlo como NULL (registro para el mismo usuario)
  const assignedUserId = formDataPayload.assigned_user_id || null;
  
  // Si solo se proporcionan horas sin hora de inicio/fin, necesitamos calcular duration_minutes
  if (hoursWorked && !formDataPayload.start_time) {
    const hoursNum = parseFloat(hoursWorked);
    const durationMinutes = Math.round(hoursNum * 60);
    // Insertar con duration_minutes calculado manualmente
    const { error } = await supabase.from("time_entries").insert({
      ...formDataPayload,
      assigned_user_id: assignedUserId,
      start_time: null, // NULL cuando solo hay horas trabajadas
      end_time: null,
      duration_minutes: durationMinutes,
      user_id: user.id,
    });
    
    if (error) {
      console.error("Error creating time entry", error);
      return {
        status: "error",
        message: `No se pudo crear el registro: ${error.message}`,
      };
    }
  } else {
    // Insertar normalmente (el trigger calculará duration_minutes desde start_time y end_time)
    const { error } = await supabase.from("time_entries").insert({
      ...formDataPayload,
      assigned_user_id: assignedUserId,
      user_id: user.id,
    });
    
    if (error) {
      console.error("Error creating time entry", error);
      return {
        status: "error",
        message: `No se pudo crear el registro: ${error.message}`,
      };
    }
  }

  revalidatePath("/dashboard/control-horario");

  // Si el registro está asociado a un proyecto, revalidar también esa ruta
  if (validation.data!.project_id) {
    revalidatePath(`/dashboard/obras/${validation.data!.project_id}`);
  }

  return {
    status: "success",
    message: "Registro de tiempo creado correctamente.",
  };
}

export async function updateTimeEntryAction(
  entryId: string,
  _: TimeEntryFormState,
  formData: FormData,
): Promise<TimeEntryFormState> {
  const validation = validateTimeEntry(formData);

  if (validation.errors) {
    return {
      status: "error",
      message: "Revisa los campos.",
      errors: validation.errors,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      status: "error",
      message: "No estás autenticado. Por favor, inicia sesión.",
    };
  }

  const formDataPayload = { ...validation.data! };
  const hoursWorked = (formData.get("hours_worked") as string | null)?.trim() ?? "";
  
  // Si solo se proporcionan horas sin hora de inicio/fin, necesitamos calcular duration_minutes
  if (hoursWorked && !formDataPayload.start_time) {
    const hoursNum = parseFloat(hoursWorked);
    const durationMinutes = Math.round(hoursNum * 60);
    // Actualizar con duration_minutes calculado manualmente
    const { error } = await supabase
      .from("time_entries")
      .update({
        ...formDataPayload,
        start_time: null, // NULL cuando solo hay horas trabajadas
        end_time: null,
        duration_minutes: durationMinutes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", entryId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error updating time entry", error);
      return {
        status: "error",
        message: `No se pudo actualizar el registro: ${error.message}`,
      };
    }
  } else {
    // Actualizar normalmente (el trigger calculará duration_minutes desde start_time y end_time)
    const { error } = await supabase
      .from("time_entries")
      .update({
        ...formDataPayload,
        updated_at: new Date().toISOString(),
      })
      .eq("id", entryId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error updating time entry", error);
      return {
        status: "error",
        message: `No se pudo actualizar el registro: ${error.message}`,
      };
    }
  }

  revalidatePath("/dashboard/control-horario");
  revalidatePath(`/dashboard/control-horario/${entryId}`);

  // Si el registro está asociado a un proyecto, revalidar también esa ruta
  if (validation.data!.project_id) {
    revalidatePath(`/dashboard/obras/${validation.data!.project_id}`);
  }

  return {
    status: "success",
    message: "Registro de tiempo actualizado correctamente.",
  };
}

export async function deleteTimeEntryAction(
  entryId: string,
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "No estás autenticado. Por favor, inicia sesión.",
    };
  }

  // Obtener el project_id antes de eliminar para revalidar su ruta
  const { data: entry } = await supabase
    .from("time_entries")
    .select("project_id")
    .eq("id", entryId)
    .eq("user_id", user.id)
    .single();

  const { error } = await supabase
    .from("time_entries")
    .delete()
    .eq("id", entryId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting time entry", error);
    return {
      success: false,
      message: `No se pudo eliminar el registro: ${error.message}`,
    };
  }

  revalidatePath("/dashboard/control-horario");

  // Si el registro estaba asociado a un proyecto, revalidar también esa ruta
  if (entry?.project_id) {
    revalidatePath(`/dashboard/obras/${entry.project_id}`);
  }

  return {
    success: true,
    message: "Registro de tiempo eliminado correctamente.",
  };
}

