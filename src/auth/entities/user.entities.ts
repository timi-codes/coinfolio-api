import { Selectable } from 'kysely';
import { User } from '../../database/db.interface';

export type IUser = Selectable<User>;
