import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { PortfolioModule } from '../src/portfolio/portfolio.module';
import { PortfolioService } from '../src/portfolio/portfolio.service';
import { INestApplication } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

describe('Portfolio', () => {
  let app: INestApplication;
  let portfolioService = { getPortfolio: jest.fn() };
  let mockUser = { id: '123', name: 'John Doe' };
  let token: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [PortfolioModule],
    })
      .overrideProvider(PortfolioService)
      .useValue(portfolioService)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();

    const jwtService = moduleRef.get<JwtService>(JwtService);
    token = jwtService.sign({ userId: mockUser.id });
  });

  it(`/GET portfolio`, async () => {
    const mockPortfolioStats = { assets: [], totalValue: 0 };
    portfolioService.getPortfolio = jest
      .fn()
      .mockResolvedValue(mockPortfolioStats);

    const response = await request(app.getHttpServer())
      .get('/portfolio')
      .set('Authorization', `Bearer ${token}`)
      .expect(HttpStatus.OK);

    expect(response.body).toEqual({
      success: true,
      message: 'Portfolio fetched successfully',
      data: mockPortfolioStats,
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
