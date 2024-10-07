import type { Kysely } from 'kysely';
import { Database } from '../db.interface';

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .alterTable('nfts')
    .addUniqueConstraint('unique_asset_token', ['asset_id', 'token_id'])
    .execute();
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema
    .alterTable('nfts')
    .dropConstraint('unique_asset_token')
    .execute();
}
