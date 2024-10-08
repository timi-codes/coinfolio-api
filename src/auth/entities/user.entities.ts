import { Selectable } from 'kysely';
import { User } from 'src/database/db.interface';

export type IUser = Selectable<User>;
