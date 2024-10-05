import { Injectable } from '@nestjs/common';
import { CreateAssetDto } from './dto/create-asset.dto';
import { AssetsRepository } from './assets.repository';
import Moralis from 'moralis';
import { AssetType } from './entities/asset.entity';
import { ConfigService } from '@nestjs/config';
import { TokenMetadata } from './types/token-metadata.interface';

@Injectable()
export class AssetsService {
  constructor(
    private readonly assetsRepository: AssetsRepository,
    private readonly configService: ConfigService,
  ) {
    const moralisApiKey = this.configService.get<string>('MORALIS_API_KEY');
    Moralis.start({ apiKey: moralisApiKey });
  }

  async create(data: CreateAssetDto) {
    const tokenMetadata = await this.fetchTokenMetadata(data);

    const asset = await this.assetsRepository.create({
      name: tokenMetadata.name,
      symbol: tokenMetadata.symbol,
      contract_address: tokenMetadata.token_address || data.contract_address,
      chain: data.chain,
      type: data.type,
    });

    if (data.type === AssetType.ERC721) {
      const nft = await this.assetsRepository.nft(asset.id, {
        token_id: tokenMetadata.token_id,
      });
      return { ...asset, token_id: nft.token_id };
    } else if (data.type === AssetType.ERC20) {
      const token = await this.assetsRepository.ft(asset.id, {
        quantity: data.quantity,
      });
      return { ...asset, quantity: token.quantity };
    }
  }

  findAll() {
    return `This action returns all assets`;
  }

  remove(id: number) {
    return `This action removes a #${id} asset`;
  }

  private async fetchTokenMetadata(
    data: CreateAssetDto,
  ): Promise<TokenMetadata> {
    if (data.type === AssetType.ERC721) {
      const response = await Moralis.EvmApi.nft.getNFTMetadata({
        chain: data.chain,
        normalizeMetadata: true,
        address: data.contract_address,
        tokenId: data.token_id,
      });
      return response.raw;
    } else if (data.type === AssetType.ERC20) {
      const response = await Moralis.EvmApi.token.getTokenMetadata({
        chain: data.chain,
        addresses: [data.contract_address],
      });
      return response.raw[0];
    } else {
      throw new Error('Unsupported asset type');
    }
  }
}
