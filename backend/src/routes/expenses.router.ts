
import express from "express";
import { ExpensesService } from "../services/expense.service.ts";
import { isValidNewExpense } from "../guards/expense.guard.ts";

const expensesRouter = express.Router();

expensesRouter.get("/", async (req, res) => {
  try {
    const expenses = await ExpensesService.getExpenses();
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

expensesRouter.post("/", async (req, res) => {
  try {
    const body: unknown = req.body; // on ne sait pas encore ce que le client a envoyé
    if (!isValidNewExpense(body)) {
      return res.status(400).json({ error: "Invalid expense" });
    }
    const expense = await ExpensesService.addExpense(body); // ici TypeScript sait que body est un NewExpense
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// expensesRouter.post("/reset", (req, res) => {
//   try {
//     const expenses = ExpensesService.resetExpenses();
//     res.json(expenses);
//   } catch (error) {
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

export default expensesRouter;