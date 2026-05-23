import { Injectable } from "@nestjs/common";
import { SupabaseService } from "@app/supabase";
import { IAppsRepository } from "../domain/iapps.repository";


@Injectable()
export class AppRepository implements  IAppsRepository{

    constructor(private readonly supabaseService: SupabaseService){}

    async create(nuevaApp: any): Promise<any> {

        try {
               const supabase = this.supabaseService.getClient();

        const {data} = await supabase.from("apps").insert([nuevaApp]).select();

        return data
        } catch (error) {
            console.log(error)
        }
     
    }

   async findAll() {
    // Si lo de arriba está bien, esto ya no será undefined
    const supabase = this.supabaseService.getClient(); 
    const { data, error } = await supabase.from('apps').select('*');
    if (error) throw new Error(error.message);
    return data;
  }
}