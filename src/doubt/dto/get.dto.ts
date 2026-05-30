import { IsString } from "class-validator";


export class getDoubtsDto{
    @IsString()
    name: string
}