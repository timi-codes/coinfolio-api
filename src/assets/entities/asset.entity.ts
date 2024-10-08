import { Selectable } from 'kysely';
import { Asset } from 'src/database/db.interface';

export enum AssetType {
  ERC20 = 'ERC-20',
  ERC721 = 'ERC-721',
}

export type IAsset = Selectable<Asset>;
