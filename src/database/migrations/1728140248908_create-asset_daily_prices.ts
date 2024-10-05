import { sql, type Kysely } from 'kysely';
import { Database } from '../db.interface';

export async function up(db: Kysely<Database>): Promise<void> {
  db.schema
    .createTable('asset_daily_prices')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('symbol', 'varchar(10)', (col) => col.notNull())
    .addColumn('contract_address', 'varchar(255)', (col) =>
      col.notNull().unique(),
    )
    .addColumn('chain', 'varchar(255)', (col) => col.notNull())
    .addColumn('price', 'numeric', (col) => col.notNull())
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`))
    .execute();
}

export async function down(db: Kysely<Database>): Promise<void> {
  db.schema.dropTable('asset_daily_prices').execute();
}
