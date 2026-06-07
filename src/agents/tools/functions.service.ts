import { DoubtService } from "src/doubt/infraestructure/doubt.service";
import * as dayjs from 'dayjs';
import { Injectable, Logger } from "@nestjs/common";
import { ProductsService } from "src/products/infrastructure/products.service";


type ApiResponse<T = void> = {
    success: boolean;
    data?: T
}

@Injectable()
export class FunctionService {

    constructor(private readonly doubtService: DoubtService,
        private readonly productService: ProductsService
    ) { }
    protected readonly logger = new Logger(FunctionService.name)

    async executeTools(functionName: string, args: Record<string, any>, appId: string, userId: number): Promise<ApiResponse<any>> {

        switch (functionName) {
            case "search-product":
                return this.productService.findAll();
            case "added-product":
                const { name, description, price } = args
                return await this.productService.create({ name, description, price, category_id: "ecc8ee5e-a56c-4a55-ac03-6f6d27dc52dc" }, appId)
            case "added-new-doubt":
                // TODO: Integrar con base de datos real
                const { date, product, quantity, amount } = args;
                return await this.doubtService.create(appId, userId, [{ name: product, price: amount }])
            case "check-debt":
                return await this.doubtService.findAll(appId)
            default:
                return {
                    success: false,
                    data: {
                        message: " `Herramienta no encontrada: ${functionName}`"
                    }
                };
        }
    }
}

