import { Module } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { AssetsModule } from 'src/assets/assets.module';
import { PortfolioController } from './portfolio.controller';
@Module({
  imports: [AssetsModule],
  controllers: [PortfolioController],
  providers: [PortfolioService],
})
export class PortfolioModule {}
