import { Injectable, Logger } from '@nestjs/common';
import { AwsService } from 'src/shared/aws.service';
import { get } from 'lodash';
import { UsersService } from 'src/users/infrastructure/users.service';

@Injectable()
export class MetaService {
  constructor(
    private readonly awsService: AwsService,
    private readonly userService: UsersService,
  ) {}
  private readonly logger = new Logger(MetaService.name);

  private readonly baseUrl = `${process.env.WHATSAPP_BASE_URL}/v25.0/${process.env.WHATSAPP_BUSINESS_PHONE_NUMBER_ID}`;

  private async apiPost(endpoint: string, body: any) {
    try {
      const resp = await fetch(`${this.baseUrl}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN_MESSAGE}`,
        },
        body: JSON.stringify(body),
      });
      const data = await resp.json();
      if (!resp.ok) {
        this.logger.error(
          `[WhatsApp API Error] Endpoint: ${endpoint} | Error: ${JSON.stringify(data)}`,
        );
        return null;
      }
      return data;
    } catch (error) {
      this.logger.error(`[Fetch Network Error] ${error}`);
      return null;
    }
  }

  async typingIndicator(messageId: string) {
    const body = {
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId,
      typing_indicator: {
        type: 'text',
      },
    };
    this.apiPost('messages', body);
  }

  async sendMessages(models: any, userId: number) {
    let message = models?.message ?? '';
    let type = 'text';
    let imageUrl = null;

    // Intentar parsear solo si viene en formato JSON
    try {
      const parsed = JSON.parse(models.message);
      message = parsed.message || message;
      type = parsed.type || 'text';
      imageUrl = parsed.imageUrl || null;
    } catch {
      // Si no es SON (ej. "Operación completada exitosamente"), se mantiene como texto plano
    }

    let body = {};
    if (type === 'text') {
      body = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: userId,
        type: 'text',
        text: {
          body: message,
        },
      };
    }

    if (type === 'img') {
      body = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: userId,
        type: 'image',
        image: {
          link: imageUrl,
          ...(message && { caption: message }),
        },
      };
    }

    this.apiPost('messages', body);
  }

  async sendImageByUrl(imageUrl: string, userId: number, caption?: string) {
    const body = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: userId,
      type: 'image',
      image: {
        link: imageUrl,
        // El campo 'caption' es opcional, sirve para poner texto debajo de la foto
        ...(caption && { caption: caption }),
      },
    };

    await this.apiPost('messages', body);
  }

  async apiGetAudio(id: string) {
    try {
      const resp = await fetch(`${process.env.WHATSAPP_BASE_URL}/v25.0/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN_MESSAGE}`,
        },
      });
      const { url } = await resp.json();

      const responseFile = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN_MESSAGE}`,
        },
      });

      const arrayBuffer = await responseFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return buffer;
    } catch (error) {}
  }

  async transcribeDocuments(body: any) {
    try {
      const data = body[0];
      const resp = await fetch(data.document.url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN_MESSAGE}`,
        },
      });
      const s3Key = `whatsapp/documents/pdf/${data.image.id}.pdf`;
      const bucket = 'minimarket';

      const contentType = resp.headers.get('content-type') || 'application/pdf';
      const mediaStream = resp.body; // Esto es un ReadableStream nativo
      await this.awsService.uploadToSupabaseS3(
        bucket,
        mediaStream,
        s3Key,
        contentType,
      );

      const urlPublicaSupabase = `https://oevymuwxtjigqywbewpe.storage.supabase.co/storage/v1/object/public/${bucket}/${s3Key}`;
      const supabaseResp = await fetch(urlPublicaSupabase);
      const arrayBuffer = await supabaseResp.arrayBuffer();
      const base64ParaGemini = Buffer.from(arrayBuffer).toString('base64');

      const docs = [
        {
          text: urlPublicaSupabase,
        },
        {
          inlineData: {
            data: base64ParaGemini,
            mimeType: contentType,
          },
        },
      ];
      return docs;
    } catch (error) {
      console.log('error ===', error);
    }
  }

  async apiGetImg(body: any) {
    try {
      const data = body[0];
      const resp = await fetch(data.image.url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN_MESSAGE}`,
        },
      });

      const s3Key = `whatsapp/images/${data.image.id}.jpg`;
      const bucket = 'minimarket';

      const contentType = resp.headers.get('content-type') || 'image/jpeg';
      const mediaStream = resp.body; // Esto es un ReadableStream nativo
      await this.awsService.uploadToSupabaseS3(
        bucket,
        mediaStream,
        s3Key,
        contentType,
      );
      const urlPublicaSupabase = `https://oevymuwxtjigqywbewpe.storage.supabase.co/storage/v1/object/public/${bucket}/${s3Key}`;
      const supabaseResp = await fetch(urlPublicaSupabase);
      const arrayBuffer = await supabaseResp.arrayBuffer();
      const base64ParaGemini = Buffer.from(arrayBuffer).toString('base64');

      const imgs = [
        {
          text: urlPublicaSupabase,
        },
        {
          inlineData: {
            data: base64ParaGemini,
            mimeType: contentType,
          },
        },
      ];
      return imgs;
    } catch (error) {}
  }

  async menu(userId: number) {
    // 1. Resolver la promesa para obtener la respuesta real de la base de datos

    try {
      const data = await this.userService.findOne(userId);

      // 2. Extracción segura del estado
      const success = get(data, 'success', false);

      // 3. Estructura condicional sin emojis y texto ultra directo
      const body = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: userId,
        type: 'interactive',
        interactive: {
          type: 'list',
          header: {
            type: 'text',
            text: 'Tienda Paula',
          },
          body: {
            text: success ? 'Selecciona una opcion:' : 'Elige una opcion:',
          },
          footer: {
            text: 'eCloudLab',
          },
          action: {
            button: 'Menu',
            sections: success
              ? [
                  {
                    title: 'Administracion',
                    rows: [
                      {
                        id: 'main_menu_mis_deudas',
                        title: 'Mis Deudas',
                        description: 'Cuentas por pagar',
                      },
                      {
                        id: 'main_menu_fiar',
                        title: 'Cuentas Fiadas',
                        description: 'Buscar, registrar y gestionar',
                      },
                      {
                        id: 'main_menu_catalogo',
                        title: 'Catalogo',
                        description: 'Productos disponibles',
                      },
                      {
                        id: 'main_menu_inventario',
                        title: 'Productos',
                        description: 'Crear, buscar y eliminar',
                      },
                    ],
                  },
                ]
              : [
                  {
                    title: 'Mi Cuenta',
                    rows: [
                      {
                        id: 'client_ver_deuda',
                        title: 'Mi Deuda',
                        description: 'Saldo pendiente a pagar',
                      },
                      {
                        id: 'client_limite_cupo',
                        title: 'Mi Cupo',
                        description: 'Limite de credito disponible',
                      },
                      {
                        id: 'client_descuentos',
                        title: 'Descuentos',
                        description: 'Ver promociones del dia',
                      },
                      {
                        id: 'client_ver_productos',
                        title: 'Productos',
                        description: 'Explorar catalogo',
                      },
                    ],
                  },
                ],
          },
        },
      };

      const resp = await this.apiPost('messages', body);
      return resp;
    } catch (error) {
      console.log('errror', error);
    }
  }
}
