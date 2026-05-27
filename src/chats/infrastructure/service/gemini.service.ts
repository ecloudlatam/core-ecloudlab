import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { GoogleGenAI } from "@google/genai";
import { AwsService } from "src/shared/aws.service";


const addedProduct = {
    name: 'addedProduct',
    description: 'addedProduct',
};

const searchProduct = {
    name: 'searchProduct',
    description: 'searchProduct',
}

@Injectable()
export class GeminiService implements OnModuleInit {

    protected readonly logger = new Logger(GeminiService.name)
    private client: GoogleGenAI

    constructor(private readonly awsService: AwsService) { }

    onModuleInit() {
        this.client = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY })
    }

    private async executeTools(functionName: string) {

        if (functionName === "searchProduct") {
            return {
                id: 1,
                name: "arroz"
            }
        }
        return { error: "tool not found" }
    }

    async runAgentAI(history: any, messageInput: any) {

        try {
            const chatSession = this.client.chats.create({
                model: "gemini-3.5-flash",
                config: {
                    systemInstruction: `
                    Eres el asistente para la tienda de la señora paula, contienes las funcionalidades.
                    Responde con mensajes cortos con emojis
                    
                    - Cancelar deuda: el aumento de credito se realiza de manera presencial y sin valores pendientes por pagar.
                    - Buscar producto: indicar el nombre del producto.
                    - Consultar deuda: el valor pendiente por pagar es de 50 dolares
                    - Hablar con la dueña: llamar al numero: 593983258685
                    .
                    `,
                    tools: [{
                        functionDeclarations: [addedProduct, searchProduct]
                    }]
                },
                history
            });
            
            console.time('time-agent-gemini');
            let resp = await chatSession.sendMessage({ message: messageInput });
            console.timeEnd('time-agent-gemini');


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