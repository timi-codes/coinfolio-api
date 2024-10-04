import { Kysely } from 'kysely';
import {
  IAsset,
  IFungibleToken,
  INonFungibleToken,
} from '../assets/assets.interface';

interface ITables {
  assets: IAsset;
  fts: IFungibleToken;
  nfts: INonFungibleToken;
}

export class DB extends Kysely<ITables> {}
