import { Injectable, Logger } from "@nestjs/common";
import { GoogleGenAI } from "@google/genai";
import { AwsService } from "src/shared/aws-ssm.service";

@Injectable()
export class GeminiService {

    protected readonly logger = new Logger(GeminiService.name)

    constructor(private readonly awsService: AwsService) { }

    async runAgentAI(message: any) {

        const { value } = message.entry[0].changes[0]
        const messages = value.messages[0]
        const text = messages.text.body

        try {
            const client = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY })
            const chatSession = client.chats.create({
                model: "gemini-3.5-flash",
                config: { systemInstruction: "Eres el asistente de La Tigresa." }
            });

            const response1 = await chatSession.sendMessage({ message: "¡Hola! ¿Tienen leche?" });

            const updatedHistory = chatSession.getHistory();

            return { value: response1 }

        } catch (error) {
            this.logger.error(error)
        }
    }
}