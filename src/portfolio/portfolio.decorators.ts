import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

export class SwaggerDecorator {
  static getDecorators(route: string) {
    const baseDecorator = [ApiBearerAuth('JWT'), ApiTags('portfolio')];
    switch (route) {
      case 'getPortfolio':
        return applyDecorators(
          ...baseDecorator,
          ApiOperation({
            summary: 'Get current portfolio value and PnL',
            description:
              "Provides the current total value of the user's portfolio and the Profit and Loss(PnL) calculation.",
          }),
          ApiResponse({
            status: 200,
            description: 'User portfolio retrieved successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean' },
                message: {
                  type: 'string',
                  example: 'Portfolio fetched successfully',
                },
                data: {
                  type: 'object',
                  properties: {
                    total_value: { type: 'number' },
                    PnL: { type: 'number' },
                  },
                },
              },
            },
          }),
          ApiResponse({
            status: 400,
            description: 'Authorization token is required',
          }),
          ApiResponse({
            status: 401,
            description: 'Unauthorized user',
          }),
        );
      default:
        return applyDecorators();
    }
  }
}
