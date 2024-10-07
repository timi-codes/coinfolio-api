import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAssetDto } from './dto/create-asset.dto';
import { AssetsRepository } from './assets.repository';
import Moralis from 'moralis';
import { AssetType } from './entities/asset.entity';
import { ConfigService } from '@nestjs/config';
import { TokenMetadata } from './types/token-metadata.interface';
import {
  GetNFTMetadataResponseAdapter,
  GetTokenMetadataResponseAdapter,
} from '@moralisweb3/common-evm-utils';
import { User } from 'src/database/db.interface';
import { Insertable, Selectable } from 'kysely';

@Injectable()
export class AssetsService {
  constructor(
    private readonly assetsRepository: AssetsRepository,
    private readonly configService: ConfigService,
  ) {
    const moralisApiKey = this.configService.get<string>('MORALIS_API_KEY');
    Moralis.start({ apiKey: moralisApiKey });
  }

  async create(user: Insertable<User>, data: CreateAssetDto) {
    const tokenMetadata = await this.fetchTokenMetadata(data);

    const asset = await this.assetsRepository.findOrCreate({
      name: tokenMetadata.name,
      symbol: tokenMetadata.symbol,
      contract_address: tokenMetadata.token_address || data.contract_address,
      chain: data.chain,
      type: data.type,
    });

    if (data.type === AssetType.ERC721) {
      const nft = await this.assetsRepository.nft({
        token_id: tokenMetadata.token_id,
        user_id: user.id,
        asset_id: asset.id,
      });
      return { ...asset, ...nft };
    } else if (data.type === AssetType.ERC20) {
      const token = await this.assetsRepository.ft({
        quantity: data.quantity,
        user_id: user.id,
        asset_id: asset.id,
      });

      return {
        ...asset,
        ...token,
      };
    }
  }

  findAllBy(user: Selectable<User>) {
    return this.assetsRepository.findAllBy(user);
  }

  remove(id: string, user: Selectable<User>) {
    return this.assetsRepository.remove(id, user);
  }

  private async fetchTokenMetadata(
    data: CreateAssetDto,
  ): Promise<TokenMetadata> {
    let response:
      | GetNFTMetadataResponseAdapter
      | GetTokenMetadataResponseAdapter
      | null;

    try {
      if (data.type === AssetType.ERC721) {
        response = await Moralis.EvmApi.nft.getNFTMetadata({
          chain: data.chain,
          normalizeMetadata: true,
          address: data.contract_address,
          tokenId: data.token_id,
        });

        if (!response || !response.raw) {
          throw new BadRequestException('Invalid contract address or token ID');
        }
        return response.raw;
      } else if (data.type === AssetType.ERC20) {
        response = await Moralis.EvmApi.token.getTokenMetadata({
          chain: data.chain,
          addresses: [data.contract_address],
        });

        if (!response || !response.raw || response.raw.length === 0) {
          throw new BadRequestException('Invalid contract address');
        }
        return response.raw[0];
      } else {
        throw new BadRequestException('Unsupported asset type');
      }
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Failed to fetch token metadata',
      );
    }
  }
}
