import { sql, type Kysely } from 'kysely';
import { DB } from '../db.interface';

export async function up(db: Kysely<DB>): Promise<void> {
  db.schema
    .createTable('assets')
    .addColumn('id', 'uuid', (col) => col.primaryKey())
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('symbol', 'varchar(10)', (col) => col.notNull())
    .addColumn('contract_address', 'varchar(255)', (col) => col.notNull())
    .addColumn('chain', 'integer', (col) => col.notNull())
    .addColumn('type', 'varchar(20)', (col) =>
      col.notNull().check(sql`type IN ('ERC-20', 'ERC-721')`),
    )
    .execute();

  db.schema
    .createTable('fts')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().references('assets.id').onDelete('cascade'),
    )
    .addColumn('decimals', 'integer', (col) => col.notNull())
    .addColumn('quantity', 'bigint', (col) => col.notNull())
    .execute();

  db.schema
    .createTable('nfts')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().references('assets.id').onDelete('cascade'),
    )
    .addColumn('token_id', 'varchar(255)', (col) => col.notNull())
    .addColumn('image_url', 'varchar(255)', (col) => col.notNull())
    .execute();
}

export async function down(db: Kysely<DB>): Promise<void> {
  await db.schema.dropTable('nfts').execute();
  await db.schema.dropTable('fts').execute();
  await db.schema.dropTable('assets').execute();
}
