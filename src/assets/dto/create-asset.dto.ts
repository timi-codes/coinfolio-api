import { IsNotEmpty, IsNumber, IsString, IsEnum } from 'class-validator';
import { IsERC20 } from '../validators/IsERC20';
import { IsERC721 } from '../validators/IsERC721';
import { AssetType } from '../entities/asset.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAssetDto {
  @ApiProperty({
    description: 'The smart contract address of the asset',
    type: String,
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  @IsNotEmpty()
  @IsString()
  contract_address: string;

  @ApiProperty({
    description: 'The blockchain network ID (chain) on which the asset exists',
    type: Number,
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber({}, { message: 'chain must be a number' })
  chain: number;

  @ApiProperty({
    description: 'The type of asset (ERC-20 or ERC-721)',
    enum: AssetType,
    example: AssetType.ERC20,
  })
  @IsString()
  @IsEnum(AssetType, {
    message: 'Asset type needs to be of type ERC-20 or ERC-721',
  })
  type: AssetType;

  @ApiProperty({
    description: 'The quantity of the asset (required if type is ERC-20)',
    type: String,
    example: '1000',
    required: false,
  })
  @IsERC20('type', { message: 'quantity must be set if type is ERC-20' })
  quantity?: bigint;

  @ApiProperty({
    description: 'The token ID of the asset (required if type is ERC-721)',
    type: String,
    example: '123456',
    required: false,
  })
  @IsERC721('type', { message: 'token_id must be set if type is ERC-721' })
  token_id?: string;
}
