import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../services/auth.service';

/**
 * Estratégia para validação de tokens JWT
 * Utilizada pelo PassportJS para autenticação
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET', 'temporarySecret'),
    });
  }

  /**
   * Valida o payload do token JWT
   * @param payload Payload do token JWT
   */
  async validate(payload: any) {
    try {
      const token = ExtractJwt.fromAuthHeaderAsBearerToken()(
        { headers: { authorization: `Bearer ${payload.sub}` } } as any,
      );
      if (!token) {
        throw new UnauthorizedException('Token não fornecido');
      }
      await this.authService.validateToken(token);
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }
}