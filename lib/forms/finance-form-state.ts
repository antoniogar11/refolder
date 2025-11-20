export type FinanceFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Record<string, string[]>;
};

export const initialFinanceFormState: FinanceFormState = {
  status: "idle",
};

