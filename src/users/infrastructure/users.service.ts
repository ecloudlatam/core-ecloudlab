import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly userReposity: UsersRepository) {}

  async create(body: any, appId: string): Promise<any> {
    const payload = {
      ...body,
      app_id: appId,
    };

    const data = await this.userReposity.create(payload);
    return { status: data };
  }

  async findAll(): Promise<any> {
    return this.userReposity.findall();
  }

  async findOne(userId: number): Promise<any> {
    return await this.userReposity.findOne(userId);
  }
}
