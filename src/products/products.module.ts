import { Module } from "@nestjs/common";
import { ProductsControllers } from "./infrastructure/products.controllers";
import { SupabaseLibModule } from "@app/supabase";
import { ProductsRepository } from "./infrastructure/products.repository";
import { CategoriesRepository } from "src/categories/infrastructure/categories.repository";
import { AuthModule } from "@app/auth";
import { ProductsService } from "./infrastructure/products.service";

@Module({
    imports:[
        SupabaseLibModule,
        AuthModule
    ],
    providers:[
        ProductsRepository,
        CategoriesRepository,
        ProductsService
    ],
    controllers:[ProductsControllers],
    exports:[ProductsService]
})

export class ProductsModules { }