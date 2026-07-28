// libs/auth/src/api-key.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { HeaderAPIKeyStrategy } from 'passport-headerapikey';
import * as crypto from 'crypto';
import { AuthService } from './auth.service';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(
  HeaderAPIKeyStrategy,
  'api-key',
) {
  constructor(private readonly authService: AuthService) {
    super(
      { header: 'X-API-KEY', prefix: '' },
      true, // passReqToCallback
    );
  }

  async validate(req: any, apiKey: string): Promise<any> {
    // 1. Obtenemos el hash SHA-256 del token que envió el cliente
    const hashEntrante = crypto
      .createHash('sha256')
      .update(apiKey)
      .digest('hex');

    // 2. Delegamos al AuthService la validación en Supabase usando el hash
    const appValida = await this.authService.validarApiKey(hashEntrante);

    if (!appValida) {
      throw new UnauthorizedException('API Key inválida o desactivada');
    }

    // 3. Si es válida, retornamos los datos de la app para que estén disponibles en el request
    return appValida;
  }
}
