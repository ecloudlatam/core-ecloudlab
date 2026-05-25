import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class VercelGatewayService {
    private readonly logger = new Logger(VercelGatewayService.name);
    private readonly gatewayUrl = 'https://ai-gateway.vercel.sh/v1/chat/completions';

    constructor() { }
    async handleSessionChat(userMessage: string) {

        try {
            const response = await fetch(`${this.gatewayUrl}/sessions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.VERCEL_AI_GATEWAY_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            });

            const sessionData = await response.json();
            return sessionData
        } catch (error) {
            throw new Error(error)
        }


    }
}