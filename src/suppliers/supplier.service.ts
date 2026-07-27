import { Injectable } from '@nestjs/common';
import { SuppliersRepository } from './supplier.repository';

@Injectable()
export class SupplierService {
  constructor(private readonly suppliersRepository: SuppliersRepository) {}

  async findOne(name: string): Promise<any> {
    return await this.suppliersRepository.findOne(name);
  }
}
