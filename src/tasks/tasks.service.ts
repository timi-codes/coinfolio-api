import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Database } from '../database/db.interface';
import { PortfolioService } from 'src/portfolio/portfolio.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private readonly db: Database,
    private readonly portfolioService: PortfolioService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyPriceUpdate() {
    this.logger.debug('Running daily price update for all assets');

    const assets = await this.db.selectFrom('assets').selectAll().execute();

    const promises = assets.map(async (asset) => {
      try {
        const price = await this.portfolioService.getAssetPrice(asset);

        await this.db
          .insertInto('asset_daily_prices')
          .values({
            name: asset.name,
            symbol: asset.symbol,
            contract_address: asset.contract_address,
            chain: asset.chain,
            price,
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
