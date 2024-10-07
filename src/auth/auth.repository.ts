import { Injectable } from '@nestjs/common';
import { Database, User } from '../database/db.interface';
import { Insertable } from 'kysely';

@Injectable()
export class AuthRepository {
  constructor(private readonly db: Database) {}

  async findOrCreate(data: Insertable<User>) {
    const user = await this.db
      .selectFrom('users')
      .where('privy_id', '=', data.privy_id)
      .selectAll()
      .executeTakeFirst();

    if (!user) {
      const newUser = await this.db
        .insertInto('users')
        .values(data)
        .returningAll()
        .executeTakeFirst();
      return newUser;
    }

    return user;
  }

  async findOne(id: string) {
    return this.db.selectFrom('users').where('id', '=', id).executeTakeFirst();
  }
}
