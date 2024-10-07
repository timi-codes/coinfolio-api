import { Injectable } from '@nestjs/common';
import { Selectable } from 'kysely';
import { AssetsService } from '../assets/assets.service';
import { Database, User } from '../database/db.interface';

@Injectable()
export class PortfolioService {
  constructor(
    private readonly assetsService: AssetsService,
    private readonly db: Database,
  ) {}

  async getPortfolio(user: Selectable<User>) {
    const assets = await this.assetsService.findAllBy(user);

    const last_daily_prices = await this.db
      .selectFrom('asset_daily_prices')
      .select(['contract_address', 'price', 'created_at'])
      .where(
        'contract_address',
        'in',
        assets.map((asset) => asset.contract_address),
      )
      .distinctOn('contract_address')
      .orderBy('contract_address')
      .orderBy('created_at', 'desc')
      .execute();

    console.log(last_daily_prices);

    return null;
  }
}
