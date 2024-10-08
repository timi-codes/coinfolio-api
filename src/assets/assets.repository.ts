import { Injectable, NotFoundException } from '@nestjs/common';
import {
  Asset,
  Database,
  FungibleToken,
  NonFungibleToken,
  User,
} from '../database/db.interface';
import { Insertable, Selectable, sql } from 'kysely';

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

  async findOrCreate(data: Insertable<Asset>) {
    const existingAsset = await this.db
      .selectFrom('assets')
      .where('contract_address', '=', data.contract_address)
      .selectAll()
      .executeTakeFirst();

    if (existingAsset) {
      return existingAsset;
    }
    return this.create(data);
  }

  async ft(data: Insertable<FungibleToken>) {
    const ft = await this.db
      .insertInto('fts')
      .values({ ...data })
      .returningAll()
      .executeTakeFirstOrThrow();
    return ft;
  }

  async nft(data: Insertable<NonFungibleToken>) {
    const nft = await this.db
      .insertInto('nfts')
      .values({ ...data })
      .returningAll()
      .executeTakeFirstOrThrow();
    return nft;
  }

  async findAllBy(user: Selectable<User>) {
    const result = await this.db
      .selectFrom('assets')
      .leftJoin('fts', 'fts.asset_id', 'assets.id')
      .leftJoin('nfts', 'nfts.asset_id', 'assets.id')
      .select((eb) => [
        eb
          .fn<string>('coalesce', [eb.ref('fts.id'), eb.ref('nfts.id')])
          .as('id'),
        'assets.name',
        'assets.symbol',
        'assets.chain',
        'assets.contract_address',
        'assets.type',
        eb.ref('nfts.token_id').as('token_id'),
        eb.ref('fts.quantity').as('quantity'),
        eb
          .fn<string>('coalesce', [
            eb.ref('nfts.created_at'),
            eb.ref('fts.created_at'),
          ])
          .as('created_at'),
        eb
          .fn<string>('coalesce', [
            eb.ref('nfts.updated_at'),
            eb.ref('fts.updated_at'),
          ])
          .as('updated_at'),
      ])
      .where((eb) =>
        eb.and([
          eb.or([
            eb('fts.user_id', '=', user.id),
            eb('nfts.user_id', '=', user.id),
          ]),
          eb.or([eb('fts.id', 'is not', null), eb('nfts.id', 'is not', null)]),
        ]),
      )
      .orderBy('assets.created_at', 'desc')
      .execute();

    const assets: Selectable<
      Asset & { quantity: number | null; token_id: string | null }
    >[] = result.map((asset) => {
      const filteredAsset = Object.fromEntries(
        Object.entries(asset).filter(([, value]) => value !== null),
      ) as unknown as Selectable<
        Asset & { quantity: number | null; token_id: string | null }
      >;
      return filteredAsset;
    });
    return assets;
  }

  findOne(id: number) {
    return `This action returns a #${id} asset`;
  }

  async remove(id: string, user: Selectable<User>) {
    const result = await this.db
      .selectFrom('assets')
      .leftJoin('fts', 'fts.asset_id', 'assets.id')
      .leftJoin('nfts', 'nfts.asset_id', 'assets.id')
      .select(['assets.type'])
      .where((eb) =>
        eb.or([
          eb.and([eb('fts.id', '=', id), eb('fts.user_id', '=', user.id)]),
          eb.and([eb('nfts.id', '=', id), eb('nfts.user_id', '=', user.id)]),
        ]),
      )
      .executeTakeFirst();

    if (!result) throw new NotFoundException('Asset not found');

    const table = result.type === 'ERC-20' ? 'fts' : 'nfts';

    const deletedRows = await this.db
      .deleteFrom(table)
      .where('id', '=', id)
      .executeTakeFirst();
    return deletedRows;
  }

  async getHistoricalValue(id: string, user: Selectable<User>) {
    const result = await this.db
      .selectFrom('assets')
      .leftJoin('fts', 'fts.asset_id', 'assets.id')
      .leftJoin('nfts', 'nfts.asset_id', 'assets.id')
      .leftJoin(
        'asset_daily_prices',
        'asset_daily_prices.contract_address',
        'assets.contract_address',
      )
      .select((eb) => [
        eb.ref('asset_daily_prices.created_at').as('date'),
        sql<number>`COALESCE(price * quantity, price)`.as('total_value'),
        sql<number>`COALESCE(
                        (price - coalesce(fts.price_at_creation, nfts.price_at_creation)) * quantity,
                        price - coalesce(fts.price_at_creation, nfts.price_at_creation)
                    )
                `.as('PnL'),
      ])
      .where((eb) =>
        eb.and([
          eb.or([eb('fts.asset_id', '=', id), eb('nfts.asset_id', '=', id)]),
          eb.or([
            eb('fts.user_id', '=', user.id),
            eb('nfts.user_id', '=', user.id),
          ]),
        ]),
      )
      .execute();

    return result;
  }
}
