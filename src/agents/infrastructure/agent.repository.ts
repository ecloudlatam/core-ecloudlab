import { SupabaseService } from "@app/supabase";
import { Injectable } from "@nestjs/common";
import { head } from "lodash";

@Injectable()
export class AgentsRepository {
    constructor(private readonly supabaseService: SupabaseService) { }

    async findAll() {

        try {
            const db = this.supabaseService.getClient()
            const agent = await db.from("agents").select()
            return agent
        } catch (error) {
            console.log(error)
            throw new Error(error)
        }

    }

    async fndOne(slug: string) {
        try {
            const db = this.supabaseService.getClient()
            const { data } = await db.from("agents").select().eq("slug", slug)
            return head(data) ?? {}
        } catch (error) {

        }
    }
}