import { Injectable, Logger } from "@nestjs/common";
import { GoogleGenAI } from "@google/genai";
import { AwsService } from "src/shared/aws-ssm.service";


const addedProduct = {
    name: 'addedProduct',
    description: 'addedProduct',
};

const searchProduct = {
    name: 'searchProduct',
    description: 'searchProduct',
}

@Injectable()
export class GeminiService {

    protected readonly logger = new Logger(GeminiService.name)

    constructor(private readonly awsService: AwsService) { }

    private async executeTools(functionName: string) {

        if (functionName === "searchProduct") {
            return {
                id: 1,
                name: "arroz"
            }
        }
        return { error: "tool not found" }
    }

    async runAgentAI(history: any, message: string) {

        try {
            const client = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY })
            const chatSession = client.chats.create({
                model: "gemini-3.5-flash",
                config: {
                    systemInstruction: `
                    Eres el asistente de cotización de productos de la tienda tigresa.
                    Responde con mensajes cortos con emojis.
                    `,
                    tools: [{
                        functionDeclarations: [addedProduct, searchProduct]
                    }]
                },
                history
            });
            let resp = await chatSession.sendMessage({ message });
            const cantFunct = resp.functionCalls ?? []
            if (cantFunct.length > 0) {
                const data = cantFunct[0]
                const { name } = data
                const respTools = await this.executeTools(name)

                resp = await chatSession.sendMessage({
                    message: [
                        {
                            functionResponse: {
                                name: name,
                                response: respTools
                            }
                        }
                    ]
                });
            }

            return {
                message: resp?.text,
                role: resp.candidates[0].content.role,
                responseId: resp?.responseId,
            }

        } catch (error) {
            this.logger.error(error)
        }
    }
}