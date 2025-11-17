export type ClientFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Record<string, string[]>;
};

export const initialClientFormState: ClientFormState = {
  status: "idle",
};

