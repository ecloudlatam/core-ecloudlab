import { Module } from "@nestjs/common";
import { DoubtController } from "./infraestructure/doubt.controllers";
import { DoubtService } from "./infraestructure/doubt.service";
import { AuthModule } from '@app/auth'
import { SupabaseLibModule } from "@app/supabase";
import { DoubtRepository } from "./infraestructure/doubt.repository";

@Module({
    imports: [
        AuthModule,
        SupabaseLibModule
    ],
    exports: [
        DoubtRepository
    ],
    providers: [
        DoubtService,
        DoubtRepository
    ],
    controllers: [DoubtController]
})

export class DoubtModule { }