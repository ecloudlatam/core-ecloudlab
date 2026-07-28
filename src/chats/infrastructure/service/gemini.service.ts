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
    config: any,
  ) {
    try {
      console.log('agent ===', agent, userId);
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
              functionDeclarations: [config],
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
      console.log('values ===', values);
      const { model, prompt, pivot_agents_tools } = values;

      const tools = this.mapTools(pivot_agents_tools);

      console.log('tools ====', JSON.stringify(tools));

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
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              message: {
                type: Type.STRING,
                description:
                  'El mensaje de texto amigable que se le enviará al cliente por WhatsApp.',
              },
              type: {
                type: Type.STRING,
                description:
                  'contenido de los mensajes [text, img, docs, locations]',
              },
              imageUrl: {
                type: Type.STRING,
                description:
                  'La URL pública o ID de la imagen del producto si el cliente solicitó ver un producto o si la herramienta la devolvió. De lo contrario, dejar vacío o null.',
              },
            },
            required: ['message', 'type'],
          },
        },
        history,
      });

      // Primera llamada: enviar mensaje del usuario
      let resp = await chatSession.sendMessage({
        message: messageInput,
      });

      // Si hay function calls, ejecutarlas
      const functionCalls = resp.functionCalls ?? [];
      if (functionCalls.length > 0) {
        const { name, args } = functionCalls[0];
        const toolResponse = await this.functions.executeTools(
          name,
          args,
          appId,
          userId,
        );

        // Segunda llamada: enviar resultado de la herramienta
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

      // Extraer el mensaje de respuesta y asegurar que no esté vacío
      const responseMessage =
        resp?.text ?? resp?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

      return {
        message: responseMessage.trim() || 'Operación completada exitosamente',
        role: resp.candidates[0].content.role,
        responseId: resp?.responseId,
        intent: routeInfo?.intent,
        toolsUsed: functionCalls.map((fc) => fc.name),
      };
    } catch (error) {
      console.log('error', error);
      // this.logger.error(`❌ Error en runAgentAI: ${error.message}`);
      throw error;
    }
  }
}
