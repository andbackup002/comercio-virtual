import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { AuthService } from './auth.service';
import { ClientProxy } from '@nestjs/microservices';
import { of } from 'rxjs';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: jest.Mocked<JwtService>;
  let cacheManager: jest.Mocked<any>;
  let authClient: jest.Mocked<ClientProxy>;

  beforeEach(async () => {
    const mockJwtService = {
      verify: jest.fn(),
    };

    const mockCacheManager = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const mockAuthClient = {
      send: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
        {
          provide: 'AUTH_SERVICE',
          useValue: mockAuthClient,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get(JwtService);
    cacheManager = module.get(CACHE_MANAGER);
    authClient = module.get('AUTH_SERVICE');
  });

  describe('login', () => {
    const loginData = { email: 'test@test.com', password: '123456' };
    const mockResponse = {
      accessToken: 'token123',
      user: { id: '1', email: 'test@test.com', name: 'Test User' },
    };

    it('deve realizar login com sucesso', async () => {
      authClient.send.mockReturnValue(of(mockResponse));

      const result = await service.login(loginData);

      expect(result).toEqual(mockResponse);
      expect(authClient.send).toHaveBeenCalledWith('auth.login', loginData);
      expect(cacheManager.set).toHaveBeenCalledWith(
        'token:1',
        mockResponse.accessToken,
        86400,
      );
    });

    it('deve lançar UnauthorizedException em caso de falha', async () => {
      authClient.send.mockReturnValue(of(null));

      await expect(service.login(loginData)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateToken', () => {
    const token = 'valid-token';
    const decodedToken = { sub: '1', email: 'test@test.com' };

    it('deve validar token com sucesso', async () => {
      jwtService.verify.mockReturnValue(decodedToken);
      cacheManager.get.mockResolvedValue(token);

      const result = await service.validateToken(token);

      expect(result).toEqual(decodedToken);
      expect(jwtService.verify).toHaveBeenCalledWith(token);
      expect(cacheManager.get).toHaveBeenCalledWith('token:1');
    });

    it('deve lançar UnauthorizedException para token inválido', async () => {
      jwtService.verify.mockReturnValue(decodedToken);
      cacheManager.get.mockResolvedValue(null);

      await expect(service.validateToken(token)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('deve remover token do cache', async () => {
      const userId = '1';

      await service.logout(userId);

      expect(cacheManager.del).toHaveBeenCalledWith('token:1');
    });
  });
});