import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { GoogleGenAI, Type } from '@google/genai';
import { FunctionService } from '../../../agents/tools/functions.service';
import { PromptTemplate } from '@langchain/core/prompts';

@Injectable()
export class GeminiService implements OnModuleInit {
  protected readonly logger = new Logger(GeminiService.name);
  private client: GoogleGenAI;

  constructor(private readonly functions: FunctionService) {}

  onModuleInit() {
    this.client = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
  }

  // ============================================
  // AGENTE ROUTER - Identifica la intención
  // ============================================
  async agentRouter(
    history: any,
    messageInput: any,
    userId: number,
    agent: any,
  ) {
    try {
      const { model, prompt } = agent;

      const promptTemplate = PromptTemplate.fromTemplate(prompt);

      const systemInstruction = await promptTemplate.format({
        name: '',
      });
      const routerSession = this.client.chats.create({
        model,
        config: {
          systemInstruction,
          tools: [
            {
              functionDeclarations: [
                {
                  name: 'route-intent',
                  description:
                    '"Identifica la intención del usuario y determina qué agente especializado debe manejar la solicitud',
                  parameters: {
                    type: Type.OBJECT,
                    required: ['intent', 'confidence'],
                    properties: {
                      intent: {
                        enum: agent.config,
                        type: Type.STRING,
                      },
                      confidence: {
                        type: Type.NUMBER,
                        description: 'Nivel de confianza de la intención (0-1)',
                      },
                      extractedData: {
                        type: Type.OBJECT,
                        description:
                          'Datos extraídos del mensaje del usuario (productos, fechas, cantidades, etc.)',
                      },
                    },
                  },
                },
              ],
            },
          ],
        },
        history,
      });

      const response = await routerSession.sendMessage({
        message: messageInput,
      });

      const functionCalls = response.functionCalls ?? [];
      if (functionCalls.length === 0) {
        // Fallback si no usa la herramienta
        return {
          intent: 'general_chat',
          confidence: 0.5,
          extractedData: {},
        };
      }

      const routeResult = functionCalls[0].args;

      return routeResult;
    } catch (error) {
      console.log('error ==', error);
      return {
        intent: 'general_chat',
        confidence: 0.3,
        extractedData: {},
      };
    }
  }

  mapTools(pivotAgentsTools: any[]) {
    return pivotAgentsTools.map((item) => {
      const tool = item.tools;

      const properties: Record<string, any> = {};
      const requiredFields: string[] = [];

      tool.tools_parameters?.forEach((param: any) => {
        let paramType = Type.STRING;
        if (param.type?.toUpperCase() === 'NUMBER') paramType = Type.NUMBER;
        if (param.type?.toUpperCase() === 'BOOLEAN') paramType = Type.BOOLEAN;
        if (param.type?.toUpperCase() === 'ARRAY') paramType = Type.ARRAY;
        if (param.type?.toUpperCase() === 'OBJECT') paramType = Type.OBJECT;

        properties[param.key] = {
          type: paramType,
          description: param.description,
          ...(param.type === 'ARRAY' && { items: { type: Type.STRING } }),
        };

        // Si tienes un flag 'required' en la BD lo agregas aquí; de lo contrario agrega las claves necesarias
        if (param.is_required) {
          requiredFields.push(param.key);
        }
      });

      // 2. Retornar el objeto de la Tool con la estructura requerida por Gemini
      return {
        name: tool.name,
        description: tool.description,
        parameters: {
          type: Type.OBJECT,
          properties: properties,
          ...(requiredFields.length > 0 && { required: requiredFields }),
        },
      };
    });
  }

  // ============================================
  // AGENTE EJECUTOR - Maneja la acción
  // ============================================
  async agentPrincipal(
    history: any,
    messageInput: any,
    appId: string,
    userId: number,
    routeInfo: any,
    values: any,
  ) {
    try {
      const { model, prompt, pivot_agents_tools } = values;

      const tools = this.mapTools(pivot_agents_tools);

      const promptTemplate = PromptTemplate.fromTemplate(prompt);

      const systemInstruction = await promptTemplate.format({
        extractedData: '',
      });

      const chatSession = this.client.chats.create({
        model,
        config: {
          systemInstruction,
          tools: [
            {
              functionDeclarations: tools,
            },
          ],
        },
        history,
      });

      // Primera llamada: enviar mensaje del usuario
      let resp = await chatSession.sendMessage({
        message: messageInput,
      });

      const toolsUsed: string[] = [];

      // 2. CAMBIAMOS IF POR WHILE para manejar llamadas encadenadas
      while (resp.functionCalls && resp.functionCalls.length > 0) {
        const { name, args } = resp.functionCalls[0];
        toolsUsed.push(name);

        const toolResponse = await this.functions.executeTools(
          name,
          args,
          appId,
          userId,
        );

        // Segunda llamada (o subsiguientes): enviar resultado de la herramienta
        resp = await chatSession.sendMessage({
          message: [
            {
              functionResponse: {
                name: name,
                response: toolResponse,
              },
            },
          ],
        });
      }

      // 3. Extracción segura del texto final de Gemini
      const responseMessage = resp?.text ?? '';

      return {
        message:
          responseMessage.trim() ||
          'no se logre comprender, porfavor puedes volver a indicarme gracias',
        role: resp.candidates[0].content.role,
        responseId: resp?.responseId,
        intent: routeInfo?.intent,
        toolsUsed,
      };
    } catch (error) {
      console.log('error', error);
      // this.logger.error(`❌ Error en runAgentAI: ${error.message}`);
      throw error;
    }
  }
}
