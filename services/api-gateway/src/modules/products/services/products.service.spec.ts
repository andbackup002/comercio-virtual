import { Test, TestingModule } from '@nestjs/testing';
import { ClientGrpc } from '@nestjs/microservices';
import { of } from 'rxjs';
import { NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from '../dto/product.dto';
import { ProductServiceGrpc } from '../interfaces/product-grpc.interface';
import { CacheService } from '../../../services/cache.service';
import { Product, PaginatedProducts } from '../interfaces/product.interface';

describe('ProductsService', () => {
  let service: ProductsService;
  let client: jest.Mocked<ClientGrpc>;
  let productServiceGrpc: jest.Mocked<ProductServiceGrpc>;
  let cacheService: jest.Mocked<CacheService>;

  const mockProduct: Product = {
    id: '1',
    sku: 'TEST-001',
    name: 'Test Product',
    description: 'Test Description',
    shortDescription: 'Short Description',
    price: 100,
    compareAtPrice: undefined,
    cost: undefined,
    stock: 10,
    minStock: 5,
    maxStock: 20,
    reservedStock: 0,
    category: 'test',
    subcategory: undefined,
    brand: undefined,
    tags: [],
    images: [],
    weight: undefined,
    dimensions: undefined,
    attributes: {},
    status: 'active',
    active: true,
    featured: false,
    rating: 0,
    reviewCount: 0,
    seo: {
      title: 'Test Product',
      description: 'Test Description',
      keywords: 'test',
      slug: 'test-product'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: undefined
  };

  beforeEach(async () => {
    productServiceGrpc = {
      listProducts: jest.fn(),
      searchProducts: jest.fn(),
      getProduct: jest.fn(),
      createProduct: jest.fn(),
      updateProduct: jest.fn(),
      deleteProduct: jest.fn(),
      updateStock: jest.fn(),
    } as any;

    const mockClient = {
      getService: jest.fn().mockReturnValue(productServiceGrpc),
    };

    cacheService = {
      get: jest.fn(),
      set: jest.fn(),
      invalidate: jest.fn(),
      invalidatePattern: jest.fn(),
      getOrSet: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: 'PRODUCT_PACKAGE',
          useValue: mockClient,
        },
        {
          provide: CacheService,
          useValue: cacheService,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    client = module.get('PRODUCT_PACKAGE');

    service.onModuleInit();
  });

  describe('listProducts', () => {
    it('deve retornar produtos paginados do cache', async () => {
      const paginatedResult: PaginatedProducts = {
        products: [mockProduct],
        total: 1,
        page: 1,
        totalPages: 1
      };

      cacheService.getOrSet.mockResolvedValue(paginatedResult);

      const result = await service.listProducts({ page: 1, limit: 20 });

      expect(result).toEqual(paginatedResult);
      expect(cacheService.getOrSet).toHaveBeenCalledWith(
        'products:list:{"page":1,"limit":20}',
        expect.any(Function),
        3600
      );
    });
  });

  describe('searchProducts', () => {
    it('deve buscar produtos por termo de pesquisa', async () => {
      const paginatedResult: PaginatedProducts = {
        products: [mockProduct],
        total: 1,
        page: 1,
        totalPages: 1
      };

      cacheService.getOrSet.mockResolvedValue(paginatedResult);

      const result = await service.searchProducts('test', { page: 1, limit: 20 });

      expect(result).toEqual(paginatedResult);
      expect(cacheService.getOrSet).toHaveBeenCalledWith(
        'products:search:test:{"page":1,"limit":20}',
        expect.any(Function),
        3600
      );
    });
  });

  describe('getProduct', () => {
    it('deve retornar um produto do cache se disponível', async () => {
      cacheService.getOrSet.mockResolvedValue(mockProduct);

      const result = await service.getProduct('1');

      expect(result).toEqual(mockProduct);
      expect(cacheService.getOrSet).toHaveBeenCalledWith(
        'product:1',
        expect.any(Function),
        3600
      );
    });

    it('deve lançar NotFoundException quando o produto não existe', async () => {
      const emptyProduct = {} as Product;
      productServiceGrpc.getProduct.mockReturnValue(of(emptyProduct));
      cacheService.getOrSet.mockImplementation(async (_key, fn) => fn());

      await expect(service.getProduct('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createProduct', () => {
    it('deve criar um novo produto e invalidar caches', async () => {
      const createDto: CreateProductDto = {
        name: 'New Product',
        description: 'New Description',
        shortDescription: 'Short Description',
        price: 100,
        stock: 10,
        minStock: 5,
        maxStock: 20,
        category: 'test',
        tags: [],
        images: [],
        attributes: {},
        featured: false,
        seo: {
          title: 'New Product',
          description: 'New Description',
          keywords: 'test',
          slug: 'new-product'
        }
      };

      const newProduct: Product = {
        id: '2',
        sku: 'NEW-001',
        ...createDto,
        status: 'active',
        active: true,
        reservedStock: 0,
        rating: 0,
        reviewCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      productServiceGrpc.createProduct.mockReturnValue(of(newProduct));

      const result = await service.createProduct(createDto);

      expect(result).toEqual(newProduct);
      expect(cacheService.invalidatePattern).toHaveBeenCalledWith('products:list:*');
      expect(cacheService.invalidatePattern).toHaveBeenCalledWith('products:search:*');
    });
  });

  describe('updateProduct', () => {
    it('deve atualizar um produto existente', async () => {
      const updateDto: UpdateProductDto = {
        name: 'Updated Product',
        description: 'Updated Description',
        shortDescription: 'Short Description',
        price: 150,
        stock: 15,
        minStock: 5,
        maxStock: 20,
        category: 'test',
        tags: [],
        images: [],
        attributes: {},
        featured: false,
        seo: {
          title: 'Updated Product',
          description: 'Updated Description',
          keywords: 'test',
          slug: 'updated-product'
        }
      };

      const updatedProduct: Product = {
        ...mockProduct,
        ...updateDto,
        updatedAt: new Date().toISOString()
      };

      productServiceGrpc.updateProduct.mockReturnValue(of(updatedProduct));

      const result = await service.updateProduct({ id: '1', ...updateDto });

      expect(result).toEqual(updatedProduct);
      expect(productServiceGrpc.updateProduct).toHaveBeenCalledWith({ 
        id: '1',
        ...updateDto 
      });
      expect(cacheService.invalidate).toHaveBeenCalledWith('product:1');
      expect(cacheService.invalidatePattern).toHaveBeenCalledWith('products:list:*');
      expect(cacheService.invalidatePattern).toHaveBeenCalledWith('products:search:*');
    });

    it('deve retornar null quando o produto não existe', async () => {
      const updateDto: UpdateProductDto = {
        name: 'Updated Product',
        description: 'Updated Description',
        shortDescription: 'Short Description',
        price: 150,
        stock: 15,
        minStock: 5,
        maxStock: 20,
        category: 'test',
        tags: [],
        images: [],
        attributes: {},
        featured: false,
        seo: {
          title: 'Updated Product',
          description: 'Updated Description',
          keywords: 'test',
          slug: 'updated-product'
        }
      };

      const emptyProduct = {} as Product;
      productServiceGrpc.updateProduct.mockReturnValue(of(emptyProduct));

      const result = await service.updateProduct({ id: '999', ...updateDto });
      expect(result).toBeNull();
    });
  });

  describe('updateStock', () => {
    it('deve atualizar o estoque de um produto', async () => {
      const updatedProduct: Product = {
        ...mockProduct,
        stock: 15,
        updatedAt: new Date().toISOString()
      };

      productServiceGrpc.updateStock.mockReturnValue(of(updatedProduct));

      const result = await service.updateStock('1', 'add', 5, 'Reposição de estoque');

      expect(result).toEqual(updatedProduct);
      expect(productServiceGrpc.updateStock).toHaveBeenCalledWith({
        id: '1',
        operation: 'add',
        quantity: 5,
        reason: 'Reposição de estoque'
      });
      expect(cacheService.invalidate).toHaveBeenCalledWith('product:1');
    });
  });

  describe('deleteProduct', () => {
    it('deve remover um produto e invalidar todos os caches relacionados', async () => {
      productServiceGrpc.deleteProduct.mockReturnValue(of({
        success: true,
        message: 'Produto removido com sucesso'
      }));

      const result = await service.deleteProduct('1');

      expect(result.success).toBe(true);
      expect(cacheService.invalidate).toHaveBeenCalledWith('product:1');
      expect(cacheService.invalidatePattern).toHaveBeenCalledWith('products:list:*');
      expect(cacheService.invalidatePattern).toHaveBeenCalledWith('products:search:*');
    });

    it('deve lançar NotFoundException quando o produto não existe', async () => {
      productServiceGrpc.deleteProduct.mockReturnValue(of({
        success: false,
        message: 'Produto não encontrado'
      }));

      await expect(service.deleteProduct('999')).rejects.toThrow(NotFoundException);
    });
  });
});