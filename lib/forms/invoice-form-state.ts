export type InvoiceFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Record<string, string[]>;
};

export const initialInvoiceFormState: InvoiceFormState = {
  status: "idle",
};

