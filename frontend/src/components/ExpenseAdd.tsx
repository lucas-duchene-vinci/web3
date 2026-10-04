import type { Expense } from "../types/Expense";

interface ExpenseAddProps {
  addExpense: (expense: Expense) => void;
}

function generateRandomExpense(): Expense {
  const id = Date.now().toString();
  return {
    id,
    date: new Date().toISOString(),
    description: `New expense ${id}`,
    payer: Math.random() < 0.5 ? "Alice" : "Bob",
    amount: Math.round(Math.random() * 100 * 100) / 100,
  };
}

function ExpenseAdd({ addExpense }: ExpenseAddProps) {
  return <div>
    <h2>Add a new random Expense</h2>
    <button onClick={() => addExpense(generateRandomExpense())}>Add</button>
  </div>;
}

export default ExpenseAdd;