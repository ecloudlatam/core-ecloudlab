import { Injectable } from "@nestjs/common";
import { AgentsRepository } from "./agent.repository";


@Injectable()
export class AgentService {
    constructor(private readonly agentRepository: AgentsRepository){

    }


    async findOne(slug: string){
        return this.agentRepository.fndOne(slug)
    }
}