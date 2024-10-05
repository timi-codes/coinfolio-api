import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import Moralis from 'moralis';
import { catchError, firstValueFrom } from 'rxjs';
import { AssetsRepository } from '../assets/assets.repository';
import { AssetType } from '../assets/entities/asset.entity';
import { Database } from '../database/db.interface';
import { map } from 'rxjs';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private readonly db: Database,
    private readonly assetsRepository: AssetsRepository,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyPriceUpdate() {
    this.logger.debug('Running daily price update for all assets');

    const assets = await this.assetsRepository.findAll();

    const promises = assets.map(async (asset) => {
      try {
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
          price = priceData.floor_price_usd;
        }

        await this.db
          .insertInto('asset_daily_prices')
          .values({
            name: asset.name,
            symbol: asset.symbol,
            contract_address: asset.contract_address,
            chain: asset.chain,
            price: price,
          })
          .execute();

        this.logger.debug(
          `Updated price for asset ${asset.name}(${asset.symbol}): ${price}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to fetch price for asset ${asset.name}: ${error.message}`,
        );
      }
    });

    await Promise.all(promises);

    this.logger.debug('Daily price update completed');
  }
}
