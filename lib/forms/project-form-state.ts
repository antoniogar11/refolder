export type ProjectFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Record<string, string[]>;
};

export const initialProjectFormState: ProjectFormState = {
  status: "idle",
};

