import { Injectable, Logger } from "@nestjs/common";
import { AwsService } from "src/shared/aws.service";
import { pick, assign, omit, get } from "lodash"


@Injectable()
export class MetaService {
    constructor(
        private readonly awsService: AwsService

    ) {

    }
    private readonly logger = new Logger(MetaService.name)

    private readonly baseUrl = `${process.env.WHATSAPP_BASE_URL}/v25.0/${process.env.WHATSAPP_BUSINESS_PHONE_NUMBER_ID}`

    private async apiPost(endpoint: string, body: any) {
        try {
            const resp = await fetch(`${this.baseUrl}/${endpoint}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.WHATSAPP_TOKEN_MESSAGE}`,
                },
                body: JSON.stringify(body)
            });
            const data = await resp.json();
            if (!resp.ok) {
                this.logger.error(`[WhatsApp API Error] Endpoint: ${endpoint} | Error: ${JSON.stringify(data)}`);
                return null;
            }
            return data;
        } catch (error) {
            this.logger.error(`[Fetch Network Error] ${error.message}`);
            return null;
        }
    }

    async typingIndicator(messageId: string) {
        const body = {
            "messaging_product": "whatsapp",
            "status": "read",
            "message_id": messageId,
            "typing_indicator": {
                "type": "text"
            }
        }
        this.apiPost("messages", body)

    }

    async sendMessages(message: string, userId: number) {

        const body = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": userId,
            "type": "text",
            "text": {
                "body": message
            }
        }
        this.apiPost("messages", body)

    }

    async apiGetAudio(id: string) {

        try {
            const resp = await fetch(`${process.env.WHATSAPP_BASE_URL}/v25.0/${id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.WHATSAPP_TOKEN_MESSAGE}`,
                },
            });
            const { url } = await resp.json();

            const responseFile = await fetch(url, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${process.env.WHATSAPP_TOKEN_MESSAGE}`,
                }
            });

            const arrayBuffer = await responseFile.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            return buffer
        } catch (error) {
            console.log(error);
        }

    }

    async apiGetImg(body: any) {
        try {

            const data = body[0]
            const resp = await fetch(data.image.url, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${process.env.WHATSAPP_TOKEN_MESSAGE}`,
                }
            })

            const s3Key = `whatsapp/images/${data.image.id}.jpg`;
            const bucket = "minimarket"

            const contentType = resp.headers.get('content-type') || 'image/jpeg';
            const mediaStream = resp.body; // Esto es un ReadableStream nativo
            await this.awsService.uploadToSupabaseS3(bucket, mediaStream, s3Key, contentType)
            const urlPublicaSupabase = `https://oevymuwxtjigqywbewpe.storage.supabase.co/storage/v1/object/public/${bucket}/${s3Key}`;
            const supabaseResp = await fetch(urlPublicaSupabase);
            const arrayBuffer = await supabaseResp.arrayBuffer();
            const base64ParaGemini = Buffer.from(arrayBuffer).toString('base64');


            const imgs = {
                inlineData: {
                    data: base64ParaGemini,
                    mimeType: contentType
                }
            };
            return [imgs]

        } catch (error) {

        }
    }

    async menu(userId: number) {

        const body =
        {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": userId,
            "type": "interactive",
            "interactive": {
                "type": "list",
                "header": {
                    "type": "text",
                    "text": "Menú de tienda paula"
                },
                "body": {
                    "text": "Selecciona la opción que necesites realizar"
                },
                "footer": {
                    "text": "ecloudlab"
                },
                "action": {
                    "button": "menú",
                    "sections": [
                        {
                            "title": "Selecciona",
                            "rows": [
                                {
                                    "id": "main_menu_deudas",
                                    "title": "agregar nuevo deuda",
                                    "description": "agregar nuevo deuda"
                                },
                                {
                                    "id": "main_menu_pagar",
                                    "title": "revisar deuda",
                                    "description": "pagar a proveedores"
                                },
                                {
                                    "id": "main_menu_catalogo",
                                    "title": "catalogo",
                                    "description": "catalogo de la tienda"
                                },
                                {
                                    "id": "main_menu_agregar_producto",
                                    "title": "agregar nuevo producto",
                                    "description": "agregar nuevo producto"
                                }
                            ]
                        }
                    ]
                }
            }
        }

        const resp = await this.apiPost("messages", body)
        return resp
    }
}