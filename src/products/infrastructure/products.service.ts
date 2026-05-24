import { Injectable, Logger } from "@nestjs/common";
import { ProductsRepository } from "./products.repository";
import { CategoriesRepository } from "src/categories/infrastructure/categories.repository";
import { CreateProductDto } from "../dto/create.dto";

@Injectable()
export class ProductsService {

    private readonly logger = new Logger(ProductsService.name)

    constructor(private readonly productsRepository: ProductsRepository,
        private readonly categoryRepository: CategoriesRepository

    ) { }

    async create(products: CreateProductDto, appId: string) {
        
        const category = await this.categoryRepository.findone(products.category_id)

        if (!category) {
            throw new Error("not found category")
        }

        const payload = {
            category_id: category.id,
            app_id: appId,
            slug: products.name.replaceAll(" ","-"),
            ...products
        }
        const data = await this.productsRepository.create(payload)
        return data
    }



}