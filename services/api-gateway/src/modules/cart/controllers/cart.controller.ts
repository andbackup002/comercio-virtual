import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  UseGuards,
  Session,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { CartService } from '../services/cart.service';
import { Cart } from '../interfaces/cart.interface';
import { 
  AddItemDto, 
  UpdateItemDto, 
  ApplyDiscountDto, 
  UpdateCartStatusDto,
  CartMetadataDto 
} from '../dto/cart.dto';

/**
 * Controlador responsável por gerenciar carrinhos de compra
 * Fornece endpoints para criação, manipulação e finalização de carrinhos
 */
@ApiTags('cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  /**
   * Cria um novo carrinho de compras
   * @param session Dados da sessão atual
   * @param req Request com dados do usuário
   * @param metadata Metadados opcionais do carrinho
   */
  @Post()
  @ApiOperation({ summary: 'Criar um novo carrinho' })
  @ApiResponse({ status: 201, description: 'Carrinho criado com sucesso' })
  async createCart(
    @Session() session: Record<string, any>,
    @Request() req: any,
    @Body() metadata?: CartMetadataDto
  ): Promise<Cart> {
    const userId = req.user?.id;
    return this.cartService.createCart(session.id, userId, metadata?.metadata);
  }

  /**
   * Busca um carrinho específico por ID
   * @param id ID do carrinho
   */
  @Get(':id')
  @ApiOperation({ summary: 'Buscar um carrinho pelo ID' })
  @ApiResponse({ status: 200, description: 'Carrinho encontrado' })
  @ApiResponse({ status: 404, description: 'Carrinho não encontrado' })
  async getCart(@Param('id') id: string): Promise<Cart> {
    return this.cartService.getCart(id);
  }

  /**
   * Adiciona um item ao carrinho
   * @param id ID do carrinho
   * @param item Dados do item a ser adicionado
   */
  @Post(':id/items')
  @ApiOperation({ summary: 'Adicionar item ao carrinho' })
  @ApiResponse({ status: 200, description: 'Item adicionado com sucesso' })
  @ApiResponse({ status: 404, description: 'Carrinho não encontrado' })
  async addItem(
    @Param('id') id: string,
    @Body() item: AddItemDto
  ): Promise<Cart> {
    return this.cartService.addItem(id, item);
  }

  /**
   * Atualiza um item no carrinho
   * @param id ID do carrinho
   * @param productId ID do produto
   * @param update Dados atualizados do item
   */
  @Put(':id/items/:productId')
  @ApiOperation({ summary: 'Atualizar item no carrinho' })
  @ApiResponse({ status: 200, description: 'Item atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Item ou carrinho não encontrado' })
  async updateItem(
    @Param('id') id: string,
    @Param('productId') productId: string,
    @Body() update: UpdateItemDto
  ): Promise<Cart> {
    return this.cartService.updateItem(id, productId, update);
  }

  /**
   * Remove um item do carrinho
   * @param id ID do carrinho
   * @param productId ID do produto
   */
  @Delete(':id/items/:productId')
  @ApiOperation({ summary: 'Remover item do carrinho' })
  @ApiResponse({ status: 200, description: 'Item removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Item ou carrinho não encontrado' })
  async removeItem(
    @Param('id') id: string,
    @Param('productId') productId: string
  ): Promise<Cart> {
    return this.cartService.removeItem(id, productId);
  }

  /**
   * Aplica um desconto ao carrinho
   * @param id ID do carrinho
   * @param discount Dados do desconto a ser aplicado
   */
  @Post(':id/discount')
  @ApiOperation({ summary: 'Aplicar desconto ao carrinho' })
  @ApiResponse({ status: 200, description: 'Desconto aplicado com sucesso' })
  @ApiResponse({ status: 404, description: 'Carrinho não encontrado' })
  async applyDiscount(
    @Param('id') id: string,
    @Body() discount: ApplyDiscountDto
  ): Promise<Cart> {
    return this.cartService.applyDiscount(id, discount);
  }

  /**
   * Atualiza o status do carrinho
   * @param id ID do carrinho
   * @param update Dados da atualização do status
   */
  @Put(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar status do carrinho' })
  @ApiResponse({ status: 200, description: 'Status atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Carrinho não encontrado' })
  async updateStatus(
    @Param('id') id: string,
    @Body() update: UpdateCartStatusDto
  ): Promise<Cart> {
    return this.cartService.updateStatus(id, update);
  }

  /**
   * Remove um carrinho
   * @param id ID do carrinho a ser removido
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover um carrinho' })
  @ApiResponse({ status: 200, description: 'Carrinho removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Carrinho não encontrado' })
  async deleteCart(
    @Param('id') id: string
  ): Promise<{ success: boolean; message: string }> {
    return this.cartService.deleteCart(id);
  }
}