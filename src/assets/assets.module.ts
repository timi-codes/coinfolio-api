import { Module } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { AssetsRepository } from './assets.repository';
import { TasksModule } from 'src/tasks/tasks.module';
import { BullModule } from '@nestjs/bullmq';
import { PortfolioModule } from 'src/portfolio/portfolio.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'portfolio',
    }),
    TasksModule,
    PortfolioModule,
  ],
  controllers: [AssetsController],
  providers: [AssetsService, AssetsRepository],
  exports: [AssetsService, AssetsRepository],
})
export class AssetsModule {}
