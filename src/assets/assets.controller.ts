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
  Req,
} from '@nestjs/common';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { ValidateUuidPipe } from 'src/common/pipes/validate-uuid.pipe';
import { TasksService } from 'src/tasks/tasks.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { AssetType } from './entities/asset.entity';

@Controller('assets')
export class AssetsController {
  constructor(
    private readonly assetsService: AssetsService,
    private readonly tasksService: TasksService,
  ) {}

  @UseGuards(AuthGuard)
  @Post()
  async create(
    @Body() createAssetDto: CreateAssetDto,
    @Req() request: Request,
  ) {
    try {
      const user = request['user'];

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
  async findAllUserAssets(@Req() request: Request) {
    try {
      const user = request['user'];
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
  @UsePipes(new ValidateUuidPipe())
  async remove(@Param('id') id: string, @Req() request: Request) {
    try {
      const user = request['user'];

      const result = await this.assetsService.remove(id, user);

      if (result.numDeletedRows > 0) {
        return {
          success: true,
          message: 'Asset deleted successfully',
        };
      } else {
        return {
          success: true,
          message: 'Asset already deleted or not found',
        };
      }
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('update-prices')
  async updatePrice() {
    await this.tasksService.handleDailyPriceUpdate();
    return {
      success: true,
      message: 'Asset prices updated successfully',
    };
  }
}
