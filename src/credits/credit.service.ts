import { Injectable } from '@nestjs/common';
import { CreditsRepository } from './credit.repository';

@Injectable()
export class CreditService {
  constructor(private readonly creditsRepository: CreditsRepository) {}

  async create(body: any, appId: string): Promise<any> {
    const payload = {
      ...body,
      app_id: appId,
    };

    const data = await this.creditsRepository.create(payload);
    return { status: data };
  }

  async findAll(): Promise<any> {
    return this.creditsRepository.findall();
  }

  async findOne(userId: number): Promise<any> {
    return await this.creditsRepository.findOne(userId);
  }
}
