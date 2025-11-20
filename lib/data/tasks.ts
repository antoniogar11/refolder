import { createClient } from "@/lib/supabase/server";

export type Task = {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  due_date: string | null;
  assigned_to: string | null;
  estimated_hours: number | null;
  actual_hours: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
  completed_at: string | null;
};

export async function getTasksByProjectId(projectId: string): Promise<Task[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching tasks:", {
        message: error.message,
        details: error.details,
        code: error.code,
      });
      return [];
    }

    if (!data) {
      return [];
    }

    return data.map((task: any) => ({
      id: task.id,
      project_id: task.project_id,
      title: task.title || "",
      description: task.description || null,
      status: task.status || "pending",
      priority: task.priority || "medium",
      due_date: task.due_date || null,
      assigned_to: task.assigned_to || null,
      estimated_hours: task.estimated_hours ? parseFloat(task.estimated_hours) : null,
      actual_hours: task.actual_hours ? parseFloat(task.actual_hours) : null,
      notes: task.notes || null,
      created_at: task.created_at || new Date().toISOString(),
      updated_at: task.updated_at || null,
      completed_at: task.completed_at || null,
    }));
  } catch (err) {
    console.error("Unexpected error in getTasksByProjectId:", err);
    return [];
  }
}

export async function getAllTasks(): Promise<Task[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching all tasks:", error);
      return [];
    }

    if (!data) {
      return [];
    }

    return data.map((task: any) => ({
      id: task.id,
      project_id: task.project_id,
      title: task.title || "",
      description: task.description || null,
      status: task.status || "pending",
      priority: task.priority || "medium",
      due_date: task.due_date || null,
      assigned_to: task.assigned_to || null,
      estimated_hours: task.estimated_hours ? parseFloat(task.estimated_hours) : null,
      actual_hours: task.actual_hours ? parseFloat(task.actual_hours) : null,
      notes: task.notes || null,
      created_at: task.created_at || new Date().toISOString(),
      updated_at: task.updated_at || null,
      completed_at: task.completed_at || null,
    }));
  } catch (err) {
    console.error("Unexpected error in getAllTasks:", err);
    return [];
  }
}

export async function getTaskById(taskId: string): Promise<Task | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", taskId)
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Error fetching task:", error);
      return null;
    }

    if (!data) {
      return null;
    }

    return {
      id: data.id,
      project_id: data.project_id,
      title: data.title || "",
      description: data.description || null,
      status: data.status || "pending",
      priority: data.priority || "medium",
      due_date: data.due_date || null,
      assigned_to: data.assigned_to || null,
      estimated_hours: data.estimated_hours ? parseFloat(data.estimated_hours) : null,
      actual_hours: data.actual_hours ? parseFloat(data.actual_hours) : null,
      notes: data.notes || null,
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || null,
      completed_at: data.completed_at || null,
    };
  } catch (err) {
    console.error("Unexpected error in getTaskById:", err);
    return null;
  }
}

