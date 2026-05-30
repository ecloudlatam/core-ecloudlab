import { DoubtService } from "src/doubt/infraestructure/doubt.service";
import * as dayjs from 'dayjs';
import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class FunctionService {

    constructor(private readonly doubtService: DoubtService) { }
    protected readonly logger = new Logger(FunctionService.name)

    async executeTools(functionName: string, args: Record<string, any>, appId: string, userId: number) {

        switch (functionName) {
            case "search-product":
                // TODO: Integrar con base de datos real
                return {
                    success: true,
                    product: {
                        id: 1,
                        name: args.productName,
                        price: 2.50,
                        stock: 10
                    }
                };

            case "added-new-doubt":
                // TODO: Integrar con base de datos real
                const { date, product, quantity, amount } = args;

                const data = await this.doubtService.create(appId, userId, [{ name: product, price: amount }])
                if (!data) return { message: "error en guardar los datos" }
                return { message: data }

            case "check-debt":
               
                const allDoubts = await this.doubtService.findAll(appId)


                return {
                   message: "deudas generales",
                   allDoubts
                };

            default:
                return {
                    success: false,
                    error: `Herramienta no encontrada: ${functionName}`
                };
        }
    }
}

