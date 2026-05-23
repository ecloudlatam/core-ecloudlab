import { Injectable } from "@nestjs/common";
import { SupabaseService } from "@app/supabase";
import { IAppsRepository } from "../domain/iapps.repository";
import { AuthService } from "shared/auth";
import { CreateAppDto } from "../domain/dtos/create-app.dto";


@Injectable()
export class AppRepository implements  IAppsRepository{

    constructor(private readonly supabaseService: SupabaseService,
        private readonly authService: AuthService
    ){}

    async create(nuevaApp: CreateAppDto): Promise<any> {

        try {
               const supabase = this.supabaseService.getClient();
               const token = this.authService.generate()

               const payload = {
                name: nuevaApp.name,
                status: nuevaApp.status,
                api_key_hash: token.apiKeyHash,
                api_key_hint: token.apiKeyHint
               }

        const {data} = await supabase.from("apps").insert([payload]).select();

        return {...data, secretApiKey: token.tokenLimpio}
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