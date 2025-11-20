export type TaskFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Record<string, string[]>;
};

export const initialTaskFormState: TaskFormState = {
  status: "idle",
};

