import { Kysely, Generated } from 'kysely';
import { AssetType } from '../assets/entities/asset.entity';

export interface Asset {
  id: Generated<string>;
  name: string;
  symbol: string;
  contract_address: string;
  chain: number;
  type: AssetType;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface FungibleToken {
  id: Generated<string>;
  quantity: bigint;
}

export interface NonFungibleToken {
  id: Generated<string>;
  token_id: string;
}

interface Tables {
  assets: Asset;
  fts: FungibleToken;
  nfts: NonFungibleToken;
}

export class Database extends Kysely<Tables> {}
