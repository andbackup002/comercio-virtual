import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpException } from '@nestjs/common';
import { RateLimitMiddleware } from './rate-limit.middleware';

describe('RateLimitMiddleware', () => {
  let middleware: RateLimitMiddleware;
  let cacheManager: jest.Mocked<any>;

  beforeEach(async () => {
    const mockCacheManager = {
      get: jest.fn(),
      set: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RateLimitMiddleware,
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    middleware = module.get<RateLimitMiddleware>(RateLimitMiddleware);
    cacheManager = module.get(CACHE_MANAGER);
  });

  describe('use', () => {
    let mockRequest: any;
    let mockResponse: any;
    let mockNext: jest.Mock;

    beforeEach(() => {
      mockRequest = {
        ip: '127.0.0.1',
        path: '/auth/login',
      };

      mockResponse = {
        setHeader: jest.fn(),
      };

      mockNext = jest.fn();
    });

    it('deve permitir requisição quando dentro do limite', async () => {
      cacheManager.get.mockResolvedValue(0);

      await middleware.use(mockRequest, mockResponse, mockNext);

      expect(cacheManager.get).toHaveBeenCalledWith('ratelimit:127.0.0.1:/auth/login');
      expect(cacheManager.set).toHaveBeenCalledWith(
        'ratelimit:127.0.0.1:/auth/login',
        1,
        300
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 5);
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', 4);
      expect(mockNext).toHaveBeenCalled();
    });

    it('deve bloquear requisição quando exceder o limite', async () => {
      cacheManager.get.mockResolvedValue(5);

      await expect(middleware.use(mockRequest, mockResponse, mockNext))
        .rejects
        .toThrow(HttpException);

      expect(mockNext).not.toHaveBeenCalled();
    });

    it('deve usar limite padrão para rotas não configuradas', async () => {
      mockRequest.path = '/unknown/route';
      cacheManager.get.mockResolvedValue(0);

      await middleware.use(mockRequest, mockResponse, mockNext);

      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 500);
      expect(cacheManager.set).toHaveBeenCalledWith(
        'ratelimit:127.0.0.1:/unknown/route',
        1,
        3600
      );
    });

    it('deve aplicar diferentes limites para diferentes rotas', async () => {
      // Testando rota de produtos
      mockRequest.path = '/products';
      cacheManager.get.mockResolvedValue(0);

      await middleware.use(mockRequest, mockResponse, mockNext);

      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 1000);

      // Testando rota de pedidos
      mockRequest.path = '/orders';
      await middleware.use(mockRequest, mockResponse, mockNext);

      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 100);
    });
  });
});