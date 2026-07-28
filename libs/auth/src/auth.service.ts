import { Injectable } from '@nestjs/common';
import { SupabaseService } from '@app/supabase';
import { nanoid } from 'nanoid';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(private readonly supabaseService: SupabaseService) {}

  generate() {
    const stringAleatorio = nanoid(40);
    const tokenLimpio = `ecl_live_${stringAleatorio}`;
    const hash = crypto.createHash('sha256').update(tokenLimpio).digest('hex');
    const pistaVisual = `${tokenLimpio.substring(0, 12)}...${tokenLimpio.substring(tokenLimpio.length - 4)}`;
    return {
      tokenLimpio,
      apiKeyHash: hash,
      apiKeyHint: pistaVisual,
    };
  }

  async validarApiKey(x_api_key: string): Promise<any> {
    const api_key_hash = crypto
      .createHash('sha256')
      .update(x_api_key)
      .digest('hex');

    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('apps')
      .select('*')
      .eq('api_key_hash', api_key_hash)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  }
}
