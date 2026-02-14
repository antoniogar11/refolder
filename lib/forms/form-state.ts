export type FormState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Record<string, string[]>;
};

export const initialFormState: FormState = {
  status: "idle",
};

export function zodErrorsToFormState(
  issues: { path: PropertyKey[]; message: string }[],
  message = "Revisa los campos.",
): FormState {
  const errors: Record<string, string[]> = {};
  for (const issue of issues) {
    const field = issue.path[0]?.toString() ?? "_";
    errors[field] = errors[field] ?? [];
    errors[field].push(issue.message);
  }
  return { status: "error", message, errors };
}
