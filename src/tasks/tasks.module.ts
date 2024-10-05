import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from './tasks.service';
import { HttpModule } from '@nestjs/axios';
import { AssetsRepository } from 'src/assets/assets.repository';

@Module({
  imports: [HttpModule, ScheduleModule.forRoot()],
  providers: [TasksService, AssetsRepository],
  exports: [TasksService],
})
export class TasksModule {}
