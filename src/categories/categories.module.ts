import { Module } from "@nestjs/common";
import { CategoriesController } from "./controllers/categories.controller";
import { AuthModule } from "@app/auth";
import { CategoriesService } from "./categories.service";
import { CategoriesRepository } from "./infrastructure/categories.repository";
import { SupabaseLibModule } from "@app/supabase";


@Module({
    providers:[
        CategoriesService,
        CategoriesRepository
    ],
    imports:[
        SupabaseLibModule,
        AuthModule
    ],
    controllers:[CategoriesController]
})

export class CategoriesModule {}