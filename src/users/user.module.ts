import { Module } from "@nestjs/common";
import { UsersControllers } from "./infrastructure/users.controller";
import { SupabaseLibModule } from "@app/supabase";
import { UsersService } from "./infrastructure/users.service";
import { UsersRepository } from "./infrastructure/users.repository";
import {AuthModule} from "@app/auth"

@Module({
    providers:[
        UsersService,
        UsersRepository,
    ],
    controllers:[UsersControllers],
    imports:[
        SupabaseLibModule,
        AuthModule
    ],
})

export class UserModule{}