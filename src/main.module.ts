import { Module } from "@nestjs/common";
import { RouterModule } from "@nestjs/core";
import { AppsModule } from "./apps/apps.module";
import { UserModule } from "./users/user.module";
import { ProductsModules } from "./products/products.module";
import { CategoriesModule } from "./categories/categories.module";
import { ChatsModule } from "./chats/chat.module";


@Module({
    imports: [
        AppsModule,
        UserModule,
        ChatsModule,
        ProductsModules,
        CategoriesModule,
        RouterModule.register([
            {
                path: "apps",
                module: AppsModule
            },
            {
                path: "users",
                module: UserModule
            },
             {
                path: "chats",
                module: ChatsModule
            },
            {
                path: "products",
                module: ProductsModules
            },
            {
                path: "categories",
                module: CategoriesModule

            },
            {
                path:"products",
                module: ProductsModules
            }
        ])
    ],
})


export class MainModule { }