import { 
  Controller, 
  Get, 
  Post,
  Put,
  Delete,
  Body, 
  Query, 
  Param, 
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from '../services/products.service';
import { Product, ProductFilters, PaginatedProducts } from '../interfaces/product.interface';
import { CreateProductDto, UpdateProductDto, UpdateStockDto } from '../dto/product.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';

/**
 * Controlador responsável por gerenciar os produtos
 * Fornece endpoints para listagem, busca, criação, atualização e remoção de produtos
 */
@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * Lista produtos com filtros e paginação
   * @param page Número da página
   * @param limit Limite de itens por página
   * @param filters Filtros aplicados à listagem
   */
  @Get()
  @ApiOperation({ summary: 'Listar produtos com filtros e paginação' })
  @ApiResponse({ status: 200, description: 'Lista de produtos retornada com sucesso' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'subcategory', required: false, type: String })
  @ApiQuery({ name: 'brand', required: false, type: String })
  @ApiQuery({ name: 'featured', required: false, type: Boolean })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'tags', required: false, type: [String] })
  async listProducts(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query() filters: ProductFilters
  ): Promise<PaginatedProducts> {
    return this.productsService.listProducts({
      ...filters,
      page,
      limit,
    });
  }

  /**
   * Busca produtos por termo de pesquisa
   * @param query Termo de busca
   * @param page Número da página
   * @param limit Limite de itens por página
   * @param filters Filtros adicionais
   */
  @Get('search')
  @ApiOperation({ summary: 'Buscar produtos por termo de pesquisa' })
  @ApiResponse({ status: 200, description: 'Busca realizada com sucesso' })
  @ApiQuery({ name: 'q', required: true, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'minPrice', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @ApiQuery({ name: 'brand', required: false, type: String })
  async searchProducts(
    @Query('q') query: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query() filters: Partial<ProductFilters>
  ): Promise<PaginatedProducts> {
    return this.productsService.searchProducts(query, {
      ...filters,
      page,
      limit,
    });
  }

  /**
   * Busca um produto específico por ID
   * @param id ID do produto
   */
  @Get(':id')
  @ApiOperation({ summary: 'Buscar um produto pelo ID' })
  @ApiResponse({ status: 200, description: 'Produto encontrado com sucesso' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  @ApiParam({ name: 'id', type: String })
  async getProduct(@Param('id') id: string): Promise<Product> {
    return this.productsService.getProduct(id);
  }

  /**
   * Cria um novo produto
   * @param product Dados do produto a ser criado
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar um novo produto' })
  @ApiResponse({ status: 201, description: 'Produto criado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async createProduct(@Body() product: CreateProductDto): Promise<Product> {
    return this.productsService.createProduct(product);
  }

  /**
   * Atualiza um produto existente
   * @param id ID do produto
   * @param product Dados atualizados do produto
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar um produto existente' })
  @ApiResponse({ status: 200, description: 'Produto atualizado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  @ApiParam({ name: 'id', type: String })
  async updateProduct(
    @Param('id') id: string,
    @Body() product: UpdateProductDto
  ): Promise<Product> {
    const updatedProduct = await this.productsService.updateProduct({ id, ...product });
    if (!updatedProduct) {
      throw new NotFoundException(`Produto ${id} não encontrado`);
    }
    return updatedProduct;
  }

  /**
   * Remove um produto
   * @param id ID do produto a ser removido
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover um produto' })
  @ApiResponse({ status: 200, description: 'Produto removido com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  @ApiParam({ name: 'id', type: String })
  async deleteProduct(
    @Param('id') id: string
  ): Promise<{ success: boolean; message: string }> {
    return this.productsService.deleteProduct(id);
  }

  /**
   * Atualiza o estoque de um produto
   * @param id ID do produto
   * @param data Dados da atualização do estoque
   */
  @Put(':id/stock')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar o estoque de um produto' })
  @ApiResponse({ status: 200, description: 'Estoque atualizado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  async updateStock(
    @Param('id') id: string,
    @Body() data: UpdateStockDto,
  ) {
    return this.productsService.updateStock(
      id,
      data.operation as 'add' | 'subtract' | 'set',
      data.quantity,
      data.reason
    );
  }
}