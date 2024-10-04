import { Module, Global } from '@nestjs/common';
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  providers: [
    {
      provide: 'Kysely',
      useFactory: async (configService: ConfigService) => {
        const db = new Kysely({
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
  exports: ['Kysely'],
})
export class DatabaseModule {}
