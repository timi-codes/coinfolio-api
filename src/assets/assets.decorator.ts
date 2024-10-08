import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';
import { CreateAssetDto } from './dto/create-asset.dto';
import { applyDecorators } from '@nestjs/common';

export class SwaggerDecorator {
  static getDecorators(route: string) {
    const baseDecorator = [ApiBearerAuth('JWT'), ApiTags('assets')];
    switch (route) {
      case 'create':
        return applyDecorators(
          ...baseDecorator,
          ApiOperation({ summary: 'Create a new asset' }),
          ApiBody({
            description: 'Details of the asset to create',
            type: CreateAssetDto,
          }),
          ApiResponse({
            status: 201,
            description: 'Asset created successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    symbol: { type: 'string' },
                    chain: { type: 'string' },
                    contract_address: { type: 'string' },
                    type: { type: 'string', enum: ['ERC-20', 'ERC-721'] },
                    quantity: { type: 'string' },
                    token_id: { type: 'string' },
                    created_at: { type: 'string', format: 'date-time' },
                    updated_at: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          }),
          ApiResponse({
            status: 409,
            description: 'Conflict due to duplicate asset',
          }),
          ApiResponse({
            status: 400,
            description: 'Bad request',
          }),
        );

      case 'findAllUserAssets':
        return applyDecorators(
          ...baseDecorator,
          ApiOperation({ summary: 'Fetch all user assets' }),
          ApiResponse({
            status: 200,
            description: 'Assets fetched successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                      symbol: { type: 'string' },
                      chain: { type: 'string' },
                      contract_address: { type: 'string' },
                      type: { type: 'string' },
                      quantity: { type: 'string' },
                      created_at: { type: 'string', format: 'date-time' },
                      updated_at: { type: 'string', format: 'date-time' },
                    },
                  },
                },
              },
            },
          }),
          ApiResponse({
            status: 400,
            description: 'Bad request',
          }),
        );

      case 'remove':
        return applyDecorators(
          ...baseDecorator,
          ApiOperation({ summary: 'Remove an asset by ID' }),
          ApiParam({ name: 'id', required: true, description: 'Asset ID' }),
          ApiResponse({
            status: 200,
            description: 'Asset removed successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
              },
            },
          }),
          ApiResponse({
            status: 404,
            description: 'Asset not found',
          }),
          ApiResponse({
            status: 400,
            description: 'Bad request',
          }),
        );

      case 'updatePrice':
        return applyDecorators(
          ...baseDecorator,
          ApiOperation({ summary: 'Update asset prices' }),
          ApiResponse({
            status: 200,
            description: 'Asset prices updated successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
              },
            },
          }),
          ApiResponse({
            status: 400,
            description: 'Bad request',
          }),
        );

      case 'getHistoricalValue':
        return applyDecorators(
          ...baseDecorator,
          ApiOperation({ summary: 'Get historical value of an asset by ID' }),
          ApiParam({ name: 'id', required: true, description: 'Asset ID' }),
          ApiResponse({
            status: 200,
            description: 'Asset value history fetched successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      timestamp: { type: 'string', format: 'date-time' },
                      value: { type: 'number' },
                      PnL: { type: 'number' },
                    },
                  },
                },
              },
            },
          }),
          ApiResponse({
            status: 404,
            description: 'Asset not found',
          }),
          ApiResponse({
            status: 400,
            description: 'Bad request',
          }),
        );

      default:
        return applyDecorators();
    }
  }
}
