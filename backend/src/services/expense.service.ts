import type { Expense, NewExpense } from "../types/Expense.ts";
import { db } from "../prisma/db.ts";

export class ExpensesService {

  public static async getExpenses(): Promise<Expense[]> {
    try {
      // participants est un N:M : Prisma traverse la table Participations pour nous
      // et renvoie directement des User.
      const rows = await db.orm.public.Expense
        .include("payer")
        .include("participants")
        .all();
      return rows;
    } catch (error) {
      console.error("Error getting expenses:", error);
      throw error;
    }
  }

  public static async addExpense(newExpense: NewExpense): Promise<Expense> {
    try {
      // On construit l'objet champ par champ (jamais le body brut du client).
      // `participants` : connect() relie la dépense à des users existants,
      // ce qui écrit les lignes de la table Participations.
      const created = await db.orm.public.Expense.create({
        description: newExpense.description,
        amount: newExpense.amount,
        date: newExpense.date,
        payerId: newExpense.payerId,
        participants: (p) => p.connect(newExpense.participants.map((id) => ({ id }))),
      });

      // create() ne renvoie que les colonnes de expense : on relit avec les relations.
      const expense = await db.orm.public.Expense
        .where({ id: created.id })
        .include("payer")
        .include("participants")
        .first();
      if (!expense) {
        throw new Error("Expense not found after creation");
      }
      return expense;
    } catch (error) {
      console.error("Error adding expense:", error);
      throw error;
    }
  }
}
  