import { Kysely } from 'kysely';
import {
  IAsset,
  IFungibleToken,
  INonFungibleToken,
} from '../assets/interfaces/assets.interface';

interface ITables {
  assets: IAsset;
  fts: IFungibleToken;
  nfts: INonFungibleToken;
}

export class DB extends Kysely<ITables> { }
