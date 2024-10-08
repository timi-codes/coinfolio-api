import { Injectable, Logger } from '@nestjs/common';
import { Selectable } from 'kysely';
import { AssetsService } from '../assets/assets.service';
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
    private readonly assetsService: AssetsService,
    private readonly httpService: HttpService,
    private readonly db: Database,
    private readonly configService: ConfigService,
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
            console.log(error);
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
