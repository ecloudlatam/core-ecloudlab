import { Controller, Post } from "@nestjs/common";
import { ClientService } from "./client.service";


@Controller()
export class ClientController{
    constructor(private readonly clientService: ClientService){}

    @Post()
    async create(){

    }
}