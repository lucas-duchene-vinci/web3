import { db } from './src/prisma/db.ts';
import initialExpenses from './data/expense.init.json' with { type: 'json' };

async function main() {

  const expensesToInsert = initialExpenses.map((e) => ({
    date: new Date(e.date).toISOString(), 
    description: e.description,
    payer: e.payer,
    amount: e.amount,
  }));

  // Insère toutes les lignes d'un coup et récupère les lignes créées
  const created = await db.orm.public.Expense.createAll(expensesToInsert);
  console.log(`${created.length} dépenses insérées :`);
  console.log(created);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
