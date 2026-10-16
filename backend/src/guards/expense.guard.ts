import type { NewExpense } from "../types/Expense.ts";

export function isValidNewExpense(data: unknown): data is NewExpense {
  if (typeof data !== "object" || data === null) {
    return false;
  }
  const candidate = data as Record<string, unknown>;
  return (
    typeof candidate.date === "string" &&
    typeof candidate.description === "string" &&
    typeof candidate.amount === "number" &&
    typeof candidate.payerId === "number" &&
    Array.isArray(candidate.participants) &&
    candidate.participants.every((id) => typeof id === "number")
  );
}
