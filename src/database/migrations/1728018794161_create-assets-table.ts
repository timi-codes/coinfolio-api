import { sql, type Kysely } from 'kysely';
import { Database } from '../db.interface';

export async function up(db: Kysely<Database>): Promise<void> {
  db.schema
    .createTable('assets')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('symbol', 'varchar(10)', (col) => col.notNull())
    .addColumn('contract_address', 'varchar(255)', (col) =>
      col.notNull().unique(),
    )
    .addColumn('chain', 'varchar(255)', (col) => col.notNull())
    .addColumn('type', 'varchar(20)', (col) =>
      col.notNull().check(sql`type IN ('ERC-20', 'ERC-721')`),
    )
    .addColumn('created_at', 'timestamp', (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();

  db.schema
    .createTable('fts')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().references('assets.id').onDelete('cascade'),
    )
    .addColumn('quantity', 'numeric', (col) => col.notNull())
    .addColumn('created_at', 'timestamp', (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();

  db.schema
    .createTable('nfts')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().references('assets.id').onDelete('cascade'),
    )
    .addColumn('token_id', 'varchar(255)', (col) => col.notNull())
    .addColumn('created_at', 'timestamp', (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable('nfts').execute();
  await db.schema.dropTable('fts').execute();
  await db.schema.dropTable('assets').execute();
}
