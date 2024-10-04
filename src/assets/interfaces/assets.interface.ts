import { Generated } from 'kysely';

export interface IAsset {
  id: Generated<string>;
  name: string;
  symbol: string;
  contractAddress: string;
  chain: number;
  type: 'ERC-20' | 'ERC-721';
}

export interface IFungibleToken {
  id: Generated<string>;
  decimals: number;
  quantity: bigint;
}

export interface INonFungibleToken {
  id: Generated<string>;
  tokenId: string;
  name: string;
  imageUrl: string;
}
