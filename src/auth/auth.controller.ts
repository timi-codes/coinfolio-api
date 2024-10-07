import {
  Controller,
  Post,
  Headers,
  UnauthorizedException,
  BadRequestException,
  Get,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  async auth(@Headers('Authorization') authorization: string) {
    try {
      if (!authorization) {
        throw new BadRequestException(
          'Privy access token or test token is required in header',
        );
      }

      const privyToken = authorization.replace('Bearer ', '');

      const { authToken, user } =
        await this.authService.exchangeAuthToken(privyToken);

      return {
        success: true,
        data: {
          authToken,
          user,
        },
      };
    } catch (error) {
      console.error(error);
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new UnauthorizedException('Invalid privy access token');
    }
  }

  @Get('generate-test-token')
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
