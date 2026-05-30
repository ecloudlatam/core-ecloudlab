import { Module } from "@nestjs/common";
import { RouterModule } from "@nestjs/core";
import { AppsModule } from "./apps/apps.module";
import { UserModule } from "./users/user.module";
import { ProductsModules } from "./products/products.module";
import { CategoriesModule } from "./categories/categories.module";
import { ChatsModule } from "./chats/chat.module";
import { DoubtModule } from "./doubt/doubt.module";


@Module({
    imports: [
        AppsModule,
        UserModule,
        ChatsModule,
        ProductsModules,
        CategoriesModule,
        DoubtModule,
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
                path: "doubts",
                module: DoubtModule
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