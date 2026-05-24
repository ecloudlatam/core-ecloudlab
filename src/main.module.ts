import { Module } from "@nestjs/common";
import { RouterModule } from "@nestjs/core";
import { AppsModule } from "./apps/apps.module";
import { UserModule } from "./users/user.module";


@Module({
    imports:[
        AppsModule,
        UserModule,
        RouterModule.register([
        {
            path:"apps",
            module: AppsModule
        },
        {
            path:"users",
            module: UserModule
        }
    ])
    ],
})


export class MainModule{}