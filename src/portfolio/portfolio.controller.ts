import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { SwaggerDecorator } from './portfolio.decorators';

@Controller('portfolio')
@ApiTags('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @UseGuards(AuthGuard)
  @Get()
  @SwaggerDecorator.getDecorators('getPortfolio')
  async getPortfolio(@Req() request: Request) {
    try {
      const user = request['user'];
      const portfolio = await this.portfolioService.getPortfolio(user.id);
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
