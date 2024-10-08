import { IUser } from './user.entities';

export interface Auth {
  authToken: string;
  user: IUser;
}
