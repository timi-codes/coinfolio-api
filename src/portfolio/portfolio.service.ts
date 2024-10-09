import { Injectable, Logger } from '@nestjs/common';
import { Selectable, sql } from 'kysely';
import { Asset, Database, User } from '../database/db.interface';
import { AssetType } from '../assets/entities/asset.entity';
import Moralis from 'moralis';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom, map } from 'rxjs';

@Injectable()
export class PortfolioService {
  private readonly logger = new Logger(PortfolioService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly db: Database,
    private readonly configService: ConfigService,
  ) {}

  async getPortfolio(user: Selectable<User>) {
    const portfolio = await this.db
      .selectFrom('assets')
      .leftJoin('fts', 'fts.asset_id', 'assets.id')
      .leftJoin('nfts', 'nfts.asset_id', 'assets.id')
      .select((eb) => [
        eb
          .selectFrom('asset_daily_prices')
          .select((eb2) => [
            eb2.fn
              .max(sql<string>`COALESCE((price * fts.quantity), price)`)
              .as('aggregated_total_value'),
          ])
          .whereRef(
            'asset_daily_prices.contract_address',
            '=',
            'assets.contract_address',
          )
          .groupBy('asset_daily_prices.created_at')
          .orderBy('asset_daily_prices.created_at', 'desc')
          .limit(1)
          .as('total_value'),
        eb
          .selectFrom('asset_daily_prices')
          .select((eb2) => [
            eb2.fn
              .max(
                sql<string>`(asset_daily_prices.price - coalesce(fts.price_at_creation, nfts.price_at_creation)) * coalesce(fts.quantity, 1)`,
              )
              .as('aggregated_PnL'),
          ])
          .whereRef(
            'asset_daily_prices.contract_address',
            '=',
            'assets.contract_address',
          )
          .groupBy('asset_daily_prices.created_at')
          .orderBy('asset_daily_prices.created_at', 'desc')
          .limit(1)
          .as('pnl'),
      ])
      .where((eb) =>
        eb.or([
          eb('fts.user_id', '=', user.id),
          eb('nfts.user_id', '=', user.id),
        ]),
      )
      .execute();

    const result = portfolio.reduce(
      (acc, curr) => {
        if (curr.total_value) {
          acc.total_value += parseFloat(curr.total_value);
        }
        if (curr.pnl) {
          acc.pnl += parseFloat(curr.pnl);
        }
        return acc;
      },
      { total_value: 0, pnl: 0 },
    );

    return result;
  }

  async getAssetPrice(asset: Selectable<Asset>) {
    let price: number;

    if (asset.type === AssetType.ERC20) {
      const priceData = await Moralis.EvmApi.token.getTokenPrice({
        chain: asset.chain,
        address: asset.contract_address,
      });

      price = priceData.result.usdPrice;
    } else if (asset.type === AssetType.ERC721) {
      const response = this.httpService
        .get(
          `https://deep-index.moralis.io/api/v2.2/nft/${asset.contract_address}/floor-price?chain=0x1`,
          {
            headers: {
              'X-API-Key': this.configService.get('MORALIS_API_KEY'),
            },
          },
        )
        .pipe(
          map((response) => response.data),
          catchError((error) => {
            this.logger.error(
              `Failed to fetch price for asset ${asset.name}: ${error.message}`,
            );
            throw error;
          }),
        );
      const priceData = await firstValueFrom(response);

      price = parseFloat(priceData.floor_price_usd);
    }

    return price;
  }
}
