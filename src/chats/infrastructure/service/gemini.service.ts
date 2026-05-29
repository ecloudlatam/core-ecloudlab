import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { GoogleGenAI, Type } from "@google/genai";
import { AwsService } from "src/shared/aws.service";
import * as dayjs from 'dayjs';


const endfunction = {
    name: "close-chat",
    description: "Cierra de conversación",
    parameters: {
        type: Type.OBJECT,
        properties: {
            close: {
                type: Type.OBJECT,
                description: "valor generado por el agente."
            }
        },
        required: ["close"]
    }
}


const addedDoubt = {
    name: "added-new-doubt",
    description: "agregar una nueva deuda",
    parameters: {
        type: Type.OBJECT,
        properties: {
            date: {
                type: Type.STRING,
                description: 'Date of the meeting (e.g., "2024-07-29")',
            },
            product: {
                type: Type.STRING,
                description: "product's name (e.g., 'pollo de 1/4 libra')"
            }
        },
        required: ['date', 'product']
    }
}

@Injectable()
export class GeminiService implements OnModuleInit {

    protected readonly logger = new Logger(GeminiService.name)
    private client: GoogleGenAI

    constructor(private readonly awsService: AwsService) { }

    onModuleInit() {
        this.client = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY })
    }

    private async executeTools(functionName: string, args: Record<string, any>) {

        if (functionName === "searchProduct") {

            console.log(functionName);

            return {
                id: 1,
                name: "arroz"
            }
        }

        if (functionName === "added-new-doubt") {
            const { date } = args

            return {
                id: 1,
                name: "registrado"
            }
        }
        return { error: "tool not found" }
    }


    async agentRouter(history: any, messageInput: any) {
        try {
            const chatSession = await this.client.chats.create({
                model: "gemini-3.5-flash",
                config: {
                    systemInstruction: `
                Interpreta la intención del usuario de forma libre.
                Al finalizar el análisis o cuando el usuario solicite una acción (como registrar deudas, despedirse, etc.), 
                debes ejecutar INMEDIATAMENTE la herramienta [close-chat].
                
                Debes construir un objeto JSON dinámico con la información que el usuario quiere procesar. 
                Tú decides las llaves y los valores de este JSON según el contexto de la conversación.
                
                Ejemplos de lo que puedes meter en el JSON de 'metadata':
                - Si es deuda cliente: {"action": "register"}
                - Si es proveedor: {"tipo": "proveedor"}
                - Si se despide: {"status": "close"}
                `,
                    tools: [
                        {
                            functionDeclarations: [
                                endfunction
                            ]
                        }
                    ]
                },
                history
            }).sendMessage({
                message: messageInput,

            });

            const intent = chatSession.functionCalls
            if(intent.length > 0) return await this.runAgentAI(history, intent[0].args)
               return  await this.runAgentAI(history,messageInput)


        } catch (error) {

        }
    }


    async runAgentAI(history: any, messageInput: any) {

        console.log(messageInput)

        try {
            const day = dayjs().format('YYYY-MM-DD');
            const chatSession = this.client.chats.create({
                model: "gemini-3.5-flash",
                config: {
                    systemInstruction: `
                    Eres el asistente para la tienda de la señora paula, contienes las funcionalidades.
                    Responde con mensajes cortos con emojis
                    
                    - 1. Hablar con la dueña: llamar al numero: 593983258685
                    - 2. Buscar producto: indicar el nombre del producto.
                    - 3. Consultar deuda: el valor pendiente por pagar es de 50 dolares
                    - 4. Registrar nueva deuda: Cuando el usuario indique que quiere registrar o guardar una nueva deuda, 
                    indicale la fecha de registrar es de hoy ${day} o de otro dia procesa la solicitud utilizando 
                    la herramienta [added-new-doubt] valores de entrada {data:[fecha ingresada por el usuario yyyy-mm-dd]}
                    `,
                    tools: [{
                        functionDeclarations: [
                            addedDoubt,
                            endfunction
                        ]
                    }]
                },
                history
            });

            let resp = await chatSession.sendMessage({ message: JSON.stringify(messageInput) });


            const cantFunct = resp.functionCalls ?? []
            if (cantFunct.length > 0) {
                const data = cantFunct[0]
                const { name, args } = data
                console.log(name)
                const respTools = await this.executeTools(name, args)

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