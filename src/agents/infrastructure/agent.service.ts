import { Injectable } from '@nestjs/common';
import { AgentsRepository } from './agent.repository';
import { Type } from '@google/genai';

@Injectable()
export class AgentService {
  constructor(private readonly agentRepository: AgentsRepository) {}

  async findOne(slug: string) {
    return await this.agentRepository.fndOne(slug);
  }

  async findAgentTools(agent: any) {
    return await this.agentRepository.findAgentools(agent);
  }

  async findExec(agent: any) {
    const { data } = await this.agentRepository.findAgentools(agent);
    const { pivot_agents_tools } = data;
    return pivot_agents_tools.map(({ tools }: any) => {
      const properties: Record<string, any> = {};
      const requiredFields: string[] = [];

      tools.tools_parameters?.forEach((param: any) => {
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
        name: tools.name,
        description: tools.description,
        parameters: {
          type: Type.OBJECT,
          properties: properties,
          ...(requiredFields.length > 0 && { required: requiredFields }),
        },
      };
    });
  }
}
