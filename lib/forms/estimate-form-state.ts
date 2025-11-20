export type EstimateFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Record<string, string[]>;
};

export const initialEstimateFormState: EstimateFormState = {
  status: "idle",
};

