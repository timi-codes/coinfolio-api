import {
  Controller,
  Post,
  UnauthorizedException,
  BadRequestException,
  Get,
  HttpException,
  HttpStatus,
  Body,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { RequireTokenDto } from './dto/token.dto';
import { SwaggerDecorator } from './auth.decorator';
import { SuccessResponse } from '../common/types/success-response.interface';
import { Auth } from './entities/auth.entities';

@Controller('auth')
@ApiTags('exchange-token')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  @SwaggerDecorator('auth')
  async auth(@Body() body: RequireTokenDto): Promise<SuccessResponse<Auth>> {
    try {
      const token = body.token;

      if (!body.token) {
        throw new BadRequestException(
          'Privy access token or test token is required in header',
        );
      }

      const { authToken, user } =
        await this.authService.exchangeAuthToken(token);

      return {
        success: true,
        message: 'successfully authenticated',
        data: {
          authToken,
          user,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new UnauthorizedException('Invalid privy access token');
    }
  }

  @Get('generate-test-token')
  @SwaggerDecorator('generate-test-token')
  async generateTestToken() {
    try {
      const token = await this.authService.generateTestAuthToken();
      return {
        success: true,
        message:
          'Ensure PRIVY_VERIFICATION_ENABLED is set to true in .env for this token to be verified',
        data: {
          token,
        },
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }
}
