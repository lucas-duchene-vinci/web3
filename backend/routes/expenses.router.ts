import express from "express";
import type { Expense } from "../types/Expense.ts";
import { ExpensesService } from "../services/expense.service.ts";

const expensesRouter = express.Router();

expensesRouter.get("/", (req, res) => {
    try {
        const expenses = ExpensesService.getExpenses();
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ error: "Internal server error"});
    }
});

expensesRouter.post("/", (req, res) => {
    try {
        const expense: Expense = req.body;

        const expenses = ExpensesService.addExpense(expense);
        res.status(201).json(expenses);
    } catch (error) {
        res.status(500).json({ error: "Internal server error"});
    }
});

expensesRouter.post("/reset", (req, res) => {
  try {
    const expenses = ExpensesService.resetExpenses();
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default expensesRouter;