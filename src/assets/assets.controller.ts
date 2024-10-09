import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpException,
  ConflictException,
  HttpStatus,
  UsePipes,
  UseGuards,
} from '@nestjs/common';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { ValidateUuidPipe } from '../common/pipes/validate-uuid.pipe';
import { TasksService } from '../tasks/tasks.service';
import { AuthGuard } from '../auth/auth.guard';
import { AssetType, IAsset } from './entities/asset.entity';
import { SwaggerDecorator } from './assets.decorator';
import { SuccessResponse } from '../common/types/success-response.interface';
import { CurrentUser } from '../common/decorator/current-user-decorator';
import { IUser } from '../auth/entities/user.entities';
import { IPortfolioStats } from '../portfolio/entities/portfolio-stats';

@Controller('assets')
export class AssetsController {
  constructor(
    private readonly assetsService: AssetsService,
    private readonly tasksService: TasksService,
  ) {}

  @UseGuards(AuthGuard)
  @Post()
  @SwaggerDecorator.getDecorators('create')
  async create(
    @Body() createAssetDto: CreateAssetDto,
    @CurrentUser() user: IUser,
  ): Promise<SuccessResponse<IAsset>> {
    try {
      const asset = await this.assetsService.create(user, createAssetDto);
      return {
        success: true,
        message: `${asset.name}(${asset.symbol}) added successfully`,
        data: asset,
      };
    } catch (error) {
      if (
        error.message.includes('duplicate key value violates unique constraint')
      ) {
        throw new ConflictException(
          createAssetDto.type === AssetType.ERC721
            ? 'NFT with this contract address and token ID already exists'
            : 'Asset with this contract address already exists',
        );
      }
      throw new HttpException(
        error.message,
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(AuthGuard)
  @Get()
  @SwaggerDecorator.getDecorators('findAllUserAssets')
  async findAllUserAssets(
    @CurrentUser() user: IUser,
  ): Promise<SuccessResponse<IAsset[]>> {
    try {
      const assets = await this.assetsService.findAllBy(user);
      return {
        success: true,
        message: 'Assets fetched successfully',
        data: assets,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  @SwaggerDecorator.getDecorators('remove')
  @UsePipes(new ValidateUuidPipe())
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: IUser,
  ): Promise<SuccessResponse<null>> {
    try {
      const result = await this.assetsService.remove(id, user);

      if (result.numDeletedRows > 0) {
        return {
          success: true,
          message: 'Asset removed successfully',
        };
      } else {
        return {
          success: true,
          message: 'Asset already removed or not found',
        };
      }
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(AuthGuard)
  @Get('/:id/history')
  @SwaggerDecorator.getDecorators('getHistoricalValue')
  async getHistoricalValue(
    @Param('id') id: string,
    @CurrentUser() user: IUser,
  ): Promise<SuccessResponse<IPortfolioStats[]>> {
    try {
      const assets = await this.assetsService.getHistoricalValue(id, user);
      return {
        success: true,
        message: 'Asset value history fetched successfully',
        data: assets,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('update-prices')
  @SwaggerDecorator.getDecorators('updatePrice')
  async updatePrice() {
    try {
      await this.tasksService.handleDailyPriceUpdate();
      return {
        success: true,
        message: 'Asset prices updated successfully',
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }
}
