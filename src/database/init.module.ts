import { Module, Global } from '@nestjs/common';
import { PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';
import { Database } from './db.interface';

@Global()
@Module({
  exports: [Database],
  providers: [
    {
      provide: Database,
      useFactory: async (configService: ConfigService) => {
        const db = new Database({
          dialect: new PostgresDialect({
            pool: new Pool({
              host: configService.get('DB_HOST'),
              database: configService.get('DB_NAME'),
              user: configService.get('DB_USER'),
              password: configService.get('DB_PASSWORD'),
              port: configService.get<number>('DB_PORT', 5432),
            }),
          }),
        });
        return db;
      },
      inject: [ConfigService],
    },
  ],
})
export class DatabaseModule {}
