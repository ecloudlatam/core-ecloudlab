import { Injectable, Logger } from '@nestjs/common';
import { DoubtRepository } from './doubt.repository';
import { assign } from 'lodash';

@Injectable()
export class DoubtService {
  constructor(private doubtRepository: DoubtRepository) {}

  private logger = new Logger(DoubtService.name);

  async findAll(appId: string) {
    try {
      const data = await this.doubtRepository.getAlls(appId);
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error(error);
    }
  }

  async create(appId: string, userId: number, payload: any): Promise<any> {
    const payloads = [];
    try {
      console.log('userId ===', userId);
      for (let index = 0; index < payload.length; index++) {
        const element = payload[index];
        const body = assign({ app_id: appId }, element);
        const data = await this.doubtRepository.create(body);
        payloads.push(data);
      }
      return payload;
    } catch (error) {
      this.logger.error(error);
    }
  }
}
