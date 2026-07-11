import { Injectable } from "@nestjs/common";
import {SupabaseService} from '@app/supabase'

@Injectable()
export class UsersRepository {

    constructor(private readonly supabaseService: SupabaseService ){}

    async findall(): Promise<any> {
        try {
            const supabase = this.supabaseService.getClient()
            const data = await supabase.from("users").select("*")
            return data 
        } catch (error) {
            
        }
    }

    async create(body: any){
        try {
            const supabase = this.supabaseService.getClient()
            const data = await supabase.from("users").insert([body]).select()
            return data
        } catch (error) {
            
        }
    }

    async findOne(userId: number){
        try{
            const supabase = this.supabaseService.getClient()
            const data = await supabase.from('users')
            return data
        }catch(error){

        }
    }
} 