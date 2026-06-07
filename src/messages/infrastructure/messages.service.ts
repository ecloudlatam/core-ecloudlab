import { Injectable } from '@nestjs/common';
import { MessageRepository } from './messages.repository';

@Injectable()
export class MessageService {

    constructor(private readonly userReposity: MessageRepository ){}

    async create(body: any, appId: string): Promise<any>{

        const payload = {
            ...body,
            app_id: appId,
        };

        const data = await this.userReposity.create(payload)
        return {"status":data}
    }

    async findAll(): Promise<any>{
        return this.userReposity.findall()
    }
}
