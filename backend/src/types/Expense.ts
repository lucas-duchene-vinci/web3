import type { User } from "./user.ts";

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

// Ce que le front envoie pour créer une dépense : des ids, pas des objets User
export interface NewExpense {
  date: string;
  description: string;
  amount: number;
  payerId: number;
  participants: number[]; // ids des users participants
}
