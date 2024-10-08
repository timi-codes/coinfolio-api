import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { ApiTags } from '@nestjs/swagger';

@Controller('portfolio')
@ApiTags('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @UseGuards(AuthGuard)
  @Get()
  async getPortfolio(@Req() request: Request) {
    const user = request['user'];
    return this.portfolioService.getPortfolio(user);
  }
}
