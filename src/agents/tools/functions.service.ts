import { DoubtService } from 'src/doubt/infraestructure/doubt.service';
import { Injectable, Logger } from '@nestjs/common';
import { ProductsService } from 'src/products/infrastructure/products.service';
// import { CreateProductDto } from 'src/products/dto/create.dto';
import { CreditService } from 'src/credits/credit.service';
import { OrderService } from 'src/orders/orders.service';

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
    private readonly orderService: OrderService,
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
      case 'products_array_register':
        return await this.productService.createListProducts(
          args.products,
          appId,
        );
      case 'order_create':
        return await this.orderService.createList(args.products, appId);
      case 'barcodes_find':
        return await this.productService.findBarCode(JSON.parse(args.barcodes));
      case 'added-new-doubt':
        // TODO: Integrar con base de datos
        const { product, amount } = args;
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
