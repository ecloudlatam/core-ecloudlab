import { SupabaseLibModule, SupabaseService } from "@app/supabase";
import { Inject, Injectable } from "@nestjs/common";


@Injectable()
export class ProductsRepository {
    constructor(private readonly supabaseService: SupabaseService) { }
    async create(products: any) {
        console.log("products", products);

        try {
            const db = this.supabaseService.getClient()
            const data = await db.from("products").insert([products]).select()
            return data
        } catch (error) {
            console.log(error);

        }
    }

    async findAll(): Promise<any> {
        try {
            const db = this.supabaseService.getClient()
            return await db.from("products").select()
        } catch (error) {

        }
    }
}