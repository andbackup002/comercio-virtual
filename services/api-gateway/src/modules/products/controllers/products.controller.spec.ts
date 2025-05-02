import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from '../services/products.service';
import { CreateProductDto, UpdateProductDto, UpdateStockDto } from '../dto/product.dto';
import { Product } from '../interfaces/product.interface';
import { NotFoundException } from '@nestjs/common';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: jest.Mocked<ProductsService>;

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
      keywords: 'test, product',
      slug: 'test-product'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: undefined
  };

  beforeEach(async () => {
    service = {
      listProducts: jest.fn(),
      searchProducts: jest.fn(),
      getProduct: jest.fn(),
      createProduct: jest.fn(),
      updateProduct: jest.fn(),
      updateStock: jest.fn(),
      deleteProduct: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  describe('listProducts', () => {
    it('deve listar produtos com paginação e filtros', async () => {
      const mockResponse = {
        products: [mockProduct],
        total: 1,
        page: 1,
        totalPages: 1,
      };

      service.listProducts.mockResolvedValue(mockResponse);

      const result = await controller.listProducts(1, 20, {
        category: 'test',
      });

      expect(result).toEqual(mockResponse);
      expect(service.listProducts).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
        category: 'test',
      });
    });
  });

  describe('searchProducts', () => {
    it('deve buscar produtos por termo de pesquisa', async () => {
      const mockResponse = {
        products: [mockProduct],
        total: 1,
        page: 1,
        totalPages: 1,
      };

      service.searchProducts.mockResolvedValue(mockResponse);

      const result = await controller.searchProducts('test', 1, 20, {
        category: 'test',
      });

      expect(result).toEqual(mockResponse);
      expect(service.searchProducts).toHaveBeenCalledWith('test', {
        page: 1,
        limit: 20,
        category: 'test',
      });
    });
  });

  describe('getProduct', () => {
    it('deve retornar um produto pelo ID', async () => {
      service.getProduct.mockResolvedValue(mockProduct);

      const result = await controller.getProduct('1');

      expect(result).toEqual(mockProduct);
      expect(service.getProduct).toHaveBeenCalledWith('1');
    });

    it('deve lançar NotFoundException quando o produto não existe', async () => {
      service.getProduct.mockRejectedValue(new NotFoundException('Produto não encontrado'));

      await expect(controller.getProduct('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createProduct', () => {
    it('deve criar um novo produto', async () => {
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

      const createdProduct: Product = {
        ...mockProduct,
        id: '2',
        name: createDto.name,
        description: createDto.description,
        shortDescription: createDto.shortDescription,
        price: createDto.price,
        stock: createDto.stock,
        minStock: createDto.minStock,
        maxStock: createDto.maxStock,
        category: createDto.category,
        tags: createDto.tags,
        images: createDto.images,
        attributes: createDto.attributes,
        featured: createDto.featured,
        seo: createDto.seo,
      };

      service.createProduct.mockResolvedValue(createdProduct);

      const result = await controller.createProduct(createDto);

      expect(result).toEqual(createdProduct);
      expect(service.createProduct).toHaveBeenCalledWith(createDto);
    });
  });

  describe('updateProduct', () => {
    it('deve atualizar um produto existente', async () => {
      const updateDto: UpdateProductDto = {
        name: 'Updated Product',
        description: 'Updated Description',
        shortDescription: 'Updated Short Description',
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

      const updatedProduct = { ...mockProduct, ...updateDto };
      service.updateProduct.mockResolvedValue(updatedProduct);

      const result = await controller.updateProduct('1', updateDto);

      expect(result).toEqual(updatedProduct);
      expect(service.updateProduct).toHaveBeenCalledWith({
        id: '1',
        ...updateDto,
      });
    });

    it('deve lançar NotFoundException quando o produto não existe', async () => {
      const updateDto: UpdateProductDto = {
        name: 'Updated Product',
        description: 'Updated Description',
        shortDescription: 'Updated Short Description',
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

      service.updateProduct.mockResolvedValue(null);

      await expect(controller.updateProduct('999', updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStock', () => {
    it('deve atualizar o estoque de um produto', async () => {
      const updateStockDto: UpdateStockDto = {
        operation: 'add',
        quantity: 5,
        reason: 'Reposição de estoque',
      };

      const updatedProduct: Product = {
        ...mockProduct,
        stock: 15,
      };

      service.updateStock.mockResolvedValue(updatedProduct);

      const result = await controller.updateStock('1', updateStockDto);

      expect(result.stock).toBe(15);
      expect(service.updateStock).toHaveBeenCalledWith(
        '1',
        updateStockDto.operation,
        updateStockDto.quantity,
        updateStockDto.reason
      );
    });
  });

  describe('deleteProduct', () => {
    it('deve remover um produto', async () => {
      const mockResponse = {
        success: true,
        message: 'Produto removido com sucesso',
      };

      service.deleteProduct.mockResolvedValue(mockResponse);

      const result = await controller.deleteProduct('1');

      expect(result).toEqual(mockResponse);
      expect(service.deleteProduct).toHaveBeenCalledWith('1');
    });

    it('deve lançar NotFoundException quando o produto não existe', async () => {
      service.deleteProduct.mockRejectedValue(new NotFoundException('Produto não encontrado'));

      await expect(controller.deleteProduct('999')).rejects.toThrow(NotFoundException);
    });
  });
});