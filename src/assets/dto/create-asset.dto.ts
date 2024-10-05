import { IsNotEmpty, IsNumber, IsString, IsEnum } from 'class-validator';
import { IsERC20 } from '../validators/IsERC20';
import { IsERC721 } from '../validators/IsERC721';
import { AssetType } from '../entities/asset.entity';

export class CreateAssetDto {
  @IsNotEmpty()
  @IsString()
  contract_address: string;

  @IsNotEmpty()
  @IsNumber({}, { message: 'chain must be a number' })
  chain: number;

  @IsString()
  @IsEnum(AssetType, {
    message: 'Asset type need to be of type ERC-20 or ERC-721',
  })
  type: AssetType;

  @IsERC20('type', { message: 'quantity must be set if type is ERC-20' })
  quantity?: bigint;

  @IsERC721('type', { message: 'token_id must be set if type is ERC-721' })
  token_id?: string;
}
