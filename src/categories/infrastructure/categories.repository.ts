import { SupabaseService } from "@app/supabase";
import { Injectable, Logger } from "@nestjs/common";
import { CategoriesDto } from "../domain/dtos/create-category.dto";


@Injectable()
export class CategoriesRepository{

    private readonly logger = new Logger(CategoriesRepository.name)

    constructor(private readonly supabase: SupabaseService){
    }

    async create(categories: any){
        const db = this.supabase.getClient()
        const data = await db.from("categories").insert([categories]).select()
                    this.logger.log(data)

        return data
    }
}