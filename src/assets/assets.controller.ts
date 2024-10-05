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
} from '@nestjs/common';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { ValidateUuidPipe } from 'src/common/pipes/validate-uuid.pipe';

@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}
  @Post()
  async create(@Body() createAssetDto: CreateAssetDto) {
    try {
      const asset = await this.assetsService.create(createAssetDto);
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
          'Asset with this contract address already exists',
        );
      }
      throw new HttpException(
        error.message,
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  findAll() {
    return this.assetsService.findAll();
  }

  @Delete(':id')
  @UsePipes(new ValidateUuidPipe())
  async remove(@Param('id') id: string) {
    const result = await this.assetsService.remove(id);

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
  }
}
