import { Injectable } from '@nestjs/common';
import {
  Asset,
  Database,
  FungibleToken,
  NonFungibleToken,
} from '../database/db.interface';
import { Insertable } from 'kysely';

@Injectable()
export class AssetsRepository {
  constructor(private readonly db: Database) {}

  async create(data: Insertable<Asset>) {
    const asset = await this.db
      .insertInto('assets')
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow();
    return asset;
  }

  async ft(asset_id: string, data: Omit<FungibleToken, 'id'>) {
    const ft = await this.db
      .insertInto('fts')
      .values({
        id: asset_id,
        ...data,
      })
      .returningAll()
      .executeTakeFirstOrThrow();
    return ft;
  }

  async nft(asset_id: string, data: Omit<NonFungibleToken, 'id'>) {
    const nft = await this.db
      .insertInto('nfts')
      .values({
        id: asset_id,
        ...data,
      })
      .returningAll()
      .executeTakeFirstOrThrow();
    return nft;
  }

  async findAll() {
    const result = await this.db
      .selectFrom('assets')
      .leftJoin('fts', 'fts.id', 'assets.id')
      .leftJoin('nfts', 'nfts.id', 'assets.id')
      .select([
        'assets.id',
        'assets.name',
        'assets.symbol',
        'assets.contract_address',
        'assets.chain',
        'assets.type',
        'assets.created_at',
        'assets.updated_at',
        'fts.quantity',
        'nfts.token_id',
      ])
      .where((eb) =>
        eb.or([
          eb('fts.quantity', 'is not', null),
          eb('nfts.token_id', 'is not', null),
        ]),
      )
      .orderBy('assets.created_at', 'desc')
      .execute();

    // Remove null quantity and token_id values
    const assets = result.map((asset) =>
      Object.fromEntries(
        Object.entries(asset).filter(([, value]) => value !== null),
      ),
    );
    return assets;
  }

  findOne(id: number) {
    return `This action returns a #${id} asset`;
  }

  async remove(id: string) {
    return await this.db
      .deleteFrom('assets')
      .where('assets.id', '=', id)
      .executeTakeFirst();
  }
}
