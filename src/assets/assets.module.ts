import { Module } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { AssetsRepository } from './assets.repository';
import { TasksModule } from 'src/tasks/tasks.module';

@Module({
  imports: [TasksModule],
  controllers: [AssetsController],
  providers: [AssetsService, AssetsRepository],
  exports: [AssetsService, AssetsRepository],
})
export class AssetsModule {}
