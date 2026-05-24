import { Injectable } from '@nestjs/common';
import { UsersRepository } from './infrastructure/users.repository';

@Injectable()
export class UsersService {

    constructor(private readonly userReposity: UsersRepository ){}

    async create(body: any, appId: string): Promise<any>{

        // Aquí construyes el objeto final unificado
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
