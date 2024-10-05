import { Injectable } from '@nestjs/common';
import {
  Asset,
  Database,
  FungibleToken,
  NonFungibleToken,
} from 'src/database/db.interface';
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

  findAll() {
    return `This action returns all assets`;
  }

  findOne(id: number) {
    return `This action returns a #${id} asset`;
  }

  remove(id: number) {
    return `This action removes a #${id} asset`;
  }
}
