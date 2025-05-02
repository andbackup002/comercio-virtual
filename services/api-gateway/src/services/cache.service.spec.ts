import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CacheService } from './cache.service';

describe('CacheService', () => {
  let service: CacheService;
  let cacheManager: jest.Mocked<any>;

  beforeEach(async () => {
    const mockRedisClient = {
      keys: jest.fn(),
      del: jest.fn(),
    };

    const mockCacheManager = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      store: {
        getClient: () => mockRedisClient,
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);
    cacheManager = module.get(CACHE_MANAGER);
  });

  describe('getOrSet', () => {
    it('deve retornar dado do cache quando disponível', async () => {
      const mockData = { test: 'data' };
      cacheManager.get.mockResolvedValue(mockData);

      const result = await service.getOrSet('test-key', async () => ({ test: 'new' }));

      expect(result).toEqual(mockData);
      expect(cacheManager.get).toHaveBeenCalledWith('test-key');
      expect(cacheManager.set).not.toHaveBeenCalled();
    });

    it('deve buscar e armazenar novo dado quando cache estiver vazio', async () => {
      const mockData = { test: 'new' };
      cacheManager.get.mockResolvedValue(null);
      cacheManager.set.mockResolvedValue(undefined);

      const result = await service.getOrSet('test-key', async () => mockData);

      expect(result).toEqual(mockData);
      expect(cacheManager.get).toHaveBeenCalledWith('test-key');
      expect(cacheManager.set).toHaveBeenCalledWith('test-key', mockData, 3600);
    });
  });

  describe('invalidate', () => {
    it('deve remover uma chave do cache', async () => {
      await service.invalidate('test-key');

      expect(cacheManager.del).toHaveBeenCalledWith('test-key');
    });
  });

  describe('invalidatePattern', () => {
    it('deve remover múltiplas chaves que correspondam ao padrão', async () => {
      const mockKeys = ['key1', 'key2'];
      const mockRedisClient = cacheManager.store.getClient();

      mockRedisClient.keys.mockResolvedValue(mockKeys);
      mockRedisClient.del.mockResolvedValue(2);

      await service.invalidatePattern('key*');

      expect(mockRedisClient.keys).toHaveBeenCalledWith('key*');
      expect(mockRedisClient.del).toHaveBeenCalledWith(...mockKeys);
    });

    it('não deve tentar remover chaves quando o padrão não retorna resultados', async () => {
      const mockRedisClient = cacheManager.store.getClient();

      mockRedisClient.keys.mockResolvedValue([]);
      mockRedisClient.del.mockResolvedValue(0);

      await service.invalidatePattern('nonexistent*');

      expect(mockRedisClient.keys).toHaveBeenCalledWith('nonexistent*');
      expect(mockRedisClient.del).not.toHaveBeenCalled();
    });
  });

  describe('set', () => {
    it('deve armazenar um valor no cache', async () => {
      const mockData = { test: 'data' };
      cacheManager.set.mockResolvedValue(undefined);

      await service.set('test-key', mockData);

      expect(cacheManager.set).toHaveBeenCalledWith('test-key', mockData, 3600);
    });
  });

  describe('get', () => {
    it('deve retornar um valor do cache', async () => {
      const mockData = { test: 'data' };
      cacheManager.get.mockResolvedValue(mockData);

      const result = await service.get('test-key');

      expect(result).toEqual(mockData);
      expect(cacheManager.get).toHaveBeenCalledWith('test-key');
    });

    it('deve retornar undefined quando a chave não existe', async () => {
      cacheManager.get.mockResolvedValue(undefined);

      const result = await service.get('nonexistent-key');

      expect(result).toBeUndefined();
      expect(cacheManager.get).toHaveBeenCalledWith('nonexistent-key');
    });
  });
});