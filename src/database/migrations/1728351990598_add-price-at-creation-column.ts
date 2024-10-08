import type { Kysely } from 'kysely';
import { Database } from '../db.interface';

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .alterTable('fts')
    .addColumn('price_at_creation', 'numeric')
    .execute();
  await db.schema
    .alterTable('nfts')
    .addColumn('price_at_creation', 'numeric')
    .execute();
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.alterTable('fts').dropColumn('price_at_creation').execute();
  await db.schema.alterTable('nfts').dropColumn('price_at_creation').execute();
}
