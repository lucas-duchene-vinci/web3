import { db } from './src/prisma/db.ts';

// Seed de développement : quelques users, dépenses et transferts.
// À lancer sur une base VIDE (après la migration). Le relancer crée des doublons
// (et échoue sur les emails, qui sont uniques).
async function main() {
  const users = await db.orm.public.User.createAll([
    { name: 'Alice', email: 'alice@example.com', bankAccount: 'BE12 3456 7890 1234' },
    { name: 'Bob', email: 'bob@example.com', bankAccount: null },
    { name: 'Charlie', email: 'charlie@example.com', bankAccount: 'BE98 7654 3210 9876' },
  ]);
  const [alice, bob, charlie] = users;
  console.log(`${users.length} users créés`);

  // Les participants sont reliés avec connect() : Prisma remplit la table Participations.
  const expenses = [
    { description: 'Courses', amount: 45.5, date: '2025-01-16T00:00:00Z', payerId: alice.id, participants: [alice.id, bob.id] },
    { description: 'Restaurant', amount: 80, date: '2025-01-15T00:00:00Z', payerId: bob.id, participants: [alice.id, bob.id, charlie.id] },
    { description: 'Cinéma', amount: 24, date: '2025-01-14T00:00:00Z', payerId: charlie.id, participants: [bob.id, charlie.id] },
  ];
  for (const e of expenses) {
    await db.orm.public.Expense.create({
      description: e.description,
      amount: e.amount,
      date: e.date,
      payerId: e.payerId,
      participants: (p) => p.connect(e.participants.map((id) => ({ id }))),
    });
  }
  console.log(`${expenses.length} dépenses créées`);

  const transfers = await db.orm.public.Transfer.createAll([
    { amount: 20, date: '2025-01-17T00:00:00Z', sourceId: bob.id, targetId: alice.id },
    { amount: 10, date: '2025-01-18T00:00:00Z', sourceId: charlie.id, targetId: bob.id },
  ]);
  console.log(`${transfers.length} transferts créés`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
