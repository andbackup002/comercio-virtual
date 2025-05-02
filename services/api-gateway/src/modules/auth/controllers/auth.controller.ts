import { Controller, Post, Body, UseGuards, Get, Req, Headers } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { LoginRequest, RegisterRequest, AuthResponse } from '../interfaces/auth.interface';
import { JwtAuthGuard } from '../guards/jwt.guard';

/**
 * Controller responsável por gerenciar as rotas de autenticação
 */
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Rota de login
   * @param loginData Dados de login do usuário
   */
  @Post('login')
  @ApiOperation({ summary: 'Realizar login' })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async login(@Body() loginData: LoginRequest): Promise<AuthResponse> {
    return this.authService.login(loginData);
  }

  /**
   * Rota de registro
   * @param registerData Dados de registro do usuário
   */
  @Post('register')
  @ApiOperation({ summary: 'Registrar novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário registrado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async register(@Body() registerData: RegisterRequest): Promise<AuthResponse> {
    return this.authService.register(registerData);
  }

  /**
   * Rota para validar token JWT
   * @param token Token JWT a ser validado
   */
  @Post('validate')
  @ApiOperation({ summary: 'Validar token JWT' })
  @ApiResponse({ status: 200, description: 'Token válido' })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  async validateToken(@Headers('authorization') authHeader: string) {
    const token = authHeader?.split(' ')[1];
    return this.authService.validateToken(token);
  }

  /**
   * Rota protegida que retorna os dados do usuário atual
   * @param request Request com os dados do usuário autenticado
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter dados do usuário atual' })
  @ApiResponse({ status: 200, description: 'Dados do usuário' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async getProfile(@Req() request: any) {
    return request.user;
  }

  /**
   * Rota de logout
   * @param request Request com os dados do usuário autenticado
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Realizar logout' })
  @ApiResponse({ status: 200, description: 'Logout realizado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async logout(@Req() request: any): Promise<void> {
    return this.authService.logout(request.user.id);
  }
}