import { SupabaseLibModule, SupabaseService } from "@app/supabase";
import { Injectable } from "@nestjs/common";


@Injectable()
export class ClientRepository{
    constructor(private supabase: SupabaseService){}

    async create(){
        const db = this.supabase.getClient()
    }
}