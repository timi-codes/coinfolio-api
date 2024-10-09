import { forwardRef, Module } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { AssetsModule } from '../assets/assets.module';
import { PortfolioController } from './portfolio.controller';
import { HttpModule } from '@nestjs/axios';
import { PortfolioConsumer } from './portfolio.processor';

@Module({
  imports: [HttpModule, forwardRef(() => AssetsModule)],
  controllers: [PortfolioController],
  providers: [PortfolioService, PortfolioConsumer],
  exports: [PortfolioService],
})
export class PortfolioModule {}
