import { Body, Controller, Get, Logger, Post, Req, UseGuards } from "@nestjs/common";

import { ApiKeyGuard } from "src/guards";
import { CreateProductDto } from "../dto/create.dto";
import { ProductsService } from "./products.service";

@Controller()
@UseGuards(ApiKeyGuard)
export class ProductsControllers {
    private readonly logger = new Logger(ProductsControllers.name);

    constructor(private readonly productsService: ProductsService) { }

    @Post()
    async create(@Req() request, @Body() products: CreateProductDto) {
        try {
            const app = request['apps']

            const data = await this.productsService.create(products, app.id);
            return data
        } catch (error) {

        }
    }
}