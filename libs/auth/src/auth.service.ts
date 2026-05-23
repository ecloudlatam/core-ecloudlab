import { Injectable } from '@nestjs/common';
import { SupabaseService } from '@app/supabase';
import { nanoid } from 'nanoid';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(private readonly supabaseService: SupabaseService) {}


  generate(){
    const stringAleatorio = nanoid(40); 
    const tokenLimpio = `ecl_live_${stringAleatorio}`;
    const hash = crypto.createHash('sha256').update(tokenLimpio).digest('hex');
    const pistaVisual = `${tokenLimpio.substring(0, 12)}...${tokenLimpio.substring(tokenLimpio.length - 4)}`;
    return {
      tokenLimpio,     
      apiKeyHash: hash, 
      apiKeyHint: pistaVisual 
    };
  }

  async validarApiKey(hashedApiKey: string): Promise<any> {
    const supabase = this.supabaseService.getClient();
    
    // Buscar en la tabla 'apps' una API key que coincida con el hash
    const { data, error } = await supabase
      .from('apps')
      .select('*')
      .eq('api_key_hash', hashedApiKey)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  }
}
