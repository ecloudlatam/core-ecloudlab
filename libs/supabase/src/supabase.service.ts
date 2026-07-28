import { ConfigService } from '@nestjs/config';
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseService.name);
  private supabaseclient: SupabaseClient;

  constructor(private readonly configure: ConfigService) {}

  onModuleInit() {
    const baseurl = this.configure.get<string>('SUPABASE_URL');
    const secret = this.configure.get<string>('SUPABASE_KEY');

    // Validación crítica de seguridad antes de inicializar
    if (!baseurl || !secret) {
      this.logger.error(
        'Faltan las credenciales de Supabase (SUPABASE_URL / SUPABASE_ANON_KEY) en el archivo .env',
      );
      throw new Error('Supabase initialization failed: Missing credentials.');
    }

    this.supabaseclient = createClient(baseurl, secret, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    this.logger.log('cliente de supabase inicializando correctamente');
  }

  getClient(): SupabaseClient {
    return this.supabaseclient;
  }
}
