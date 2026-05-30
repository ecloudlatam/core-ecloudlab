import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { GoogleGenAI, Type } from "@google/genai";
import { AwsService } from "src/shared/aws.service";
import { routerTool, ToolService } from "../tools/parameters.service";
import * as dayjs from 'dayjs';
import { DoubtService } from "src/doubt/infraestructure/doubt.service";
import { FunctionService } from "../tools/functions.service";



@Injectable()
export class GeminiService implements OnModuleInit {

    protected readonly logger = new Logger(GeminiService.name)
    private client: GoogleGenAI

    constructor(private readonly awsService: AwsService,
        private readonly tools: ToolService,
        private readonly doubtService: DoubtService,
        private readonly functions: FunctionService
    ) { }

    onModuleInit() {
        this.client = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY })
    }

    // ============================================
    // 🎯 AGENTE ROUTER - Identifica la intención
    // ============================================
    async agentRouter(history: any, messageInput: string) {
        try {
            this.logger.log('🔍 Router: Analizando intención del usuario...',messageInput);

            const routerSession = this.client.chats.create({
                model: "gemini-3.5-flash",
                config: {
                    systemInstruction: `
                    Eres un agente router inteligente para la tienda de la señora Paula.
                    Tu ÚNICA tarea es identificar la intención del usuario y extraer datos relevantes.
                    
                    Intenciones posibles:
                    - register_debt: Usuario quiere registrar/anotar/guardar una deuda
                    - search_product: Usuario pregunta por un producto o precio
                    - check_debt: Usuario quiere saber cuánto debe
                    - contact_owner: Usuario quiere hablar con la dueña
                    - general_chat: Conversación general, saludos, despedidas
                    - close_conversation: Usuario se despide o termina la conversación
                    
                    Extrae datos como: productos, fechas, cantidades, montos.
                    Usa la herramienta [route-intent] SIEMPRE para responder.
                    `,
                    tools: [{
                        functionDeclarations: [routerTool]
                    }]
                },
                history 
            });

            const response = await routerSession.sendMessage({ message: messageInput});

            const functionCalls = response.functionCalls ?? [];
            if (functionCalls.length === 0) {
                // Fallback si no usa la herramienta
                return {
                    intent: 'general_chat',
                    confidence: 0.5,
                    extractedData: {}
                };
            }

            const routeResult = functionCalls[0].args;
            return routeResult;

        } catch (error) {
            this.logger.error(`❌ Error en agentRouter: ${error.message}`);
            return {
                intent: 'general_chat',
                confidence: 0.3,
                extractedData: {}
            };
        }
    }

    // ============================================
    // AGENTE EJECUTOR - Maneja la acción
    // ============================================
    async runAgentAI(history: any, messageInput: string, appId: string, userId: number,routeInfo?: any) {
        try {

            const day = dayjs().format('YYYY-MM-DD');


            // Determinar qué herramientas están disponibles según la intención
            const availableTools = this.tools.getToolsForIntent(routeInfo?.intent);

            const chatSession = this.client.chats.create({
                model: "gemini-3.5-flash",
                config: {
                    systemInstruction: `
                    Eres el asistente de la tienda de la señora Paula. 
                    Responde con mensajes cortos y amigables con emojis 😊
                    
                    Fecha actual: ${day}
                    
                    Funcionalidades disponibles:
                    - 📞 Contactar a la dueña: 593983258685
                    - 🔍 Buscar productos en inventario
                    - 💰 Consultar deudas pendientes
                    - 📝 Registrar nuevas deudas
                    
                    ${routeInfo?.extractedData ? `Datos extraídos: ${JSON.stringify(routeInfo.extractedData)}` : ''}
                    
                    Usa las herramientas disponibles cuando sea necesario.
                    Sé conciso y directo en tus respuestas.
                    `,
                    tools: [{
                        functionDeclarations: availableTools
                    }]
                },
                history
            });

            // Primera llamada: enviar mensaje del usuario
            let resp = await chatSession.sendMessage({ message: messageInput });

            // Si hay function calls, ejecutarlas
            const functionCalls = resp.functionCalls ?? [];
            if (functionCalls.length > 0) {
                const { name, args } = functionCalls[0];
                const toolResponse = await this.functions.executeTools(name, args, appId, userId);


                // Segunda llamada: enviar resultado de la herramienta
                resp = await chatSession.sendMessage({
                    message: [
                        {
                            functionResponse: {
                                name: name,
                                response: toolResponse
                            }
                        }
                    ]
                });
            }
            return {
                message: resp?.text,
                role: resp.candidates[0].content.role,
                responseId: resp?.responseId,
                intent: routeInfo?.intent,
                toolsUsed: functionCalls.map(fc => fc.name)
            };

        } catch (error) {
            // this.logger.error(`❌ Error en runAgentAI: ${error.message}`);
            throw error;
        }
    }



  
}