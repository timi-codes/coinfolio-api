import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RequireTokenDto } from './dto/token.dto';
import { applyDecorators } from '@nestjs/common';

export const SwaggerDecorator = (route: string) => {
  switch (route) {
    case 'auth':
      return applyDecorators(
        ApiOperation({ summary: 'Authenticate user with privy or test token' }),
        ApiBody({
          description: 'Token required for authentication',
          type: RequireTokenDto,
        }),
        ApiResponse({
          status: 200,
          description: 'User authenticated successfully',
          schema: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  authToken: { type: 'string' },
                  user: {
                    type: 'object',
                    example: {
                      id: '1c3e957d-854e-4011-a09a-fed2e9654c18',
                      privy_id: '19b5776d-e6e6-4b7d-a30f-d247daa6731d',
                      created_at: '2024-10-08T15:00:17.499Z',
                    },
                  },
                },
              },
            },
          },
        }),
        ApiResponse({
          status: 400,
          description:
            'Privy access token or test token is missing in the request body',
        }),
        ApiResponse({
          status: 401,
          description: 'Invalid privy access token',
        }),
      );
    case 'generate-test-token':
      return applyDecorators(
        ApiOperation({
          summary:
            "Generate a test token for authentication instead of privy's",
        }),
        ApiResponse({
          status: 200,
          description: 'Returns a test token for authentication',
          schema: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: {
                type: 'object',
                properties: {
                  token: { type: 'string' },
                },
              },
            },
          },
        }),
        ApiResponse({
          status: 500,
          description: 'Internal server error',
        }),
      );
    default:
      return applyDecorators();
  }
};
