#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/0417773871e5af663414173b51161c90ca60fb7588bfc3552b79ac58665072f9/contract';
import endContract from '../../snapshots/0417773871e5af663414173b51161c90ca60fb7588bfc3552b79ac58665072f9/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/2b79f238152ce1fedfd7fbd19b1601b02e3cdcaabe49fe544b4e03d0311433ac/contract';
import startContract from '../../snapshots/2b79f238152ce1fedfd7fbd19b1601b02e3cdcaabe49fe544b4e03d0311433ac/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  col,
  fn,
  primaryKey,
} from '@prisma/orm-postgres/migration';
import postgres from '@prisma/orm-postgres/runtime';

// Query builder construit sur le contrat de fin (n'ouvre aucune connexion ici)
const { sql: db, contract } = postgres<End>({ contractJson: endContract });

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropColumn({ schema: 'public', table: 'expense', column: 'payer' }),
      this.createTable({
        schema: 'public',
        table: 'participations',
        columns: [
          col('expenseId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('userId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['expenseId', 'userId'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'transfer',
        columns: [
          col('amount', 'float8', { notNull: true, codecRef: { codecId: 'pg/float8@1' } }),
          col('date', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('sourceId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('targetId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'user',
        columns: [
          col('bankAccount', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addColumn({
        schema: 'public',
        table: 'expense',
        column: col('payerId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
      }),
      // payerId devient obligatoire mais les dépenses existantes n'ont pas de payeur (User).
      // Choix du cours : on vide la table expense plutôt que d'écrire une vraie migration de données.
      // check : "il reste du travail" tant qu'une ligne existe ; run : supprime toutes les lignes.
      this.dataTransform(contract, 'wipe-expense-before-payer-migration', {
        check: () => db.public.expense.select('id').limit(1),
        run: () => db.public.expense.delete(),
      }),
      this.setNotNull({ schema: 'public', table: 'expense', column: 'payerId' }),
      this.addUnique({
        schema: 'public',
        table: 'user',
        constraint: 'user_email_key',
        columns: ['email'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'expense',
        index: 'expense_payerId_idx_3d3ae95d',
        columns: ['payerId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'participations',
        index: 'participations_expenseId_idx_69d413fa',
        columns: ['expenseId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'participations',
        index: 'participations_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'transfer',
        index: 'transfer_sourceId_idx_d92a2571',
        columns: ['sourceId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'transfer',
        index: 'transfer_targetId_idx_9852d518',
        columns: ['targetId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'participations',
        foreignKey: {
          name: 'participations_expenseId_fkey',
          columns: ['expenseId'],
          references: { schema: 'public', table: 'expense', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'participations',
        foreignKey: {
          name: 'participations_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'transfer',
        foreignKey: {
          name: 'transfer_sourceId_fkey',
          columns: ['sourceId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'transfer',
        foreignKey: {
          name: 'transfer_targetId_fkey',
          columns: ['targetId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'expense',
        foreignKey: {
          name: 'expense_payerId_fkey',
          columns: ['payerId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
