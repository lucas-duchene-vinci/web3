import * as z from "zod";

export interface User {
  id: number;
  name: string;
  email: string;
  bankAccount: string | null;
}

// Ce que l'API renvoie
export interface Expense {
  id: number;
  date: string;
  description: string;
  amount: number;
  payerId: number;
  payer: User;
  participants: User[];
}

// Ce que le front envoie pour créer une dépense (des ids, pas des objets User)
export interface NewExpense {
  date: string;
  description: string;
  amount: number;
  payerId: number;
  participants: number[];
}

// Règles de validation du formulaire (adaptées au modèle avec des users) :
// - description : optionnelle, 200 caractères max
// - payerId : id d'un user (entier positif) — remplace l'ancien "Bob" ou "Alice"
// - amount : nombre décimal strictement positif
// - date : obligatoire
// - participantsRaw : au moins un id, sous la forme "1, 2, 3"
export const ExpenseFormSchema = z.object({
  description: z
    .string()
    .trim()
    .max(200, "Description cannot exceed 200 characters"),
  payerId: z
    .number({ error: "Payer ID is required" }) // champ vide => NaN => ce message
    .int("Payer ID must be an integer")
    .positive("Payer ID must be a positive integer"),
  amount: z
    .number({ error: "Amount is required" })
    .positive("Amount must be a positive number"),
  date: z.string().min(1, "Date is required"),
  participantsRaw: z
    .string()
    .regex(/^\s*\d+\s*(,\s*\d+\s*)*$/, "Enter at least one participant ID, comma-separated (e.g. 1, 2)"),
});

export type ExpenseFormValues = z.infer<typeof ExpenseFormSchema>;
