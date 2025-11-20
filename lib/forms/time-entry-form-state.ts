export type TimeEntryFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Record<string, string[]>;
};

export const initialTimeEntryFormState: TimeEntryFormState = {
  status: "idle",
};

