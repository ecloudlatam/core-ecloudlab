import { Controller, Get, Logger, Post, Req, UseGuards } from "@nestjs/common";
import { UsersService } from "../users.service";
import { ApiKeyGuard } from "src/guards";

@Controller()
@UseGuards(ApiKeyGuard)
export class UsersControllers{
    private readonly logger = new Logger(UsersControllers.name)

    constructor(private readonly userService: UsersService ){}

    @Get()
    async users(){
        return await this.userService.findAll()
    }

    @Post()
    async create(@Req() request: any){
        const app = request['apps']
        const body = {
            ...request.body,
            app_id: app.id
        }
        const resp = await this.userService.create(body)
        return resp
    }
}