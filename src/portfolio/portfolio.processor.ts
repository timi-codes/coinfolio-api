import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PortfolioService } from './portfolio.service';
import { AssetType } from '../assets/entities/asset.entity';
import { Asset, Database } from '../database/db.interface';
import { Selectable } from 'kysely';

@Processor('portfolio')
export class PortfolioConsumer extends WorkerHost {
  constructor(
    private readonly portfolioService: PortfolioService,
    private readonly db: Database,
  ) {
    super();
  }

  async process(job: Job<Selectable<Asset>, void, string>): Promise<void> {
    switch (job.name) {
      case 'set-price-at-asset-creation': {
        const asset = job.data;
        const price = await this.portfolioService.getAssetPrice(asset);
        const table = asset.type === AssetType.ERC721 ? 'nfts' : 'fts';

        await this.db
          .updateTable(table)
          .set({ price_at_creation: price })
          .where('id', '=', asset.id)
          .execute();
        break;
      }
      default:
        throw new Error('Invalid job name');
    }
  }
}
