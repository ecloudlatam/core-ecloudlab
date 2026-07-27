import { DoubtService } from 'src/doubt/infraestructure/doubt.service';
import * as dayjs from 'dayjs';
import { Injectable, Logger } from '@nestjs/common';
import { ProductsService } from 'src/products/infrastructure/products.service';
import { assign } from 'lodash';
import { CreateProductDto } from 'src/products/dto/create.dto';
import { CreditService } from 'src/credits/credit.service';

type ApiResponse<T = void> = {
  success: boolean;
  data?: T;
};

@Injectable()
export class FunctionService {
  constructor(
    private readonly doubtService: DoubtService,
    private readonly productService: ProductsService,
    private readonly creditService: CreditService,
  ) {}
  protected readonly logger = new Logger(FunctionService.name);

  async executeTools(
    functionName: string,
    args: Record<string, any>,
    appId: string,
    userId: number,
  ): Promise<ApiResponse<any>> {
    switch (functionName) {
      case 'credit_get_all':
        return await this.creditService.findAll();
      case 'credit_register':
        return await this.creditService.create(args, appId);
      case 'product_find_all':
        return await this.productService.findAll();
      case 'product_find_one':
        return await this.productService.searchProducts(args.name, args.type);
      case 'product_register':
        const addedProd = assign(args, {
          images: [args.images ?? ''],
        }) as CreateProductDto;
        return await this.productService.create(addedProd, appId);
      case 'products_array_register':
        return this.productService.createListProducts(args.products, appId);
      case 'added-new-doubt':
        // TODO: Integrar con base de datos real
        const { date, product, quantity, amount } = args;
        return await this.doubtService.create(appId, userId, [
          { name: product, price: amount },
        ]);
      case 'check-debt':
        return await this.doubtService.findAll(appId);
      default:
        return {
          success: false,
          data: {
            message: ' `Herramienta no encontrada: ${functionName}`',
          },
        };
    }
  }
}
