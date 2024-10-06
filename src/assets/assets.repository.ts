import { Injectable, NotFoundException } from '@nestjs/common';
import {
  Asset,
  Database,
  FungibleToken,
  NonFungibleToken,
  User,
} from '../database/db.interface';
import { Insertable, Selectable } from 'kysely';

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
    const assets: Selectable<Asset>[] = result.map((asset) => {
      const filteredAsset = Object.fromEntries(
        Object.entries(asset).filter(([, value]) => value !== null),
      ) as Selectable<Asset>;
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
}
