import { SupabaseLibModule, SupabaseService } from "@app/supabase";
import { Inject, Injectable } from "@nestjs/common";




@Injectable()
export class ProductsRepository {
    constructor(private readonly supabaseService: SupabaseService) { }
    async create(products: any) {
        const db = this.supabaseService.getClient()
        const data = await db.from("products").insert([products]).select()
        return data
    }
}