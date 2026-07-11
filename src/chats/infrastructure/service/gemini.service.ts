import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { GoogleGenAI, Type } from "@google/genai";
import { AwsService } from "src/shared/aws.service";
import { routerTool, ToolService } from "../../../agents/tools/parameters.service";
import * as dayjs from 'dayjs';
import { FunctionService } from "../../../agents/tools/functions.service";
import { PromptTemplate } from "@langchain/core/prompts"
import { AgentService } from "src/agents/infrastructure/agent.service";



@Injectable()
export class GeminiService implements OnModuleInit {


    protected readonly logger = new Logger(GeminiService.name)
    private client: GoogleGenAI

    constructor(private readonly awsService: AwsService,
        private readonly tools: ToolService,
        private readonly functions: FunctionService,
        private readonly agentService: AgentService
    ) { }

    onModuleInit() {
        this.client = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY })
    }

    // ============================================
    // AGENTE ROUTER - Identifica la intención
    // ============================================
    async agentRouter(history: any, messageInput: any) {
        try {
            const { model, prompt } = await this.agentService.findOne("router_intent")

            const promptTemplate = PromptTemplate.fromTemplate(prompt)

            const systemInstruction = await promptTemplate.format({
                name: "paula"
            })
            const routerSession = this.client.chats.create({
                model,
                config: {
                    systemInstruction,
                    tools: [{
                        functionDeclarations: [routerTool]
                    }]
                },
                history
            });

            const response = await routerSession.sendMessage({ message: messageInput });

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
    async agentPrincipal(history: any, messageInput: any, appId: string, userId: number, routeInfo?: any) {
        try {
            const day = dayjs().format('YYYY-MM-DD');
            // Determinar qué herramientas están disponibles según la intención
            const availableTools = this.tools.getToolsForIntent(routeInfo?.intent);

            const { model, prompt } = await this.agentService.findOne("agent_ecommerce")

            const promptTemplate = PromptTemplate.fromTemplate(prompt)

            const systemInstruction = await promptTemplate.format({
                name: "paula",
                day,
                extractedData: routeInfo?.extractedData ? `${JSON.stringify(routeInfo.extractedData)}` : ''
            })

            const chatSession = this.client.chats.create({
                model,
                config: {
                    systemInstruction,
                    tools: [{
                        functionDeclarations: availableTools
                    }],
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            message: {
                                type: Type.STRING,
                                description: "El mensaje de texto amigable que se le enviará al cliente por WhatsApp."
                            },
                            type:{
                                type: Type.STRING,
                                description:"contenido de los mensajes [text, img, docs, locations]",
                            },
                            imageUrl: {
                                type: Type.STRING,
                                description: "La URL pública o ID de la imagen del producto si el cliente solicitó ver un producto o si la herramienta la devolvió. De lo contrario, dejar vacío o null."
                            }
                        },
                        required: ['message','type']
                    }
                },
                history
            });

            // Primera llamada: enviar mensaje del usuario
            let resp = await chatSession.sendMessage({
                message: messageInput
            });
            // Si hay function calls, ejecutarlas
            const functionCalls = resp.functionCalls ?? [];
            if (functionCalls.length > 0) {
                const { name, args } = functionCalls[0];
                console.log("name", name)
                const toolResponse = await this.functions.executeTools(name, args, appId, userId);

                console.log("toolResponse=====", toolResponse);


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

            // Extraer el mensaje de respuesta y asegurar que no esté vacío
            const responseMessage = resp?.text ?? resp?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

            return {
                message: responseMessage.trim() || "Operación completada exitosamente",
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