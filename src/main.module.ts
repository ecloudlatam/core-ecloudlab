import { Module } from "@nestjs/common";
import { RouterModule } from "@nestjs/core";
import { AppModule } from "./app/app.module";


@Module({
    imports:[
        AppModule,
        RouterModule.register([
        {
            path:"apps",
            module: AppModule
        }
    ])
    ],
})


export class MainModule{}