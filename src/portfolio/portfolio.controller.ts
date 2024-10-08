import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { SwaggerDecorator } from './portfolio.decorators';
import { IUser } from 'src/auth/entities/user.entities';
import { CurrentUser } from 'src/common/decorator/current-user-decorator';
import { IPortfolioStats } from './entities/portfolio-stats';
import { SuccessResponse } from 'src/common/types/success-response.interface';

@Controller('portfolio')
@ApiTags('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @UseGuards(AuthGuard)
  @Get()
  @SwaggerDecorator.getDecorators('getPortfolio')
  async getPortfolio(
    @CurrentUser() user: IUser,
  ): Promise<SuccessResponse<IPortfolioStats>> {
    try {
      const portfolio = await this.portfolioService.getPortfolio(user);
      return {
        success: true,
        message: 'Portfolio fetched successfully',
        data: portfolio,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch portfolio',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
