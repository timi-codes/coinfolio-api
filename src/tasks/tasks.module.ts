import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from './tasks.service';
import { PortfolioModule } from 'src/portfolio/portfolio.module';

@Module({
  imports: [ScheduleModule.forRoot(), PortfolioModule],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
