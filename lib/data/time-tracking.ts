import { createClient } from "@/lib/supabase/server";

export type TimeEntry = {
  id: string;
  project_id: string | null;
  task_id: string | null;
  assigned_user_id: string | null; // Trabajador para el que se registra (NULL = el mismo usuario)
  entry_date: string;
  start_time: string | null;
  end_time: string | null;
  duration_minutes: number | null;
  description: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
};

export type TimeEntryWithRelations = TimeEntry & {
  project?: {
    id: string;
    name: string;
  } | null;
  task?: {
    id: string;
    title: string;
  } | null;
  assigned_user?: {
    id: string;
    email: string;
    name?: string;
  } | null;
};

export async function getTimeEntries(): Promise<TimeEntryWithRelations[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    // Obtener registros donde el usuario es el creador o el trabajador asignado
    const { data, error } = await supabase
      .from("time_entries")
      .select("*")
      .or(`user_id.eq.${user.id},assigned_user_id.eq.${user.id}`)
      .order("entry_date", { ascending: false })
      .order("start_time", { ascending: false });

    if (error) {
      console.error("Error fetching time entries:", {
        message: error.message,
        details: error.details,
        code: error.code,
      });
      return [];
    }

    if (!data) {
      return [];
    }

    // Obtener proyectos y tareas relacionados
    const projectIds = data.filter((t: any) => t.project_id).map((t: any) => t.project_id);
    const taskIds = data.filter((t: any) => t.task_id).map((t: any) => t.task_id);

    let projectsMap: Record<string, { id: string; name: string }> = {};
    let tasksMap: Record<string, { id: string; title: string }> = {};

    if (projectIds.length > 0) {
      const { data: projectsData } = await supabase
        .from("projects")
        .select("id, name")
        .in("id", projectIds)
        .eq("user_id", user.id);

      if (projectsData) {
        projectsMap = projectsData.reduce((acc: Record<string, { id: string; name: string }>, project) => {
          acc[project.id] = project;
          return acc;
        }, {});
      }
    }

    if (taskIds.length > 0) {
      const { data: tasksData } = await supabase
        .from("tasks")
        .select("id, title")
        .in("id", taskIds)
        .eq("user_id", user.id);

      if (tasksData) {
        tasksMap = tasksData.reduce((acc: Record<string, { id: string; title: string }>, task) => {
          acc[task.id] = { id: task.id, title: task.title };
          return acc;
        }, {});
      }
    }

    // Obtener información de trabajadores asignados si hay
    const assignedUserIds = [...new Set(data.filter((e: any) => e.assigned_user_id).map((e: any) => e.assigned_user_id))];
    let assignedUsersMap: Record<string, { id: string; email: string; name?: string }> = {};

    if (assignedUserIds.length > 0) {
      // Obtener datos de usuarios usando función RPC
      await Promise.all(
        assignedUserIds.map(async (userId: string) => {
          const result = await supabase.rpc('get_user_data', {
            user_uuid: userId
          }).single();
          
          const userData = result.data as { id: string; email: string; name: string | null; full_name: string | null } | null;
          
          assignedUsersMap[userId] = {
            id: userId,
            email: userData?.email || userId,
            name: userData?.name || userData?.full_name || undefined,
          };
        })
      );
    }

    return data.map((entry: any) => ({
      id: entry.id,
      project_id: entry.project_id || null,
      task_id: entry.task_id || null,
      assigned_user_id: entry.assigned_user_id || null,
      entry_date: entry.entry_date || new Date().toISOString().split("T")[0],
      start_time: entry.start_time || null,
      end_time: entry.end_time || null,
      duration_minutes: entry.duration_minutes || null,
      description: entry.description || null,
      notes: entry.notes || null,
      created_at: entry.created_at || new Date().toISOString(),
      updated_at: entry.updated_at || null,
      project: entry.project_id ? projectsMap[entry.project_id] || null : null,
      task: entry.task_id ? tasksMap[entry.task_id] || null : null,
      assigned_user: entry.assigned_user_id ? assignedUsersMap[entry.assigned_user_id] || null : null,
    }));
  } catch (err) {
    console.error("Unexpected error in getTimeEntries:", err);
    return [];
  }
}

export async function getTimeEntryById(id: string): Promise<TimeEntryWithRelations | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from("time_entries")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Error fetching time entry:", error);
      return null;
    }

    if (!data) {
      return null;
    }

    // Obtener proyecto y tarea si existen
    let project = null;
    let task = null;

    if (data.project_id) {
      const { data: projectData } = await supabase
        .from("projects")
        .select("id, name")
        .eq("id", data.project_id)
        .eq("user_id", user.id)
        .single();

      if (projectData) {
        project = projectData;
      }
    }

    if (data.task_id) {
      const { data: taskData } = await supabase
        .from("tasks")
        .select("id, title")
        .eq("id", data.task_id)
        .eq("user_id", user.id)
        .single();

      if (taskData) {
        task = { id: taskData.id, title: taskData.title };
      }
    }

    // Obtener información del trabajador asignado si existe
    let assignedUser = null;
    if (data.assigned_user_id) {
      const result = await supabase.rpc('get_user_data', {
        user_uuid: data.assigned_user_id
      }).single();
      
      const userData = result.data as { id: string; email: string; name: string | null; full_name: string | null } | null;
      
      assignedUser = {
        id: data.assigned_user_id,
        email: userData?.email || data.assigned_user_id,
        name: userData?.name || userData?.full_name || undefined,
      };
    }

    return {
      id: data.id,
      project_id: data.project_id || null,
      task_id: data.task_id || null,
      assigned_user_id: data.assigned_user_id || null,
      entry_date: data.entry_date || new Date().toISOString().split("T")[0],
      start_time: data.start_time || null,
      end_time: data.end_time || null,
      duration_minutes: data.duration_minutes || null,
      description: data.description || null,
      notes: data.notes || null,
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || null,
      project,
      task,
      assigned_user: assignedUser,
    };
  } catch (err) {
    console.error("Unexpected error in getTimeEntryById:", err);
    return null;
  }
}

export async function getTimeEntriesByProjectId(projectId: string): Promise<TimeEntryWithRelations[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from("time_entries")
      .select("*")
      .eq("project_id", projectId)
      .or(`user_id.eq.${user.id},assigned_user_id.eq.${user.id}`)
      .order("entry_date", { ascending: false })
      .order("start_time", { ascending: false });

    if (error) {
      console.error("Error fetching project time entries:", error);
      return [];
    }

    if (!data) {
      return [];
    }

    // Obtener tarea si existe
    const taskIds = data.filter((t: any) => t.task_id).map((t: any) => t.task_id);
    let tasksMap: Record<string, { id: string; title: string }> = {};

    if (taskIds.length > 0) {
      const { data: tasksData } = await supabase
        .from("tasks")
        .select("id, title")
        .in("id", taskIds)
        .eq("user_id", user.id);

      if (tasksData) {
        tasksMap = tasksData.reduce((acc: Record<string, { id: string; title: string }>, task) => {
          acc[task.id] = { id: task.id, title: task.title };
          return acc;
        }, {});
      }
    }

    // Obtener información de trabajadores asignados si hay
    const assignedUserIds = [...new Set(data.filter((e: any) => e.assigned_user_id).map((e: any) => e.assigned_user_id))];
    let assignedUsersMap: Record<string, { id: string; email: string; name?: string }> = {};

    if (assignedUserIds.length > 0) {
      // Obtener datos de usuarios usando función RPC
      await Promise.all(
        assignedUserIds.map(async (userId: string) => {
          const result = await supabase.rpc('get_user_data', {
            user_uuid: userId
          }).single();
          
          const userData = result.data as { id: string; email: string; name: string | null; full_name: string | null } | null;
          
          assignedUsersMap[userId] = {
            id: userId,
            email: userData?.email || userId,
            name: userData?.name || userData?.full_name || undefined,
          };
        })
      );
    }

    return data.map((entry: any) => ({
      id: entry.id,
      project_id: entry.project_id || null,
      task_id: entry.task_id || null,
      assigned_user_id: entry.assigned_user_id || null,
      entry_date: entry.entry_date || new Date().toISOString().split("T")[0],
      start_time: entry.start_time || null,
      end_time: entry.end_time || null,
      duration_minutes: entry.duration_minutes || null,
      description: entry.description || null,
      notes: entry.notes || null,
      created_at: entry.created_at || new Date().toISOString(),
      updated_at: entry.updated_at || null,
      project: null, // Ya estamos filtrando por proyecto
      task: entry.task_id ? tasksMap[entry.task_id] || null : null,
      assigned_user: entry.assigned_user_id ? assignedUsersMap[entry.assigned_user_id] || { id: entry.assigned_user_id, email: entry.assigned_user_id } : null,
    }));
  } catch (err) {
    console.error("Unexpected error in getTimeEntriesByProjectId:", err);
    return [];
  }
}

export async function getTimeSummary() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { totalMinutes: 0, totalHours: 0, todayMinutes: 0, todayHours: 0 };
    }

    // Obtener registros del usuario (como creador o trabajador asignado)
    const { data, error } = await supabase
      .from("time_entries")
      .select("duration_minutes, entry_date")
      .or(`user_id.eq.${user.id},assigned_user_id.eq.${user.id}`);

    if (error || !data) {
      return { totalMinutes: 0, totalHours: 0, todayMinutes: 0, todayHours: 0 };
    }

    const totalMinutes = data
      .filter((t) => t.duration_minutes !== null)
      .reduce((sum, t) => sum + (t.duration_minutes || 0), 0);

    const today = new Date().toISOString().split("T")[0];
    const todayMinutes = data
      .filter((t) => t.entry_date === today && t.duration_minutes !== null)
      .reduce((sum, t) => sum + (t.duration_minutes || 0), 0);

    return {
      totalMinutes,
      totalHours: Math.round((totalMinutes / 60) * 100) / 100,
      todayMinutes,
      todayHours: Math.round((todayMinutes / 60) * 100) / 100,
    };
  } catch (err) {
    console.error("Unexpected error in getTimeSummary:", err);
    return { totalMinutes: 0, totalHours: 0, todayMinutes: 0, todayHours: 0 };
  }
}

/**
 * Obtiene el resumen de horas trabajadas en un proyecto
 */
export async function getProjectTimeSummary(projectId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { totalMinutes: 0, totalHours: 0, entryCount: 0 };
    }

    // Obtener registros del proyecto (como creador o trabajador asignado)
    const { data, error } = await supabase
      .from("time_entries")
      .select("duration_minutes")
      .eq("project_id", projectId)
      .or(`user_id.eq.${user.id},assigned_user_id.eq.${user.id}`);

    if (error || !data) {
      return { totalMinutes: 0, totalHours: 0, entryCount: 0 };
    }

    const totalMinutes = data
      .filter((t) => t.duration_minutes !== null)
      .reduce((sum, t) => sum + (t.duration_minutes || 0), 0);

    return {
      totalMinutes,
      totalHours: Math.round((totalMinutes / 60) * 100) / 100,
      entryCount: data.length,
    };
  } catch (err) {
    console.error("Unexpected error in getProjectTimeSummary:", err);
    return { totalMinutes: 0, totalHours: 0, entryCount: 0 };
  }
}

/**
 * Obtiene registros de tiempo filtrados por periodo y proyecto
 */
export async function getFilteredTimeEntries(
  startDate?: string,
  endDate?: string,
  projectId?: string
): Promise<TimeEntryWithRelations[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    let query = supabase
      .from("time_entries")
      .select("*")
      .or(`user_id.eq.${user.id},assigned_user_id.eq.${user.id}`);

    if (startDate) {
      query = query.gte("entry_date", startDate);
    }

    if (endDate) {
      query = query.lte("entry_date", endDate);
    }

    if (projectId) {
      query = query.eq("project_id", projectId);
    }

    const { data, error } = await query
      .order("entry_date", { ascending: false })
      .order("start_time", { ascending: false });

    if (error) {
      console.error("Error fetching filtered time entries:", error);
      return [];
    }

    if (!data) {
      return [];
    }

    // Obtener proyectos y tareas relacionados
    const projectIds = data.filter((t: any) => t.project_id).map((t: any) => t.project_id);
    const taskIds = data.filter((t: any) => t.task_id).map((t: any) => t.task_id);

    let projectsMap: Record<string, { id: string; name: string }> = {};
    let tasksMap: Record<string, { id: string; title: string }> = {};

    if (projectIds.length > 0) {
      const { data: projectsData } = await supabase
        .from("projects")
        .select("id, name")
        .in("id", projectIds)
        .eq("user_id", user.id);

      if (projectsData) {
        projectsMap = projectsData.reduce((acc: Record<string, { id: string; name: string }>, project) => {
          acc[project.id] = project;
          return acc;
        }, {});
      }
    }

    if (taskIds.length > 0) {
      const { data: tasksData } = await supabase
        .from("tasks")
        .select("id, title")
        .in("id", taskIds)
        .eq("user_id", user.id);

      if (tasksData) {
        tasksMap = tasksData.reduce((acc: Record<string, { id: string; title: string }>, task) => {
          acc[task.id] = { id: task.id, title: task.title };
          return acc;
        }, {});
      }
    }

    // Obtener información de trabajadores asignados
    const assignedUserIds = [...new Set(data.filter((e: any) => e.assigned_user_id).map((e: any) => e.assigned_user_id))];
    let assignedUsersMap: Record<string, { id: string; email: string; name?: string }> = {};

    if (assignedUserIds.length > 0) {
      await Promise.all(
        assignedUserIds.map(async (userId: string) => {
          const result = await supabase.rpc('get_user_data', {
            user_uuid: userId
          }).single();
          
          const userData = result.data as { id: string; email: string; name: string | null; full_name: string | null } | null;
          
          assignedUsersMap[userId] = {
            id: userId,
            email: userData?.email || userId,
            name: userData?.name || userData?.full_name || undefined,
          };
        })
      );
    }

    return data.map((entry: any) => ({
      id: entry.id,
      project_id: entry.project_id || null,
      task_id: entry.task_id || null,
      assigned_user_id: entry.assigned_user_id || null,
      entry_date: entry.entry_date || new Date().toISOString().split("T")[0],
      start_time: entry.start_time || null,
      end_time: entry.end_time || null,
      duration_minutes: entry.duration_minutes || null,
      description: entry.description || null,
      notes: entry.notes || null,
      created_at: entry.created_at || new Date().toISOString(),
      updated_at: entry.updated_at || null,
      project: entry.project_id ? projectsMap[entry.project_id] || null : null,
      task: entry.task_id ? tasksMap[entry.task_id] || null : null,
      assigned_user: entry.assigned_user_id ? assignedUsersMap[entry.assigned_user_id] || null : null,
    }));
  } catch (err) {
    console.error("Unexpected error in getFilteredTimeEntries:", err);
    return [];
  }
}


// formatDuration se exporta desde lib/utils.ts para evitar dependencias de server en componentes cliente

